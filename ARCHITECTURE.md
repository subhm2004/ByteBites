# ByteBites — System Architecture

> Diagrams match the **actual codebase** as of the latest build. View in Cursor/GitHub (Mermaid preview) or paste into [mermaid.live](https://mermaid.live).

**Related docs:** [README.md](./README.md) (features + setup) · [VIVA_DOCUMENTATION.md](./VIVA_DOCUMENTATION.md) (viva prep)

---

## Table of Contents

1. [High-level system](#1-high-level-system)
2. [MongoDB — collections & ownership](#2-mongodb--collections--ownership)
3. [Auth service](#3-auth-service)
4. [Payment flow](#4-payment-flow)
5. [Order lifecycle](#5-order-lifecycle)
6. [Smart rider dispatch](#6-smart-rider-dispatch)
7. [Rider delivery & earnings](#7-rider-delivery--earnings)
8. [Coupon & discount engine (LLD)](#8-coupon--discount-engine-lld)
9. [Dynamic ETA system](#9-dynamic-eta-system)
10. [Reviews & ratings](#10-reviews--ratings)
11. [Realtime — Socket.IO](#11-realtime--socketio)
12. [Utils service](#12-utils-service)
13. [Admin service](#13-admin-service)
14. [Restaurant API map](#14-restaurant-api-map)
15. [RabbitMQ queues](#15-rabbitmq-queues)
16. [Shared secrets & ports](#16-shared-secrets--ports)
17. [Startup order](#17-startup-order)
18. [Cloud deployment](#18-cloud-deployment)
19. [Known limitations](#19-known-limitations)

---

## 1. High-level system

```mermaid
flowchart TB
    subgraph Client["Browser"]
        FE["Frontend :5173<br/>React 19 + Vite + Socket.IO<br/>Leaflet + Recharts + jsPDF"]
    end

    subgraph Backend["Node.js microservices"]
        AUTH["Auth :5007<br/>/api/auth"]
        REST["Restaurant :5001<br/>/restaurant, /item, /cart<br/>/address, /order, /coupon, /review"]
        UTILS["Utils :5002<br/>/api/upload, /api/payment"]
        RT["Realtime :5004<br/>WebSocket + /api/v1/internal/emit"]
        RIDER["Rider :5005<br/>/api/rider"]
        ADMIN["Admin :5006<br/>/api/v1"]
    end

    subgraph Storage["Data & messaging"]
        MONGO[("MongoDB Atlas<br/>DB: DB_NAME env")]
        RMQ{{"RabbitMQ<br/>payment_event<br/>order_ready_queue<br/>rider_queue*"}}
    end

    subgraph External["Third-party"]
        GOOGLE["Google OAuth"]
        CLOUD["Cloudinary"]
        STRIPE["Stripe"]
        RAZOR["Razorpay"]
        OSRM["OSRM Routing"]
        NOM["Nominatim Geocoding"]
    end

    FE -->|"HTTP + Bearer JWT"| AUTH & REST & RIDER & ADMIN
    FE -->|"HTTP"| UTILS
    FE -->|"WebSocket auth.token=JWT"| RT
    FE --> OSRM & NOM

    AUTH & REST & RIDER -->|"mongoose"| MONGO
    ADMIN -->|"mongodb driver"| MONGO

    UTILS -->|"publish PAYMENT_SUCCESS"| RMQ
    REST -->|"consume payment_event"| RMQ
    REST -->|"publish ORDER_READY_FOR_RIDER"| RMQ
    RIDER -->|"consume order_ready_queue"| RMQ

    AUTH --> GOOGLE
    UTILS --> CLOUD & STRIPE & RAZOR

    REST -->|"internal emit"| RT
    RIDER -->|"internal emit"| RT
    REST -->|"upload, order APIs"| UTILS & RIDER
    RIDER -->|"assign/status/earnings"| REST
```

> `rider_queue` is asserted in RabbitMQ config but has **no producer/consumer** yet.

---

## 2. MongoDB — collections & ownership

```mermaid
flowchart LR
    MONGO[("MongoDB Atlas<br/>DB_NAME env")]

    AUTH -->|"users"| MONGO
    REST -->|"restaurants, menuitems, carts,<br/>addresses, orders, reviews,<br/>riderreviews, coupons"| MONGO
    RIDER -->|"riders"| MONGO
    ADMIN -->|"users, restaurants, riders,<br/>coupons (direct writes)"| MONGO
```

| Collection | Primary Service | Key Fields / Indexes |
|------------|-----------------|----------------------|
| `users` | Auth, Admin | email, role, **isBanned** |
| `restaurants` | Restaurant, Admin | autoLocation (**2dsphere**), isOpen, isVerified, **avgRating**, reviewCount |
| `menuitems` | Restaurant | restaurantId, name, price, image, isAvailable |
| `carts` | Restaurant | userId + restaurantId + itemId (compound unique) |
| `addresses` | Restaurant | location (**2dsphere**), formattedAddress |
| `orders` | Restaurant (+ Rider via HTTP) | status, payment, coupon, rider, distance, riderAmount, **expiresAt TTL** |
| `riders` | Rider, Admin | location (**2dsphere**), isVerified, isAvailble, **avgRating**, reviewCount |
| `reviews` | Restaurant | restaurantId, orderId (**unique**), rating 1–5 |
| `riderreviews` | Restaurant | riderId, orderId (**unique**), rating 1–5 |
| `coupons` | Restaurant (read), Admin (CRUD) | code, type, value, limits, expiresAt, isActive, usedCount |

---

## 3. Auth service

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend :5173
    participant G as Google OAuth
    participant A as Auth :5007
    participant DB as MongoDB
    participant RT as Realtime :5004

    U->>FE: Click "Continue with Google"
    FE->>G: OAuth auth-code flow
    G-->>FE: authorization code
    FE->>A: POST /api/auth/login { code }
    A->>G: getToken + userinfo
    A->>DB: User.findOne or User.create
    alt isBanned = true
        A-->>FE: 403 Account suspended
    else OK
        A-->>FE: JWT (15d) + user JSON
    end
    FE->>FE: localStorage.setItem("token")

    U->>FE: Choose role customer / seller / rider
    FE->>A: PUT /api/auth/add/role { role }
    Note over A: admin NOT allowed via API
    A->>DB: update user.role
    A-->>FE: new JWT + user

    FE->>RT: Socket connect auth: { token: JWT }
    RT->>RT: verify JWT with JWT_SEC
    RT->>RT: join user:{userId}
    RT->>RT: if seller join restaurant:{restaurantId}
```

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Google OAuth login |
| PUT | `/api/auth/add/role` | JWT | Assign customer / seller / rider |
| GET | `/api/auth/me` | JWT | Profile + ban check |

> **Note:** Auth port is **5007** locally (macOS AirPlay blocks 5000). `frontend/src/main.tsx` points to `:5007`.

---

## 4. Payment flow

```mermaid
sequenceDiagram
    actor U as Customer
    participant FE as Frontend
    participant R as Restaurant :5001
    participant CE as CouponEngine
    participant U2 as Utils :5002
    participant PG as Razorpay / Stripe
    participant Q as RabbitMQ payment_event
    participant RT as Realtime :5004
    participant DB as MongoDB

    U->>FE: Checkout — select address, apply coupon
    FE->>R: POST /api/coupon/validate { code, subtotal }
    R->>CE: apply(code, context)
    CE-->>FE: discount preview + updated total

    FE->>R: POST /api/order/new { couponCode, addressId, paymentMethod }
    R->>CE: apply() again at create time
    R->>DB: Order.create (pending, expiresAt +15min)
    R->>DB: Cart.deleteMany
    R-->>FE: orderId, amount

    FE->>U2: POST /api/payment/create OR /stripe/create
    U2->>R: GET /api/order/payment/:id (x-internal-key)
    U2->>PG: create payment session
    U->>PG: Pay
    FE->>U2: POST verify
    U2->>Q: publish PAYMENT_SUCCESS { orderId, paymentId }

    Q->>R: payment.consumer
    R->>DB: paymentStatus=paid, unset expiresAt
    R->>CE: recordUsage(couponId) if coupon applied
    R->>RT: emit order:new → restaurant:{restaurantId}
    RT-->>FE: Seller hears quack.mp3 + new order card
```

**Fee model (order creation):**

| Fee | Rule |
|-----|------|
| Delivery | ₹49 if subtotal < ₹250, else ₹0 |
| Platform | ₹7 |
| Discount | CouponEngine result |
| Rider payout | `ceil(distance_km) × ₹17` |

---

## 5. Order lifecycle

```mermaid
stateDiagram-v2
    [*] --> placed: createOrder (payment pending)
    placed --> placed: payment consumer → paid
    placed --> accepted: seller accepts
    placed --> cancelled: seller cancels
    accepted --> preparing: seller starts cooking
    accepted --> cancelled: seller cancels
    preparing --> ready_for_rider: food ready
    preparing --> cancelled: seller cancels
    ready_for_rider --> rider_assigned: rider accepts
    rider_assigned --> picked_up: rider picks up
    picked_up --> delivered: rider delivers
    delivered --> [*]: customer can review
    cancelled --> [*]

    note right of placed
        TTL index: unpaid orders
        auto-delete after 15 min
    end note
```

### Seller status update

```mermaid
sequenceDiagram
    participant FE as Seller Dashboard
    participant R as Restaurant :5001
    participant RT as Realtime :5004
    participant Q as RabbitMQ

    FE->>R: PUT /api/order/:orderId { status }
    R->>R: validate SELLER_STATUS_TRANSITIONS
    R->>RT: emit order:update → user:{customerId}

    alt status = ready_for_rider
        R->>Q: ORDER_READY_FOR_RIDER { orderId, restaurantId, location }
    end
```

**Allowed seller transitions:**

| From | To |
|------|-----|
| `placed` | `accepted`, `cancelled` |
| `accepted` | `preparing`, `cancelled` |
| `preparing` | `ready_for_rider`, `cancelled` |

---

## 6. Smart rider dispatch

Previously all nearby riders received `order:available` simultaneously. **Current implementation:** sequential nearest-first dispatch with 10-second accept window per rider.

```mermaid
sequenceDiagram
    participant Q as RabbitMQ order_ready_queue
    participant RD as Rider :5005 consumer
    participant DB as MongoDB
    participant RT as Realtime :5004
    participant R as Restaurant :5001
    participant FE as Rider App

    Q->>RD: ORDER_READY_FOR_RIDER
    RD->>DB: $geoNear — riders within RIDER_DISPATCH_RADIUS_M<br/>isAvailble=true, isVerified=true<br/>sorted by distance ASC

    loop Sequential dispatch (index = 0, 1, 2…)
        RD->>RT: emit order:available → user:{nearestRider.userId}
        RT-->>FE: Alert + faaah.mp3 sound
        RD->>RD: wait 10 seconds
        RD->>R: GET /api/order/rider/dispatch/:orderId
        alt order still unassigned
            RD->>RD: offer to next nearest rider
        else rider accepted or cancelled
            RD->>RD: stop dispatch chain
        end
    end
```

| Parameter | Value |
|-----------|-------|
| Search radius | `RIDER_DISPATCH_RADIUS_M` env (default **5000m** locally) |
| Offer timeout | 10 seconds per rider |
| Sort order | Nearest first (`$geoNear` + `$sort distance ASC`) |
| Requirements | `isVerified: true`, `isAvailble: true`, valid GeoJSON `location` |

---

## 7. Rider delivery & earnings

### Accept & deliver

```mermaid
sequenceDiagram
    participant FE as Rider App
    participant RD as Rider :5005
    participant R as Restaurant :5001
    participant RT as Realtime :5004

    FE->>RD: POST /api/rider/accept/:orderId
    RD->>R: PUT /api/order/assign/rider (x-internal-key)
    R->>RT: emit order:rider_assigned
    RD->>RD: isAvailble = false

    loop Every 10s during delivery
        FE->>RT: POST /internal/emit rider:location
        RT-->>FE: Customer OrderPage map updates
    end

    FE->>RD: PUT /api/rider/order/update/:orderId
    Note over RD,R: rider_assigned → picked_up → delivered
    RD->>R: PUT /api/order/update/status/rider
    R->>RT: emit order:update / order:rider_assigned
```

### Earnings data flow

```mermaid
sequenceDiagram
    participant FE as Rider Dashboard
    participant RD as Rider :5005
    participant R as Restaurant :5001
    participant DB as MongoDB

    FE->>RD: GET /api/rider/earnings (JWT)
    RD->>R: GET /api/order/rider/earnings?riderId= (x-internal-key)
    R->>DB: Order.find({ riderId, status: delivered })
    R->>DB: Restaurant.find (pickup coords for map snapshots)
    R-->>RD: { summary, daily[], trips[] }
    RD-->>FE: Earnings chart + trip history with maps
```

---

## 8. Coupon & discount engine (LLD)

**Location:** `services/restaurant/src/coupon/`

```mermaid
classDiagram
    class CouponEngine {
        <<Facade>>
        +apply(code, context) DiscountResult
        +recordUsage(couponId) void
    }
    class CouponRepository {
        <<Repository>>
        +findByCode(code)
        +incrementUsage(couponId)
    }
    class CouponValidator {
        +validate(coupon, context)
        -assertActive()
        -assertNotExpired()
        -assertMinOrder()
        -assertUsageLimit()
        -assertPerUserLimit()
    }
    class DiscountStrategyFactory {
        <<Factory>>
        +getStrategy(type) DiscountStrategy
    }
    class DiscountStrategy {
        <<interface>>
        +calculate(subtotal, coupon) number
    }
    class FlatDiscountStrategy {
        +calculate() min(value, subtotal)
    }
    class PercentWithCapStrategy {
        +calculate() percent capped by maxDiscount
    }

    CouponEngine --> CouponRepository
    CouponEngine --> CouponValidator
    CouponEngine --> DiscountStrategyFactory
    DiscountStrategyFactory --> DiscountStrategy
    DiscountStrategy <|.. FlatDiscountStrategy
    DiscountStrategy <|.. PercentWithCapStrategy
```

### Coupon types

| Type | Algorithm | Example |
|------|-----------|---------|
| `flat` | `min(coupon.value, subtotal)` | `FLAT50` → ₹50 off |
| `percent_cap` | `(subtotal × value / 100)` capped by `maxDiscount` | `SAVE20` → 20% off, max ₹100 |

### Validation chain

1. `isActive === true`
2. `expiresAt > now`
3. `subtotal >= minOrderAmount`
4. `usedCount < usageLimit` (if limit set)
5. Per-user paid order count with same `couponId < perUserLimit`

### Admin → Engine integration

```mermaid
flowchart LR
    ADMIN["Admin :5006<br/>Coupon CRUD"] -->|"mongodb driver<br/>direct write"| DB[("coupons collection")]
    REST["Restaurant :5001<br/>CouponEngine"] -->|"mongoose read"| DB
    CHECKOUT["Customer Checkout"] --> REST
```

Admin creates/edits coupons directly in MongoDB. Restaurant service reads the same collection at apply time — no HTTP between Admin and Restaurant for coupons.

---

## 9. Dynamic ETA system

**Location:** `frontend/src/utils/eta.ts`

```mermaid
flowchart TD
    DIST["Haversine distance<br/>(user ↔ restaurant)"] --> FORMULA
    FORMULA["ETA = 15min prep<br/>+ (dist ÷ 22 km/h × 60)<br/>+ 5min buffer"]
    FORMULA --> RANGE["Range [total−5, total+5]<br/>clamped to 20–60 min"]

    RANGE --> EXPLORE["Explore cards"]
    RANGE --> RESTPAGE["Restaurant profile badge"]
    RANGE --> CHECKOUT["Checkout ETA banner"]

    ORDER["Order status"] --> LIVE["getOrderETA()"]
    LIVE --> TRACK["Order tracking page"]
    RIDERGPS["Rider GPS (picked_up)"] --> LIVE
```

| Constant | Value |
|----------|-------|
| `AVG_RIDER_SPEED_KMH` | 22 |
| `BASE_PREP_MINUTES` | 15 |
| `ETA_BUFFER_MINUTES` | 5 |
| Min / Max display | 20 / 60 min |

| Order Status | ETA behaviour |
|--------------|---------------|
| `placed` / `accepted` | Full estimated range |
| `preparing` | ~70% of midpoint |
| `ready_for_rider` | Travel + 8 min |
| `rider_assigned` | Travel + 6 min |
| `picked_up` | Live rider → customer distance |
| `delivered` / `cancelled` | Final label |

---

## 10. Reviews & ratings

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend
    participant R as Restaurant :5001
    participant DB as MongoDB
    participant RD as Rider :5005

    Note over C,FE: Order status = delivered

    C->>FE: ReviewModal opens (auto or manual)
    FE->>R: POST /api/review { orderId, rating, riderRating, comment }
    R->>R: validate owner + delivered + not duplicate

    R->>DB: Review.create (restaurant)
    R->>DB: aggregate → update Restaurant avgRating

    opt order had rider
        R->>DB: RiderReview.create
        R->>RD: PATCH /api/rider/internal/rating (x-internal-key)
        RD->>DB: update Rider avgRating
    end

    FE->>R: GET /api/review/restaurant/:id
    R-->>FE: reviews list + avg for RestaurantPage
```

| Collection | Unique constraint | Aggregated on |
|------------|--------------------|--------------| 
| `reviews` | one per `orderId` | `restaurants.avgRating` |
| `riderreviews` | one per `orderId` | `riders.avgRating` |

---

## 11. Realtime — Socket.IO

```mermaid
flowchart TB
    subgraph Connect["On WebSocket connect"]
        JWT["Verify handshake.auth.token"]
        U["join user:{user._id}"]
        S["if seller JWT has restaurantId:<br/>join restaurant:{restaurantId}"]
        JWT --> U --> S
    end

    subgraph Internal["POST /api/v1/internal/emit"]
        KEY["x-internal-key check"]
        EMIT["io.to(room).emit(event, payload)"]
        KEY --> EMIT
    end

    REST_C["Restaurant controllers"] --> Internal
    RID_C["Rider dispatch consumer"] --> Internal
    FE_RIDER["Rider map (GPS)"] --> Internal
    Internal --> CLIENT["Frontend listeners"]
```

| Socket event | Emitted from | Room | Frontend |
|--------------|--------------|------|----------|
| `order:new` | Restaurant payment consumer | `restaurant:{restaurantId}` | `RestaurantOrders.tsx` |
| `order:update` | Restaurant status change | `user:{customerId}` | `Orders.tsx`, `OrderPage.tsx` |
| `order:rider_assigned` | Assign rider / status update | `user:{customerId}`, `restaurant:{id}` | Orders, OrderPage, Seller |
| `order:available` | Rider dispatch consumer | `user:{riderUserId}` | `RiderDashboard.tsx` |
| `rider:location` | Rider frontend → internal emit | `user:{customerUserId}` | `OrderPage.tsx` map |

**Connection:** `io("http://localhost:5004", { auth: { token: JWT } })`

---

## 12. Utils service

```mermaid
flowchart LR
    subgraph Upload["Image upload"]
        REST_U["Restaurant<br/>restaurant, menuitem"]
        RID_U["Rider profile"]
        API["POST /api/upload"]
        CL["Cloudinary"]
        REST_U & RID_U --> API --> CL
    end

    subgraph Pay["Payment APIs"]
        FE["Frontend Checkout"]
        P1["POST /api/payment/create"]
        P2["POST /api/payment/verify"]
        S1["POST /api/payment/stripe/create"]
        S2["POST /api/payment/stripe/verify"]
        FE --> P1 & P2 & S1 & S2
        P2 & S2 --> Q["RabbitMQ payment_event"]
    end
```

Utils **requires** Cloudinary env vars at startup or it throws.

---

## 13. Admin service

Admin uses the **native MongoDB driver** — no Mongoose, no inter-service HTTP.

```mermaid
flowchart TB
    FE["Frontend Admin.tsx<br/>role = admin"] -->|"JWT"| ADM["Admin :5006"]
    ADM --> DB[("MongoDB Atlas<br/>DB_NAME env")]

    subgraph Tabs["Admin tabs"]
        U["Users — ban/unban"]
        REST_T["Restaurants — verify pending"]
        RID_T["Riders — verify pending"]
        COUP["Coupons — full CRUD"]
    end

    ADM --> Tabs
```

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/users` | List users (max 100) |
| PATCH | `/api/v1/admin/users/:id/status` | Ban / unban (self-ban blocked) |
| GET | `/api/v1/admin/restaurant/pending` | Unverified restaurants |
| PATCH | `/api/v1/verify/restaurant/:id` | Set `isVerified: true` |
| GET | `/api/v1/admin/rider/pending` | Unverified riders |
| PATCH | `/api/v1/verify/rider/:id` | Set `isVerified: true` |
| GET | `/api/v1/admin/coupons` | List all coupons |
| POST | `/api/v1/admin/coupon` | Create coupon |
| PATCH | `/api/v1/admin/coupon/:id` | Update coupon fields |
| PATCH | `/api/v1/admin/coupon/:id/toggle` | Toggle `isActive` |
| DELETE | `/api/v1/admin/coupon/:id` | Delete coupon |

**Admin role setup:** Set `role: "admin"` manually in MongoDB — not available via `PUT /api/auth/add/role`.

---

## 14. Restaurant API map

| Prefix | Routes | Auth |
|--------|--------|------|
| `/api/restaurant` | POST `/new`, GET `/my`, GET `/all`, PUT `/status`, PUT `/edit`, GET `/:id` | JWT / seller |
| `/api/item` | POST `/new`, GET `/all/:id`, PUT `/:itemId`, DELETE `/:itemId`, PUT `/status/:itemId` | JWT / seller |
| `/api/cart` | POST `/add`, GET `/all`, PUT `/inc`, PUT `/dec`, DELETE `/clear` | JWT |
| `/api/address` | POST `/new`, GET `/all`, DELETE `/:id` | JWT |
| `/api/order` | POST `/new`, GET `/myorder`, GET `/:id`, PUT `/:orderId`, GET `/analytics/:restaurantId` | JWT / seller |
| `/api/coupon` | POST `/validate` | JWT |
| `/api/review` | POST `/`, GET `/my`, GET `/restaurant/:id`, GET `/rider/:id` | JWT |

**Internal routes** (`x-internal-key`, no JWT):

| Method | Path | Called by |
|--------|------|-----------|
| GET | `/api/order/payment/:id` | Utils |
| PUT | `/api/order/assign/rider` | Rider |
| GET | `/api/order/current/rider` | Rider |
| PUT | `/api/order/update/status/rider` | Rider |
| GET | `/api/order/rider/earnings` | Rider |
| GET | `/api/order/rider/dispatch/:orderId` | Rider dispatch consumer |

---

## 15. RabbitMQ queues

| Queue | Env var | Publisher | Consumer | Event | Effect |
|-------|---------|-----------|----------|-------|--------|
| `payment_event` | `PAYMENT_QUEUE` | Utils | Restaurant | `PAYMENT_SUCCESS` | Mark paid, coupon usage++, notify seller |
| `order_ready_queue` | `ORDER_READY_QUEUE` | Restaurant | Rider | `ORDER_READY_FOR_RIDER` | Sequential nearest-rider dispatch |

> **Boot assertion:** Both Restaurant and Rider services assert `order_ready_queue` at startup. Restaurant must assert before publishing when seller marks order `ready_for_rider`.
| `rider_queue` | `RIDER_QUEUE` | — | — | — | Asserted only, unused |

---

## 16. Shared secrets & ports

### Ports

| Service | Port | Notes |
|---------|------|-------|
| Frontend | 5173 | Vite dev server |
| Auth | **5007** | Not 5000 (macOS AirPlay conflict) |
| Restaurant | 5001 | RabbitMQ consumer at boot |
| Utils | 5002 | Cloudinary required |
| Realtime | 5004 | Socket.IO |
| Rider | 5005 | RabbitMQ consumer at boot |
| Admin | 5006 | Native MongoDB driver |
| RabbitMQ | 5672 | AWS EC2 Docker (production) or local Docker |

### Secrets (must be identical)

| Variable | Used by |
|----------|---------|
| `JWT_SEC` | Auth, Restaurant, Rider, Realtime, Admin |
| `INTERNAL_SERVICE_KEY` | Restaurant, Utils, Realtime, Rider + `VITE_INTERNAL_SERVICE_KEY` in frontend |

---

## 17. Startup order

```mermaid
flowchart LR
    A0["RabbitMQ up"] --> A1["MongoDB Atlas reachable"]
    A1 --> A2["Auth :5007"]
    A2 --> A3["Utils :5002"]
    A3 --> A4["Realtime :5004"]
    A4 --> A5["Restaurant :5001"]
    A5 --> A6["Rider :5005"]
    A6 --> A7["Admin :5006"]
    A7 --> A8["Frontend :5173"]
```

Each backend service: `npm run dev` → `tsc --watch` + `node --watch dist/index.js`.

---

## 18. Cloud deployment

```mermaid
flowchart TB
    subgraph Users["Users"]
        BROWSER["Browser"]
    end

    subgraph Vercel["Vercel"]
        FE["React SPA<br/>Static + env URLs"]
    end

    subgraph Render["Render — 6 Web Services"]
        AUTH["Auth :5007"]
        REST["Restaurant :5001"]
        UTILS["Utils :5002"]
        RT["Realtime :5004"]
        RIDER["Rider :5005"]
        ADMIN["Admin :5006"]
    end

    subgraph AWS["AWS EC2"]
        RMQ["RabbitMQ<br/>Docker :5672"]
    end

    subgraph Atlas["MongoDB Atlas"]
        DB[("Shared cluster<br/>DB_NAME env")]
    end

    BROWSER --> FE
    FE -->|"HTTPS + JWT"| AUTH & REST & UTILS & RIDER & ADMIN
    FE -->|"WebSocket"| RT

    AUTH & REST & RIDER & ADMIN --> DB
    UTILS -->|"publish"| RMQ
    REST -->|"consume + publish"| RMQ
    RIDER -->|"consume"| RMQ
    REST & RIDER --> RT
```

| Layer | Platform | Role |
|-------|----------|------|
| Frontend | Vercel | SPA hosting, env vars for service URLs |
| Backend ×6 | Render | One web service per microservice |
| Message broker | AWS EC2 + Docker | RabbitMQ (`payment_event`, `order_ready_queue`) |
| Database | MongoDB Atlas M0 | Shared cluster across services |
| Media | Cloudinary | Restaurant/menu/rider images |
| Payments | Razorpay + Stripe | Test/live keys in Utils `.env` |

**Demo:** [Google Drive video](https://drive.google.com/file/d/1dFfNB1KGfTNGw0WirO0h5zulQg5hJMcx/view?usp=drive_link) · **Repo:** [github.com/subhm2004/ByteBites](https://github.com/subhm2004/ByteBites)

---

## 19. Known limitations

| Area | Limitation |
|------|------------|
| **Database** | Shared MongoDB cluster — not database-per-service |
| **Rider dispatch** | Nearest-first within `RIDER_DISPATCH_RADIUS_M`; no batching |
| **Real-time** | Single Realtime instance — no Redis Socket.IO adapter |
| **Notifications** | In-app sockets only — no FCM/APNs |
| **ETA** | Haversine rule-based — not live traffic / ML |
| **Refunds** | Cancel UI only — no automated gateway refund |
| **Admin** | Role set manually in MongoDB |
| **Testing** | No CI integration/E2E suite |
| **Unused queue** | `rider_queue` asserted but unused |

See [README.md — Known Limitations](./README.md#known-limitations) for full detail.

---

## Role-based UI routing

```mermaid
flowchart TD
    LOGIN["User logs in"] --> ROLE{user.role?}
    ROLE -->|seller| SELLER["Restaurant.tsx<br/>Seller dashboard"]
    ROLE -->|rider| RIDER_UI["RiderDashboard.tsx"]
    ROLE -->|admin| ADMIN_UI["Admin.tsx"]
    ROLE -->|customer / null| CUSTOMER["BrowserRouter<br/>Landing + Explore + Cart + …"]
```


---
