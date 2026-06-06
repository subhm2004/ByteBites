# ByteBites — System Architecture

> Diagrams match the **actual codebase**. View in Cursor/GitHub (Mermaid preview) or paste into [mermaid.live](https://mermaid.live).

---

## 1. High-level system (all services + externals)

```mermaid
flowchart TB
    subgraph Client["Browser"]
        FE["Frontend :5173<br/>React + Vite + Socket.IO client"]
    end

    subgraph Backend["Node.js microservices"]
        AUTH["Auth :5000<br/>/api/auth"]
        REST["Restaurant :5001<br/>/api/restaurant, /item, /cart, /address, /order"]
        UTILS["Utils :5002<br/>/api/upload, /api/payment"]
        RT["Realtime :5004<br/>WebSocket + /api/v1/internal/emit"]
        RIDER["Rider :5005<br/>/api/rider"]
        ADMIN["Admin :5006<br/>/api/v1"]
    end

    subgraph Storage["Data & messaging"]
        MONGO[("MongoDB Atlas<br/>DB: Zomato_Clone")]
        RMQ{{"RabbitMQ (CloudAMQP)<br/>payment_event<br/>order_ready_queue<br/>rider_queue*"}}
    end

    subgraph External["Third-party"]
        GOOGLE["Google OAuth API"]
        CLOUD["Cloudinary"]
        STRIPE["Stripe"]
        RAZOR["Razorpay"]
    end

    FE -->|"HTTP + Bearer JWT"| AUTH
    FE -->|"HTTP + Bearer JWT"| REST
    FE -->|"HTTP"| UTILS
    FE -->|"WebSocket auth.token=JWT"| RT
    FE -->|"HTTP + Bearer JWT"| RIDER
    FE -->|"HTTP + Bearer JWT"| ADMIN

    AUTH -->|"mongoose"| MONGO
    REST -->|"mongoose"| MONGO
    RIDER -->|"mongoose"| MONGO
    ADMIN -->|"mongodb driver direct"| MONGO

    UTILS -->|"publish PAYMENT_SUCCESS"| RMQ
    REST -->|"consume payment_event"| RMQ
    REST -->|"publish ORDER_READY_FOR_RIDER"| RMQ
    RIDER -->|"consume order_ready_queue"| RMQ

    AUTH --> GOOGLE
    UTILS --> CLOUD
    UTILS --> STRIPE
    UTILS --> RAZOR

    REST -->|"axios POST /internal/emit<br/>x-internal-key"| RT
    RIDER -->|"axios POST /internal/emit<br/>x-internal-key"| RT
    REST -->|"axios POST /api/upload"| UTILS
    RIDER -->|"axios POST /api/upload"| UTILS
    UTILS -->|"axios GET /api/order/payment/:id<br/>x-internal-key"| REST
    RIDER -->|"axios PUT/GET /api/order/*<br/>x-internal-key"| REST
```

> `rider_queue` is asserted in RabbitMQ config but has **no producer/consumer** in code yet.

---

## 2. MongoDB — who uses what

```mermaid
flowchart LR
    MONGO[("Zomato_Clone")]

    AUTH -->|"users"| MONGO
    REST -->|"restaurants, menuitems,<br/>carts, addresses, orders"| MONGO
    RIDER -->|"riders"| MONGO
    ADMIN -->|"restaurants + riders<br/>(isVerified updates)"| MONGO
```

| Collection | Service | Operations |
|------------|---------|------------|
| `users` | Auth | create on Google login, role update |
| `restaurants` | Restaurant, Admin | CRUD + Admin sets `isVerified` |
| `menuitems` | Restaurant | seller menu |
| `carts` | Restaurant | add / inc / dec / clear |
| `addresses` | Restaurant | delivery addresses |
| `orders` | Restaurant, Rider (via HTTP) | create, pay, status, assign rider |
| `riders` | Rider, Admin | profile + Admin sets `isVerified` |

---

## 3. Auth service — login & JWT

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend :5173
    participant G as Google OAuth
    participant A as Auth :5000
    participant DB as MongoDB
    participant RT as Realtime :5004

    U->>FE: Click "Continue with Google"
    FE->>G: OAuth (auth-code flow)
    G-->>FE: authorization code
    FE->>A: POST /api/auth/login { code }
    A->>G: oauth2client.getToken(code)
    A->>G: GET userinfo (email, name, picture)
    A->>DB: User.findOne(email) or User.create()
    A-->>FE: JWT (15d) + user JSON
    FE->>FE: localStorage.setItem("token")

    U->>FE: Choose role customer / seller / rider
    FE->>A: PUT /api/auth/add/role { role } + JWT
    A->>DB: update user.role
    A-->>FE: new JWT + user

    FE->>RT: Socket connect auth: { token: JWT }
    Note over FE,RT: Realtime verifies JWT with same JWT_SEC
```

**Routes (`services/auth`):**

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | No |
| PUT | `/api/auth/add/role` | JWT |
| GET | `/api/auth/me` | JWT |

---

## 4. Payment flow (Razorpay or Stripe)

```mermaid
sequenceDiagram
    actor U as Customer
    participant FE as Frontend
    participant R as Restaurant :5001
    participant U2 as Utils :5002
    participant PG as Razorpay / Stripe
    participant Q as RabbitMQ payment_event
    participant RT as Realtime :5004
    participant DB as MongoDB

    U->>FE: Checkout
    FE->>R: POST /api/order/new (JWT)<br/>paymentStatus=pending, status=placed
    R->>DB: Order.create, Cart.deleteMany
    R-->>FE: orderId, amount

    FE->>U2: POST /api/payment/create OR /stripe/create
    U2->>R: GET /api/order/payment/:id<br/>Header: x-internal-key
    R-->>U2: amount, currency
    U2->>PG: create payment session / order
    U2-->>FE: payment UI keys / session

    U->>PG: Pay
    FE->>U2: POST verify (razorpay or stripe)
    U2->>U2: verify signature
    U2->>Q: publish PAYMENT_SUCCESS { orderId, paymentId, provider }

    Q->>R: payment.consumer
    R->>DB: paymentStatus=paid, status=placed, unset expiresAt
    R->>RT: POST /api/v1/internal/emit<br/>event: order:new<br/>room: restaurant:{restaurantId}
    RT-->>FE: Socket order:new (seller dashboard)
```

---

## 5. Order lifecycle

```mermaid
stateDiagram-v2
    [*] --> placed: createOrder paymentStatus=pending
    placed --> placed: payment consumer sets paid
    placed --> preparing: seller PUT /api/order/:orderId
    preparing --> ready_for_rider: seller updates status
    ready_for_rider --> rider_assigned: rider POST accept
    rider_assigned --> picked_up: rider PUT update status
    picked_up --> delivered: rider PUT update status
```

### 5a. Seller `ready_for_rider` → RabbitMQ → nearby riders

```mermaid
sequenceDiagram
    participant FE as Frontend Seller
    participant R as Restaurant :5001
    participant Q as RabbitMQ order_ready_queue
    participant RID as Rider :5005
    participant DB as MongoDB
    participant RT as Realtime :5004
    participant FE2 as Frontend Rider

    FE->>R: PUT /api/order/:orderId { status: ready_for_rider }
    R->>DB: order.status update
    R->>RT: emit order:update → room user:{customerId}
    R->>Q: ORDER_READY_FOR_RIDER { orderId, restaurantId, location }

    Q->>RID: orderReady.consumer
    RID->>DB: Rider.find near location ($near 500m)
    loop each available verified rider
        RID->>RT: emit order:available → room user:{rider.userId}
        RT-->>FE2: Socket order:available
    end
```

### 5b. Rider accepts order

```mermaid
sequenceDiagram
    participant FE as Frontend Rider
    participant RID as Rider :5005
    participant R as Restaurant :5001
    participant RT as Realtime :5004
    participant DB as MongoDB

    FE->>RID: POST /api/rider/accept/:orderId (JWT)
    RID->>R: PUT /api/order/assign/rider<br/>x-internal-key
    R->>DB: assign rider on order
    R->>RT: emit order:rider_assigned
    RID->>DB: Rider isAvailble = false
```

### 5c. Rider updates delivery status

```mermaid
sequenceDiagram
    participant FE as Frontend Rider
    participant RID as Rider :5005
    participant R as Restaurant :5001
    participant RT as Realtime :5004

    FE->>RID: PUT /api/rider/order/update/:orderId
    RID->>R: PUT /api/order/update/status/rider<br/>x-internal-key
    R->>R: update order.status
    R->>RT: emit order:update → user:{customerId}
    RT-->>FE: live tracking UI
```

---

## 6. Realtime service — Socket rooms & internal emit

```mermaid
flowchart TB
    subgraph Connect["On WebSocket connect"]
        JWT["Verify JWT from handshake.auth.token"]
        JOIN1["join user:{user._id}"]
        JOIN2["if seller: join restaurant:{restaurantId}"]
        JWT --> JOIN1 --> JOIN2
    end

    subgraph Internal["POST /api/v1/internal/emit"]
        KEY["Check x-internal-key"]
        EMIT["io.to(room).emit(event, payload)"]
        KEY --> EMIT
    end

    REST_C["Restaurant controllers"] --> Internal
    RID_C["Rider orderReady.consumer"] --> Internal
    Internal --> FE["Frontend socket listeners"]
```

| Socket event | Emitted from | Room | Frontend file |
|--------------|--------------|------|---------------|
| `order:new` | Restaurant after payment | `restaurant:{restaurantId}` | `RestaurantOrders.tsx` |
| `order:update` | Restaurant status change | `user:{customerId}` | `Orders.tsx`, `OrderPage.tsx` |
| `order:rider_assigned` | Restaurant assign rider | customer + restaurant | `Orders.tsx`, `RestaurantOrders.tsx` |
| `order:available` | Rider consumer | `user:{rider.userId}` | `RiderDashboard.tsx` |
| `rider:location` | tracking | `OrderPage.tsx` | map updates |

---

## 7. Utils service

```mermaid
flowchart LR
    subgraph Upload["Image upload"]
        REST_U["Restaurant<br/>restaraunt.ts, menuitem.ts"]
        RID_U["Rider addRiderProfile"]
        API["POST /api/upload"]
        CL["Cloudinary"]
        REST_U --> API --> CL
        RID_U --> API --> CL
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

## 8. Admin service

```mermaid
flowchart LR
    FE["Frontend Admin"] -->|"JWT role=admin"| ADM["Admin :5006"]
    ADM --> DB[("MongoDB Zomato_Clone")]
```

| Method | Path |
|--------|------|
| GET | `/api/v1/admin/restaurant/pending` |
| GET | `/api/v1/admin/rider/pending` |
| PATCH | `/api/v1/verify/restaurant/:id` |
| PATCH | `/api/v1/verify/rider/:id` |

Admin does **not** call other microservices — only direct MongoDB updates.

---

## 9. Restaurant API map

| Prefix | Purpose |
|--------|---------|
| `/api/restaurant` | Seller restaurant CRUD, nearby list |
| `/api/item` | Menu CRUD |
| `/api/cart` | Cart operations |
| `/api/address` | Delivery addresses |
| `/api/order` | Orders + seller status |

**Internal routes** (`x-internal-key` header):

| Method | Path | Called by |
|--------|------|-----------|
| GET | `/api/order/payment/:id` | Utils |
| PUT | `/api/order/assign/rider` | Rider |
| GET | `/api/order/current/rider` | Rider |
| PUT | `/api/order/update/status/rider` | Rider |

---

## 10. RabbitMQ queues

| Queue | Publisher | Consumer | Payload type |
|-------|-----------|----------|--------------|
| `payment_event` | Utils `publishPaymentSuccess` | Restaurant `payment.consumer` | `PAYMENT_SUCCESS` |
| `order_ready_queue` | Restaurant `publishEvent` | Rider `orderReady.consumer` | `ORDER_READY_FOR_RIDER` |
| `rider_queue` | — | — | asserted only, unused |

---

## 11. Shared secrets (must match)

| Variable | Used by |
|----------|---------|
| `JWT_SEC` | Auth, Restaurant, Rider, Admin, Realtime (socket) |
| `INTERNAL_SERVICE_KEY` | Utils, Restaurant, Rider, Realtime + `VITE_INTERNAL_SERVICE_KEY` in frontend |

---

## 12. Recommended startup order

```mermaid
flowchart LR
    A1["MongoDB + RabbitMQ up"] --> A2["Auth"]
    A2 --> A3["Utils"]
    A3 --> A4["Realtime"]
    A4 --> A5["Restaurant"]
    A5 --> A6["Rider"]
    A6 --> A7["Admin"]
    A7 --> A8["Frontend :5173"]
```

---

## Excalidraw

1. Open [excalidraw.com](https://excalidraw.com)
2. Use **Section 1** as the main canvas (boxes + arrows)
3. Use **Sections 3–5** for sequence / timeline pages
4. Export from [mermaid.live](https://mermaid.live) as PNG/SVG to import into Excalidraw

*Source: `services/*`, `frontend/src` — ByteBites repo.*
