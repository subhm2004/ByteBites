<div align="center">

# 🍔 ByteBites

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1200&color=E23744&center=true&vCenter=true&width=620&lines=Production-Style+Food+Delivery+Platform;Zomato+%2F+Swiggy+Clone;6+Microservices+%7C+Live+Tracking+%7C+Dynamic+ETA)](https://git.io/typing-svg)

<br />

[![GitHub stars](https://img.shields.io/github/stars/subhm2004/ByteBites?style=for-the-badge&logo=github&label=Stars&color=E23744&logoColor=white)](https://github.com/subhm2004/ByteBites/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/subhm2004/ByteBites?style=for-the-badge&logo=github&label=Forks&color=1a1a1a&logoColor=white)](https://github.com/subhm2004/ByteBites/network/members)
[![Last commit](https://img.shields.io/github/last-commit/subhm2004/ByteBites?style=for-the-badge&logo=git&label=Updated&color=555555&logoColor=white)](https://github.com/subhm2004/ByteBites/commits/main)
[![License](https://img.shields.io/badge/License-Educational-blue?style=for-the-badge)](https://github.com/subhm2004/ByteBites)

<br />

[![React](https://img.shields.io/github/package-json/dependency-version/subhm2004/ByteBites/react?filename=frontend%2Fpackage.json&logo=react&logoColor=white&label=React&color=20232a)](https://react.dev/)
[![TypeScript](https://img.shields.io/github/package-json/dependency-version/subhm2004/ByteBites/typescript?filename=frontend%2Fpackage.json&logo=typescript&logoColor=white&label=TypeScript&color=3178C6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/github/package-json/dependency-version/subhm2004/ByteBites/vite?filename=frontend%2Fpackage.json&logo=vite&logoColor=white&label=Vite&color=646CFF)](https://vitejs.dev/)
[![Express](https://img.shields.io/github/package-json/dependency-version/subhm2004/ByteBites/express?filename=services%2Frestaurant%2Fpackage.json&logo=express&logoColor=white&label=Express&color=000000)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/github/package-json/dependency-version/subhm2004/ByteBites/mongoose?filename=services%2Frestaurant%2Fpackage.json&logo=mongodb&logoColor=white&label=Mongoose&color=47A248)](https://mongoosejs.com/)
[![Socket.IO](https://img.shields.io/github/package-json/dependency-version/subhm2004/ByteBites/socket.io-client?filename=frontend%2Fpackage.json&logo=socket.io&logoColor=white&label=Socket.IO&color=010101)](https://socket.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)

<br />

[![Microservices](https://img.shields.io/badge/Microservices-6_services-E23744?style=flat-square)](./ARCHITECTURE.md)
[![Realtime](https://img.shields.io/badge/Real--time-Live_tracking-010101?style=flat-square&logo=socket.io&logoColor=white)](./ARCHITECTURE.md#11-realtime--socketio)
[![Payments](https://img.shields.io/badge/Payments-Razorpay+%2B+Stripe-635BFF?style=flat-square)](./README.md#-complete-feature-list)
[![Coupon Engine](https://img.shields.io/badge/Coupon-Strategy+%2B+Factory-F59E0B?style=flat-square)](./README.md#-coupon--discount-engine-lld)
[![Dynamic ETA](https://img.shields.io/badge/ETA-Haversine+model-3B82F6?style=flat-square)](./README.md#-dynamic-eta-system)
[![Roles](https://img.shields.io/badge/Roles-4_dashboards-10B981?style=flat-square)](./README.md#-complete-feature-list)

<br />

[About](#-about) · [Features](#-complete-feature-list) · [Architecture](./ARCHITECTURE.md) · [Coupon Engine](#-coupon--discount-engine-lld) · [Dynamic ETA](#-dynamic-eta-system) · [Setup](#-getting-started)

<br />

<a href="#-about">
  <img src="https://img.shields.io/badge/ByteBites-%23E23744?style=for-the-badge&labelColor=1a1a1a" alt="ByteBites brand"/>
</a>

</div>

---

## 📖 About

**ByteBites** is a full-stack food delivery web application built with a **microservices architecture**. It connects **customers**, **restaurant partners (sellers)**, **delivery riders**, and **platform admins** in one ecosystem — similar to Zomato or Swiggy.

Unlike a typical college monolith, this project uses:

- **6 independent backend microservices**
- **RabbitMQ** for async payment & dispatch messaging
- **Socket.IO** for live order updates & rider tracking
- **MongoDB Atlas** with geospatial indexes
- **Razorpay + Stripe** dual payment gateways
- **Design patterns** in the coupon engine (Strategy, Factory, Facade, Repository)
- **Rule-based Dynamic ETA** across browse, checkout, and live tracking

> Repo folder: `TOMATO` · Product brand: **ByteBites** · DB: `Zomato_Clone`

---

## 📑 Table of Contents

1. [Complete Feature List](#-complete-feature-list)
2. [System Design (HLD)](#-system-design-hld)
3. [Microservices Breakdown](#-microservices-breakdown)
4. [Coupon & Discount Engine (LLD)](#-coupon--discount-engine-lld)
5. [Dynamic ETA System](#-dynamic-eta-system)
6. [Reviews & Ratings](#-reviews--ratings)
7. [Smart Rider Dispatch](#-smart-rider-dispatch)
8. [Real-Time Events (Socket.IO)](#-real-time-events-socketio)
9. [RabbitMQ Message Flows](#-rabbitmq-message-flows)
10. [Order Lifecycle](#-order-lifecycle)
11. [Admin Dashboard](#-admin-dashboard)
12. [Database Collections](#-database-collections)
13. [API Reference](#-api-reference)
14. [Tech Stack](#-tech-stack)
15. [Project Structure](#-project-structure)
16. [Getting Started](#-getting-started)
17. [Environment Variables](#-environment-variables)
18. [Additional Docs](#-additional-docs)

---

## ✨ Complete Feature List

### 👤 Customer

| Feature | Description |
|---------|-------------|
| Google OAuth login | JWT session (15 days) via Auth service |
| Role selection | Customer / Seller / Rider on first login |
| Landing page | Marketing site at `/` — hero, iPhone mockup, FAQ, testimonials |
| Explore nearby restaurants | `$geoNear` query within ~5 km radius |
| Search & category filter | Search by name; category chips filter name/description |
| **Dynamic ETA on cards** | Delivery time calculated from distance (not hardcoded) |
| Restaurant page | Menu, ratings badge, customer reviews section |
| Cart | Single-restaurant cart enforced; qty +/- |
| Saved addresses | Leaflet map picker + Nominatim geocoding |
| Checkout | Address select, **coupon apply**, fee breakdown, **ETA preview** |
| Dual payments | Razorpay (INR/UPI) + Stripe (international) |
| Order history | All paid orders with status badges |
| Live order tracking | Leaflet map + OSRM route + rider GPS dot |
| **Status-aware ETA** | Countdown updates as order progresses |
| Post-delivery reviews | Rate restaurant + delivery partner (stars + comment) |
| PDF receipt download | jsPDF receipt for paid orders |
| Dark / light theme | Theme toggle across app |
| Ban enforcement | Suspended users blocked at login |

### 🏪 Restaurant (Seller)

| Feature | Description |
|---------|-------------|
| Restaurant onboarding | Name, description, image (Cloudinary), geo location |
| Open / close toggle | Control visibility to customers |
| Edit profile | Update name & description |
| Menu management | **Add, edit, delete** items with image upload |
| Item availability toggle | Mark items available/unavailable |
| Live incoming orders | Socket `order:new` + sound alert (quack.mp3) |
| Order workflow | `placed → accepted → preparing → ready_for_rider` |
| **Seller cancel order** | Cancel from `placed`, `accepted`, `preparing` |
| Sales analytics dashboard | Revenue, daily chart (Recharts), top items, status breakdown |
| Real-time order updates | Socket events on status changes |

### 🛵 Delivery Rider

| Feature | Description |
|---------|-------------|
| Profile registration | Photo, phone, Aadhar, driving license, GPS |
| Admin verification gate | Must be verified before going online |
| Online / offline toggle | Live GPS update on toggle |
| **Smart sequential dispatch** | Nearest rider offered first (10s window each) |
| Incoming order alerts | Socket + sound (faaah.mp3) |
| Accept & deliver | Map with OSRM routing |
| Live GPS broadcast | Customer sees rider on map in real time |
| Status updates | `picked_up → delivered` |
| **Earnings dashboard** | Today / week / all-time + 7-day chart |
| **Trip history** | Past deliveries with route map snapshots |
| Rider rating display | Avg stars from customer reviews |

### 🛡️ Admin

| Feature | Description |
|---------|-------------|
| **Users tab** | List users, ban/unban (cannot ban self) |
| **Restaurants tab** | Verify pending restaurant partners |
| **Riders tab** | Verify pending delivery riders |
| **Coupons tab** | Full coupon CRUD — create, edit, toggle, delete |
| Direct MongoDB access | No inter-service HTTP — fast admin ops |

---

## 🏗 System Design (HLD)

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Client
        FE[React Frontend :5173]
    end

    subgraph Microservices
        AUTH[Auth :5007]
        REST[Restaurant :5001]
        UTILS[Utils :5002]
        RT[Realtime :5004]
        RIDER[Rider :5005]
        ADMIN[Admin :5006]
    end

    subgraph Infra
        MONGO[(MongoDB Atlas\nZomato_Clone)]
        RMQ[RabbitMQ]
    end

    subgraph External
        GOOGLE[Google OAuth]
        CLOUD[Cloudinary]
        RAZOR[Razorpay]
        STRIPE[Stripe]
        OSRM[OSRM Routing]
    end

    FE --> AUTH & REST & UTILS & RT & RIDER & ADMIN
    AUTH & REST & RIDER --> MONGO
    ADMIN --> MONGO
    REST --> RMQ
    UTILS --> RMQ
    RIDER --> RMQ
    REST & RIDER & UTILS --> RT
    REST --> UTILS
    RIDER --> REST
    FE --> GOOGLE & OSRM
    UTILS --> CLOUD & RAZOR & STRIPE
```

### Design Principles Used

| Principle | Where |
|-----------|-------|
| **Microservices** | 6 independent services, each owns a domain |
| **Async messaging** | Payment confirmation decoupled via RabbitMQ |
| **Event-driven** | Socket.IO pushes live updates to clients |
| **Geospatial queries** | MongoDB `2dsphere` for restaurants, riders, addresses |
| **Internal service auth** | `x-internal-key` header for service-to-service calls |
| **Strategy pattern** | Pluggable discount algorithms in coupon engine |
| **Facade pattern** | Single `CouponEngine.apply()` entry point |
| **Repository pattern** | Data access abstracted in `CouponRepository` |
| **TTL index** | Unpaid orders auto-expire after 15 minutes |

### Service Communication

```
Customer Browser
    │
    ├── REST ──► Auth / Restaurant / Utils / Rider / Admin
    ├── WebSocket ──► Realtime (JWT auth)
    └── Internal emit ──► Realtime (rider GPS from frontend)

Restaurant Service
    ├── HTTP ──► Utils (image upload)
    ├── HTTP ──► Realtime (socket emit)
    ├── HTTP ──► Rider Service (rating sync)
    ├── RabbitMQ publish ──► order_ready_queue
    └── RabbitMQ consume ◄── payment_event

Rider Service
    ├── HTTP ──► Restaurant (assign order, update status, earnings)
    ├── HTTP ──► Realtime (notify riders)
    ├── HTTP ──► Utils (image upload)
    └── RabbitMQ consume ◄── order_ready_queue

Utils Service
    ├── HTTP ──► Restaurant (fetch order for payment)
    └── RabbitMQ publish ──► payment_event

Admin Service
    └── Direct MongoDB (no HTTP to other services)
```

---

## 🔧 Microservices Breakdown

| Port | Service | Responsibility |
|------|---------|----------------|
| **5173** | Frontend | React SPA — all role UIs, maps, charts |
| **5007** | Auth | Google OAuth, JWT, roles, ban check |
| **5001** | Restaurant | Restaurants, menu, cart, orders, addresses, coupons, reviews |
| **5002** | Utils | Cloudinary upload, Razorpay + Stripe, payment events |
| **5004** | Realtime | Socket.IO server + internal HTTP emit API |
| **5005** | Rider | Profiles, availability, dispatch consumer, earnings |
| **5006** | Admin | User management, verification, coupon CRUD |

**Shared database:** `Zomato_Clone` on MongoDB Atlas (all services except Admin use Mongoose; Admin uses native driver).

---

## 🎟 Coupon & Discount Engine (LLD)

The coupon engine lives in `services/restaurant/src/coupon/` and is a textbook example of **clean architecture with design patterns**.

### Class Diagram (LLD)

```mermaid
classDiagram
    class CouponEngine {
        -repository: CouponRepository
        -validator: CouponValidator
        +apply(code, context) DiscountResult
        +recordUsage(couponId) void
    }

    class CouponRepository {
        +findByCode(code) ICouponData
        +incrementUsage(couponId) void
    }

    class CouponValidator {
        +validate(coupon, context) void
        -assertActive()
        -assertNotExpired()
        -assertMinOrder()
        -assertUsageLimit()
        -assertPerUserLimit()
    }

    class DiscountStrategyFactory {
        +getStrategy(type) DiscountStrategy
    }

    class DiscountStrategy {
        <<interface>>
        +calculate(subtotal, coupon) number
    }

    class FlatDiscountStrategy {
        +calculate(subtotal, coupon) number
    }

    class PercentWithCapStrategy {
        +calculate(subtotal, coupon) number
    }

    class CouponError {
        +message: string
        +statusCode: number
    }

    CouponEngine --> CouponRepository
    CouponEngine --> CouponValidator
    CouponEngine --> DiscountStrategyFactory
    DiscountStrategyFactory --> DiscountStrategy
    DiscountStrategy <|.. FlatDiscountStrategy
    DiscountStrategy <|.. PercentWithCapStrategy
    CouponValidator --> CouponError
    CouponEngine --> CouponError
```

### Design Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Facade** | `CouponEngine` | Single `apply()` method hides complexity of repo + validation + strategy |
| **Strategy** | `DiscountStrategy` interface | Swap discount algorithm without changing engine code |
| **Factory** | `DiscountStrategyFactory` | Returns correct strategy by `coupon.type` |
| **Repository** | `CouponRepository` | Abstracts MongoDB queries for coupons |
| **Validator (Chain)** | `CouponValidator` | Sequential eligibility checks with early throw |
| **Custom Error** | `CouponError` | Typed errors with HTTP status codes |

### Coupon Types

| Type | Algorithm | Example |
|------|-----------|---------|
| `flat` | `min(value, subtotal)` | `FLAT50` → ₹50 off |
| `percent_cap` | `(subtotal × value / 100)` capped by `maxDiscount` | `SAVE20` → 20% off, max ₹100 |

### Validation Rules

Before applying any discount, `CouponValidator` checks:

1. **Active** — `isActive === true`
2. **Not expired** — `expiresAt > now`
3. **Min order** — `subtotal >= minOrderAmount`
4. **Global usage limit** — `usedCount < usageLimit` (if set)
5. **Per-user limit** — counts paid orders with same `couponId` for this user

### End-to-End Coupon Flow

```mermaid
sequenceDiagram
    participant C as Customer (Checkout)
    participant R as Restaurant Service
    participant CE as CouponEngine
    participant DB as MongoDB
    participant U as Utils Service
    participant Q as RabbitMQ

    C->>R: POST /api/coupon/validate { code, subtotal }
    R->>CE: apply(code, context)
    CE->>DB: findByCode(code)
    CE->>CE: validate(coupon, context)
    CE->>CE: strategy.calculate(subtotal)
    CE-->>R: { discountAmount, fees, total }
    R-->>C: Preview discount + updated total

    C->>R: POST /api/order/new { couponCode, ... }
    R->>CE: apply() again at order creation
    R->>DB: Save order (paymentStatus: pending)

    C->>U: POST /api/payment/create (Razorpay/Stripe)
    U->>U: Verify payment
    U->>Q: Publish PAYMENT_SUCCESS
    Q->>R: Consume payment event
    R->>DB: paymentStatus = paid
    R->>CE: recordUsage(couponId)
    R->>R: Socket emit order:new → seller
```

### Fee Calculation (with coupon)

```
Subtotal        = sum of (item.price × quantity)
Delivery fee    = ₹49 if subtotal < ₹250, else ₹0
Platform fee    = ₹7
Discount        = coupon engine result
Total           = subtotal + delivery + platform - discount
Rider payout    = ceil(distance_km) × ₹17
```

---

## ⏱ Dynamic ETA System

Implemented in `frontend/src/utils/eta.ts` — a **rule-based ETA engine** (Level 1) using Haversine distance.

### Formula

```
Travel time  = (distance_km ÷ 22 km/h) × 60 minutes
Total ETA    = 15 min prep + travel time + 5 min buffer
Display range = [total − 5, total + 5] clamped to [20, 60] min
```

### Constants

| Constant | Value | Reason |
|----------|-------|--------|
| `AVG_RIDER_SPEED_KMH` | 22 | City traffic average |
| `BASE_PREP_MINUTES` | 15 | Kitchen prep time |
| `ETA_BUFFER_MINUTES` | 5 | Safety margin |
| `MIN_ETA_MINUTES` | 20 | Never show too low |
| `MAX_ETA_MINUTES` | 60 | Cap for far orders |

### Where ETA Appears

| Screen | Logic |
|--------|-------|
| **Explore cards** | `estimateETA(distanceKm)` from user → restaurant Haversine |
| **Restaurant page** | Blue ETA badge next to ratings |
| **Checkout** | Updates when delivery address selected |
| **Order tracking** | `getOrderETA()` — status-aware countdown |

### Status-Aware ETA (Live Tracking)

| Order Status | ETA Logic |
|--------------|-----------|
| `placed` / `accepted` | Full estimated range |
| `preparing` | ~70% of midpoint remaining |
| `ready_for_rider` | Travel time + 8 min (rider assigning) |
| `rider_assigned` | Travel time + 6 min |
| `picked_up` | Live Haversine rider → customer (if GPS available) |
| `delivered` | "Delivered" |
| `cancelled` | "Order cancelled" |

---

## ⭐ Reviews & Ratings

### Restaurant Reviews
- Customer rates 1–5 stars + optional comment after delivery
- Stored in `reviews` collection (one per order)
- Restaurant `avgRating` and `reviewCount` auto-recalculated via MongoDB aggregation
- Displayed on restaurant page and explore cards

### Rider Reviews
- Customer rates delivery partner separately (if rider assigned)
- Stored in `riderreviews` collection
- Rider `avgRating` synced to Rider service via internal API
- Displayed on rider dashboard profile

### API Endpoints
```
POST   /api/review                          — submit review(s)
GET    /api/review/my                       — user's past reviews
GET    /api/review/restaurant/:restaurantId — restaurant reviews + avg
GET    /api/review/rider/:riderId           — rider reviews + avg
```

---

## 🛵 Smart Rider Dispatch

When seller marks order `ready_for_rider`:

```mermaid
sequenceDiagram
    participant S as Seller
    participant R as Restaurant Service
    participant Q as RabbitMQ
    participant RD as Rider Service
    participant RT as Realtime
    participant Rider as Rider App

    S->>R: PUT status = ready_for_rider
    R->>Q: Publish ORDER_READY_FOR_RIDER
    Q->>RD: Consume event
    RD->>RD: $geoNear — riders within 500m, sorted by distance
    RD->>RT: Emit order:available → nearest rider (10s)
    alt Rider accepts within 10s
        Rider->>RD: POST accept
        RD->>R: Assign rider to order
    else Timeout
        RD->>RT: Emit order:available → next nearest rider
    end
```

**Key improvement over broadcast:** Previously all nearby riders got the alert simultaneously. Now riders are offered **one at a time, nearest first**, with a **10-second accept window** each.

---

## 📡 Real-Time Events (Socket.IO)

**Connection:** Frontend connects to Realtime service with JWT in `handshake.auth.token`.

**Auto-join rooms on connect:**
- `user:{userId}` — all users
- `restaurant:{restaurantId}` — sellers (if JWT contains restaurantId)

| Event | Emitted By | Room | Frontend Listener |
|-------|-----------|------|-------------------|
| `order:new` | Restaurant (payment success) | `restaurant:{id}` | Seller orders panel |
| `order:update` | Restaurant (status change) | `user:{customerId}` | Orders, OrderPage |
| `order:rider_assigned` | Restaurant (rider assign/status) | `user:{customerId}`, `restaurant:{id}` | Orders, OrderPage, Seller |
| `order:available` | Rider dispatch consumer | `user:{riderUserId}` | RiderDashboard |
| `rider:location` | Rider frontend → internal emit | `user:{customerUserId}` | OrderPage map |

**Internal emit API:** `POST /api/v1/internal/emit` with `x-internal-key` header.

---

## 🐰 RabbitMQ Message Flows

| Queue | Env Variable | Publisher | Consumer | Event | Effect |
|-------|-------------|-----------|----------|-------|--------|
| `payment_event` | `PAYMENT_QUEUE` | Utils | Restaurant | `PAYMENT_SUCCESS` | Mark paid, increment coupon, notify seller |
| `order_ready_queue` | `ORDER_READY_QUEUE` | Restaurant | Rider | `ORDER_READY_FOR_RIDER` | Sequential rider dispatch |
| `rider_queue` | `RIDER_QUEUE` | — | — | — | Reserved (asserted, unused) |

### Why RabbitMQ for Payments?

Payment gateway callbacks are async and can retry. Publishing to a queue ensures:
- Payment service responds fast to the gateway
- Restaurant service processes confirmation at its own pace
- Failed processing can be retried without losing the payment event

---

## 📦 Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> placed: Customer pays
    placed --> accepted: Seller accepts
    placed --> cancelled: Seller cancels
    accepted --> preparing: Seller starts cooking
    accepted --> cancelled: Seller cancels
    preparing --> ready_for_rider: Food ready
    preparing --> cancelled: Seller cancels
    ready_for_rider --> rider_assigned: Rider accepts
    rider_assigned --> picked_up: Rider picks up
    picked_up --> delivered: Rider delivers
    delivered --> [*]
    cancelled --> [*]
```

**Unpaid orders:** TTL index on `expiresAt` — auto-deleted after 15 minutes if payment not completed.

---

## 🛡️ Admin Dashboard

Access: Set `role: "admin"` manually in MongoDB `users` collection.

### Tabs

| Tab | Features |
|-----|----------|
| **Users** | List up to 100 users, ban/unban, shows `(You)` for logged-in admin, self-ban blocked |
| **Restaurants** | Pending verification list, one-click verify |
| **Riders** | Pending verification list, one-click verify |
| **Coupons** | Create, list, toggle active/inactive, delete |

### Coupon Management (Admin Panel)

Admin can create coupons with:

| Field | Description |
|-------|-------------|
| `code` | Unique coupon code (e.g. `SAVE20`) |
| `type` | `flat` or `percent_cap` |
| `value` | ₹ amount (flat) or percentage (percent_cap) |
| `maxDiscount` | Cap for percentage coupons |
| `minOrderAmount` | Minimum cart value required |
| `usageLimit` | Global max uses (optional) |
| `perUserLimit` | Max uses per customer |
| `expiresAt` | Expiry date |
| `description` | Display text |
| `isActive` | Toggle on/off without deleting |

Admin writes directly to MongoDB `coupons` collection — the Restaurant service's `CouponEngine` reads from the same collection at apply time.

---

## 🗄 Database Collections

| Collection | Service | Key Fields |
|------------|---------|------------|
| `users` | Auth, Admin | name, email, role, isBanned |
| `restaurants` | Restaurant | name, ownerId, autoLocation (2dsphere), isOpen, isVerified, avgRating |
| `menuitems` | Restaurant | restaurantId, name, price, image, isAvailable |
| `carts` | Restaurant | userId, restaurantId, itemId, quauntity |
| `addresses` | Restaurant | userId, formattedAddress, location (2dsphere) |
| `orders` | Restaurant | items, fees, coupon, status, payment, rider, distance, expiresAt |
| `riders` | Rider | userId, documents, location (2dsphere), isVerified, avgRating |
| `reviews` | Restaurant | userId, restaurantId, orderId (unique), rating |
| `riderreviews` | Restaurant | userId, riderId, orderId (unique), rating |
| `coupons` | Restaurant, Admin | code, type, value, limits, expiresAt, isActive |

---

## 📡 API Reference

### Auth — `:5007/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | — | Google OAuth login |
| PUT | `/add/role` | JWT | Assign role (customer/seller/rider) |
| GET | `/me` | JWT | Current user profile |

### Restaurant — `:5001`

| Prefix | Key Routes |
|--------|-----------|
| `/api/restaurant` | POST `/new`, GET `/my`, GET `/all`, PUT `/status`, PUT `/edit`, GET `/:id` |
| `/api/item` | POST `/new`, GET `/all/:id`, PUT `/:itemId`, DELETE `/:itemId`, PUT `/status/:itemId` |
| `/api/cart` | POST `/add`, GET `/all`, PUT `/inc`, PUT `/dec`, DELETE `/clear` |
| `/api/address` | POST `/new`, GET `/all`, DELETE `/:id` |
| `/api/order` | POST `/new`, GET `/myorder`, GET `/:id`, PUT `/:orderId`, GET `/analytics/:restaurantId` |
| `/api/coupon` | POST `/validate` |
| `/api/review` | POST `/`, GET `/my`, GET `/restaurant/:id`, GET `/rider/:id` |

**Internal routes** (require `x-internal-key`):
- `GET /api/order/payment/:id`
- `PUT /api/order/assign/rider`
- `GET /api/order/current/rider`
- `PUT /api/order/update/status/rider`
- `GET /api/order/rider/earnings`
- `GET /api/order/rider/dispatch/:orderId`

### Utils — `:5002`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Cloudinary image upload |
| POST | `/api/payment/create` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify Razorpay payment |
| POST | `/api/payment/stripe/create` | Create Stripe session |
| POST | `/api/payment/stripe/verify` | Verify Stripe payment |

### Realtime — `:5004`

| Type | Path | Description |
|------|------|-------------|
| WebSocket | Socket.IO | JWT-authenticated connection |
| POST | `/api/v1/internal/emit` | Internal event broadcast |

### Rider — `:5005/api/rider`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/new` | Register rider profile |
| GET | `/myprofile` | Get rider profile |
| GET | `/earnings` | Earnings + trip history |
| PATCH | `/toggle` | Online/offline + GPS |
| POST | `/accept/:orderId` | Accept delivery |
| GET | `/order/current` | Active delivery |
| PUT | `/order/update/:orderId` | Update delivery status |
| PATCH | `/internal/rating` | Sync rating (internal) |

### Admin — `:5006/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id/status` | Ban/unban user |
| GET | `/admin/restaurant/pending` | Pending restaurants |
| PATCH | `/verify/restaurant/:id` | Verify restaurant |
| GET | `/admin/rider/pending` | Pending riders |
| PATCH | `/verify/rider/:id` | Verify rider |
| GET | `/admin/coupons` | List all coupons |
| POST | `/admin/coupon` | Create coupon |
| PATCH | `/admin/coupon/:id` | Update coupon |
| PATCH | `/admin/coupon/:id/toggle` | Toggle active |
| DELETE | `/admin/coupon/:id` | Delete coupon |

---

## 🛠 Tech Stack

### Frontend
React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · React Router 7 · Axios · Socket.IO Client · Leaflet + OSRM · Recharts · jsPDF · react-hot-toast · Google OAuth · Stripe.js

### Backend (each service)
Node.js · Express 5 · TypeScript · Mongoose 9 · amqplib · jsonwebtoken · multer · axios

### Infrastructure
MongoDB Atlas · RabbitMQ (CloudAMQP or Docker) · Cloudinary · Razorpay · Stripe · Google OAuth · OpenStreetMap · Nominatim · OSRM

---

## 📁 Project Structure

```
TOMATO/
├── frontend/                    # React SPA (port 5173)
│   ├── src/
│   │   ├── pages/               # Route pages (Explore, Checkout, Admin, etc.)
│   │   ├── components/          # UI components (maps, charts, modals)
│   │   ├── context/             # AppContext, SocketContext, ThemeContext
│   │   ├── utils/               # eta.ts, errors.ts, orderflow.ts
│   │   └── types.ts             # Shared TypeScript interfaces
│   └── vercel.json              # SPA deploy config
│
├── services/
│   ├── auth/                    # :5007 — Google OAuth, JWT, roles
│   ├── restaurant/              # :5001 — Core business logic
│   │   └── src/coupon/          # ★ Discount engine (Strategy, Factory, Facade)
│   ├── utils/                   # :5002 — Upload, payments, RabbitMQ publish
│   ├── realtime/                # :5004 — Socket.IO + internal emit
│   ├── rider/                   # :5005 — Profiles, dispatch consumer
│   └── admin/                   # :5006 — Direct MongoDB admin ops
│
├── ARCHITECTURE.md              # Mermaid architecture diagrams
├── VIVA_DOCUMENTATION.md        # Viva / interview prep doc
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** and npm 9+
- **MongoDB Atlas** cluster (free tier works)
- **RabbitMQ** — local Docker or [CloudAMQP](https://www.cloudamqp.com/) free plan
- **Google OAuth** credentials ([Google Cloud Console](https://console.cloud.google.com))
- **Cloudinary** account (free tier)
- **Razorpay** test keys + **Stripe** test keys

### 1. Clone & Install

```bash
git clone <repo-url>
cd TOMATO

# Frontend
cd frontend && npm install && cd ..

# All backend services
for dir in auth restaurant utils realtime rider admin; do
  (cd services/$dir && npm install)
done
```

### 2. Environment Variables

Copy and fill `.env` files for each service (see [Environment Variables](#-environment-variables) section below).

**Critical:** `JWT_SEC` and `INTERNAL_SERVICE_KEY` must be **identical** across all services and frontend.

### 3. Start RabbitMQ (Local Docker)

```bash
docker run -d --name bytebites-rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3-management
```

Management UI: http://localhost:15672 (admin / admin123)

### 4. Start Services (7 terminals)

Start in this order:

```bash
# Terminal 1 — Auth
cd services/auth && npm run dev          # :5007

# Terminal 2 — Utils
cd services/utils && npm run dev         # :5002

# Terminal 3 — Realtime
cd services/realtime && npm run dev      # :5004

# Terminal 4 — Restaurant (needs RabbitMQ)
cd services/restaurant && npm run dev   # :5001

# Terminal 5 — Rider (needs RabbitMQ)
cd services/rider && npm run dev        # :5005

# Terminal 6 — Admin
cd services/admin && npm run dev        # :5006

# Terminal 7 — Frontend
cd frontend && npm run dev              # :5173
```

### 5. Create Admin User

In MongoDB Atlas shell or Compass:

```javascript
db.users.updateOne(
  { email: "your@gmail.com" },
  { $set: { role: "admin" } }
)
```

### 6. Open App

- **Landing:** http://localhost:5173
- **App (after login):** http://localhost:5173/explore

---

## 🔐 Environment Variables

### Shared (must match across services)

| Variable | Used By |
|----------|---------|
| `JWT_SEC` | auth, restaurant, rider, realtime, admin |
| `INTERNAL_SERVICE_KEY` | restaurant, utils, realtime, rider + `VITE_INTERNAL_SERVICE_KEY` in frontend |

<details>
<summary><b>Auth</b> — <code>services/auth/.env</code></summary>

```env
PORT=5007
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

</details>

<details>
<summary><b>Restaurant</b> — <code>services/restaurant/.env</code></summary>

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RIDER_SERVICE=http://localhost:5005
INTERNAL_SERVICE_KEY=your-internal-service-key
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_event
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

</details>

<details>
<summary><b>Utils</b> — <code>services/utils/.env</code></summary>

```env
PORT=5002
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_SECRET_KEY=your_api_secret
STRIPE_SECRET_KEY=sk_test_xxxx
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
FRONTEND_URL=http://localhost:5173
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=your-internal-service-key
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_event
```

</details>

<details>
<summary><b>Realtime</b> — <code>services/realtime/.env</code></summary>

```env
PORT=5004
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
INTERNAL_SERVICE_KEY=your-internal-service-key
```

</details>

<details>
<summary><b>Rider</b> — <code>services/rider/.env</code></summary>

```env
PORT=5005
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=your-internal-service-key
RABBITMQ_URL=amqp://admin:your_password@localhost:5672
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

</details>

<details>
<summary><b>Admin</b> — <code>services/admin/.env</code></summary>

```env
PORT=5006
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
DB_NAME=Zomato_Clone
```

</details>

<details>
<summary><b>Frontend</b> — <code>frontend/.env</code></summary>

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
VITE_INTERNAL_SERVICE_KEY=your-internal-service-key
```

</details>

---

## 📚 Additional Docs

| File | Purpose |
|------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 12 Mermaid diagrams — system, payment, order, socket flows |
| [VIVA_DOCUMENTATION.md](./VIVA_DOCUMENTATION.md) | Interview / viva prep — Q&A, formulas, talking points |

---

## 🎓 Viva Talking Points

1. **Why microservices?** — Independent scaling, fault isolation, team ownership per domain
2. **Why RabbitMQ for payments?** — Decouple payment gateway callback from order confirmation; retry-safe
3. **Coupon engine patterns** — Strategy for algorithms, Factory for selection, Facade for single entry, Repository for data access
4. **Dynamic ETA** — Rule-based (Haversine + speed model); can upgrade to OSRM routing or historical averages
5. **Smart dispatch** — Sequential nearest-first with timeout; fairer than broadcast-to-all
6. **Geospatial** — MongoDB `2dsphere` indexes on restaurants, riders, addresses for proximity queries
7. **Real-time** — Socket.IO rooms per user/restaurant; internal HTTP emit for service-to-service events
8. **Security** — JWT for client auth, `x-internal-key` for service-to-service, ban enforcement, role-based UI routing

---

<div align="center">

**Built with ❤️ following production-style patterns**

ByteBites · Crave it. Order it. Love it.

</div>
