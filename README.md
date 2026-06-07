<div align="center">

# 🍔 ByteBites

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1200&color=E23744&center=true&vCenter=true&width=680&lines=Production-Grade+Food+Delivery+Platform;6+Independent+Microservices;Real-Time+Tracking+%7C+RabbitMQ+%7C+AWS+EC2)](https://git.io/typing-svg)

<br />

**A full-stack, microservices-based food delivery platform — connecting customers, restaurant partners, delivery riders & platform admins across 6 independent services.**

<br />

[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel&logoColor=white)](./README.md#-deployment-architecture) [![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square&logo=render&logoColor=white)](./README.md#-deployment-architecture) [![AWS EC2](https://img.shields.io/badge/AWS_EC2-RabbitMQ-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](./README.md#aws-ec2--rabbitmq-setup) [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](./README.md#-database-design) [![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io&logoColor=white)](./README.md#-real-time-events) [![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Messaging-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)](./README.md#-rabbitmq-queues)

[![React](https://img.shields.io/badge/React_19-Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](./README.md#-tech-stack) [![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=flat-square&logo=razorpay&logoColor=white)](./README.md#-payment-system) [![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)](./README.md#-payment-system) [![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker&logoColor=white)](./README.md#-deployment-architecture) [![Microservices](https://img.shields.io/badge/Microservices-6_Services-E23744?style=flat-square)](./README.md#microservices-overview) [![Real--time](https://img.shields.io/badge/Real--time-Live_Tracking-010101?style=flat-square&logo=socket.io&logoColor=white)](./README.md#-real-time-events)

<br />

[Overview](#-overview) · [Demo](#-demo) · [Features](#-platform-features) · [Architecture](#-system-architecture) · [Deployment](#-deployment-architecture) · [Local Setup](#-local-development) · [API Reference](#-api-reference) · [Limitations](#-known-limitations) · [Author](#-author)

<br />

***Crave it. Order it. Love it.***

</div>

---

## Demo

**[▶ Watch full platform demo](https://drive.google.com/file/d/1dFfNB1KGfTNGw0WirO0h5zulQg5hJMcx/view?usp=drive_link)**

### Landing Page

<img src="./docs/screenshots/landing-hero.png" width="100%" alt="ByteBites landing page"/>

### System Architecture

<img src="./docs/screenshots/architecture.png" width="100%" alt="ByteBites microservices architecture"/>

---

## Overview

**ByteBites** is an end-to-end food delivery platform that connects four distinct user roles — **customers**, **restaurant partners**, **delivery riders**, and **platform administrators** — inside a single cohesive ecosystem.

The platform is engineered as a **distributed system**, not a monolith. Six independent Node.js microservices communicate over HTTP and message queues, while a React frontend delivers role-specific dashboards with live maps, analytics, and instant notifications.

### What makes this project different

| Aspect | Implementation |
|--------|----------------|
| **Architecture** | Domain-driven microservices with clear service boundaries |
| **Async processing** | RabbitMQ decouples payment confirmation from order fulfillment |
| **Real-time layer** | Socket.IO rooms for live order state and rider GPS tracking |
| **Geospatial engine** | MongoDB `2dsphere` indexes for proximity search and rider dispatch |
| **Pricing engine** | Distance-aware delivery fees, small-order surcharge, coupon discounts |
| **Design patterns** | Strategy, Factory, Facade, and Repository patterns in the coupon module |
| **Operational readiness** | Dockerfiles per service, env-based config, rate limiting, internal service auth |
| **Concurrent capacity** | ~50–100 active users smoothly on current stack (see [Capacity section](#capacity--concurrent-users)) |
| **Cloud deployment** | Frontend on Vercel, services on Render, message broker on AWS EC2 |

ByteBites is designed, built, and deployed as a **standalone product** — with its own branding, pricing logic, dispatch algorithm, admin tooling, and cloud infrastructure.

---

## Platform Features

### Customer Experience

| Feature | Details |
|---------|---------|
| **Authentication** | Google OAuth with JWT sessions (15-day expiry) |
| **Onboarding** | Role selection — Customer, Seller, or Rider |
| **Discovery** | Geo-based restaurant search within configurable radius (~5 km) |
| **Search & filters** | Text search + category chips on restaurant name/description |
| **Dynamic ETA** | Haversine distance model with status-aware countdown on tracking page |
| **Restaurant page** | Menu browsing, ratings, customer reviews |
| **Smart cart** | Single-restaurant cart enforcement with quantity controls |
| **Saved addresses** | Leaflet map picker with OpenStreetMap + Nominatim reverse geocoding |
| **Checkout** | Address selection, live coupon validation, transparent fee breakdown |
| **Dual payments** | Razorpay (INR / UPI) and Stripe (international cards) |
| **Order tracking** | Live map with OSRM routing and rider GPS dot |
| **Order history** | Status badges, reorder from past orders, PDF receipt download |
| **Cancellation** | Free cancel before restaurant starts preparing |
| **Reviews** | Separate ratings for restaurant and delivery partner post-delivery |
| **Theming** | Dark / light mode across the entire application |

### Restaurant Partner (Seller)

| Feature | Details |
|---------|---------|
| **Onboarding** | Register restaurant with image, description, and geo-location |
| **Verification gate** | Admin approval required before going live |
| **Operations** | Open / close toggle, profile editing |
| **Menu management** | Add, edit, delete items with Cloudinary image upload |
| **Availability control** | Toggle individual menu items on/off |
| **Live order feed** | Real-time incoming orders with sound alerts |
| **Order workflow** | `placed → accepted → preparing → ready_for_rider` |
| **Cancellation** | Cancel from placed, accepted, or preparing states |
| **Dispatch retry** | Re-trigger rider dispatch if no rider accepts |
| **Sales analytics** | 7-day revenue chart, top items, order status breakdown |

### Delivery Rider

| Feature | Details |
|---------|---------|
| **Profile registration** | Photo, phone, identity documents, live GPS on signup |
| **Verification gate** | Admin must verify before rider can go online |
| **Availability toggle** | Online/offline with live location update |
| **Smart dispatch** | Sequential nearest-first offer with 10-second accept window |
| **Order alerts** | Socket notification + sound on incoming delivery request |
| **Active delivery** | Pickup/drop details, customer phone, earnings per trip |
| **Status updates** | `rider_assigned → picked_up → delivered` |
| **Live GPS broadcast** | Customer sees rider position on map during delivery |
| **Earnings dashboard** | Today / week / all-time earnings with 7-day chart |
| **Trip history** | Last 30 deliveries with route map snapshots |
| **Rating display** | Average stars from customer reviews |

### Platform Admin

| Feature | Details |
|---------|---------|
| **User management** | List users, ban/unban accounts (self-ban blocked) |
| **Restaurant verification** | Approve pending restaurant partners |
| **Rider verification** | Approve pending delivery riders |
| **Coupon management** | Full CRUD — create, edit, toggle, delete promotional codes |
| **Platform analytics** | GMV, total collected, platform fees, 7-day GMV chart |
| **Top performers** | Restaurants ranked by revenue across the platform |
| **Direct DB access** | Native MongoDB driver for fast admin operations |

---

## System Architecture

### High-Level Design

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        FE["React SPA<br/>Vite · TypeScript · Tailwind"]
    end

    subgraph Services["Application Layer — Node.js Microservices"]
        AUTH["Auth Service<br/>:5007"]
        REST["Restaurant Service<br/>:5001"]
        UTILS["Utils Service<br/>:5002"]
        RT["Realtime Service<br/>:5004"]
        RIDER["Rider Service<br/>:5005"]
        ADMIN["Admin Service<br/>:5006"]
    end

    subgraph Data["Data & Messaging Layer"]
        MONGO[("MongoDB Atlas")]
        RMQ["RabbitMQ<br/>AWS EC2"]
    end

    subgraph External["External Integrations"]
        GOOGLE["Google OAuth"]
        CLOUD["Cloudinary"]
        RAZOR["Razorpay"]
        STRIPE["Stripe"]
        OSRM["OSRM Routing"]
        NOM["Nominatim"]
    end

    FE -->|"REST + JWT"| AUTH & REST & UTILS & RIDER & ADMIN
    FE -->|"WebSocket"| RT
    FE --> GOOGLE & OSRM & NOM

    AUTH & REST & RIDER --> MONGO
    ADMIN --> MONGO

    REST & UTILS -->|"publish/consume"| RMQ
    RIDER -->|"consume"| RMQ

    REST & RIDER & UTILS -->|"internal emit"| RT
    RIDER --> REST
    UTILS --> REST
    UTILS --> CLOUD & RAZOR & STRIPE
    AUTH --> GOOGLE
```

### Microservices Overview

| Service | Port | Responsibility |
|---------|------|----------------|
| **Frontend** | 5173 | React SPA — all role dashboards, maps, charts, checkout |
| **Auth** | 5007 | Google OAuth, JWT issuance, role assignment, ban enforcement |
| **Restaurant** | 5001 | Restaurants, menu, cart, addresses, orders, coupons, reviews, analytics |
| **Utils** | 5002 | Cloudinary uploads, Razorpay/Stripe payments, payment event publishing |
| **Realtime** | 5004 | Socket.IO server + internal HTTP broadcast API |
| **Rider** | 5005 | Rider profiles, availability, dispatch consumer, earnings proxy |
| **Admin** | 5006 | User/restaurant/rider verification, coupon CRUD, platform analytics |

### Inter-Service Communication

```
Browser
  ├── HTTP  → Auth, Restaurant, Utils, Rider, Admin  (Bearer JWT)
  ├── WS    → Realtime                                  (JWT in handshake)
  └── POST  → Realtime /internal/emit                   (rider GPS from client)

Restaurant Service
  ├── HTTP publish  → RabbitMQ (order_ready_queue)
  ├── HTTP consume  ← RabbitMQ (payment_event)
  ├── HTTP call     → Utils (image upload)
  ├── HTTP call     → Realtime (socket events)
  └── HTTP call     → Rider Service (rating sync)

Rider Service
  ├── HTTP consume  ← RabbitMQ (order_ready_queue)
  ├── HTTP call     → Restaurant (assign rider, status, earnings)
  ├── HTTP call     → Realtime (notify riders)
  └── HTTP call     → Utils (profile image upload)

Utils Service
  ├── HTTP publish  → RabbitMQ (payment_event)
  └── HTTP call     → Restaurant (fetch order for payment)

Admin Service
  └── Direct MongoDB driver (no inter-service HTTP)
```

### Security Model

| Layer | Mechanism |
|-------|-----------|
| **Client authentication** | JWT signed with shared `JWT_SEC`, verified on every protected route |
| **Service-to-service** | `x-internal-key` header with shared `INTERNAL_SERVICE_KEY` |
| **Socket authentication** | JWT passed in `handshake.auth.token`, verified before room join |
| **Rate limiting** | Per-service `express-rate-limit` on auth, orders, coupons (internal requests skipped) |
| **Account enforcement** | Banned users blocked at login; admin self-ban prevented |
| **Role isolation** | Frontend route guards + backend middleware per role |

### Capacity & Concurrent Users

> **Note:** No formal load test (k6 / Artillery) has been run yet. The numbers below are **derived from the actual `express-rate-limit` configs in code** and the **current cloud tier limits** (Render Web Services, MongoDB Atlas M0, AWS EC2 t2.micro RabbitMQ, single Realtime Socket.IO instance).

#### Configured rate limits (from codebase)

| Service | Limiter | Window | Max requests | Applies to |
|---------|---------|--------|--------------|------------|
| Auth | `authLimiter` | 15 min | **20** | Login / OAuth (`POST /api/auth/login`) |
| Auth | `generalLimiter` | 1 min | **200** | All other auth routes |
| Restaurant | `generalLimiter` | 1 min | **200** | General API traffic |
| Restaurant | `orderCreateLimiter` | 1 min | **10** | `POST /api/order/new` |
| Restaurant | `orderWriteLimiter` | 1 min | **15** | Order status updates |
| Restaurant | `couponLimiter` | 1 min | **30** | `POST /api/coupon/validate` |
| Utils | `paymentLimiter` | 1 min | **20** | Payment create / verify |
| Utils | `uploadLimiter` | 1 min | **30** | Image uploads |
| Utils | `generalLimiter` | 1 min | **200** | Other utils routes |
| Rider | `generalLimiter` | 1 min | **150** | Rider APIs |
| Admin | `generalLimiter` | 1 min | **100** | Admin APIs |

Internal service calls (`x-internal-key`) **skip** all limiters — RabbitMQ consumers and inter-service HTTP are not throttled.

#### Infrastructure ceilings (current deploy stack)

| Layer | Tier | Practical limit |
|-------|------|-----------------|
| **Frontend** | Vercel CDN | Not the bottleneck — static assets scale globally |
| **Backend APIs** | Render Web Service × 6 | ~512 MB RAM / shared CPU per service; cold start on free tier |
| **WebSockets** | Single Realtime instance | **~150–250** concurrent socket connections before memory/CPU pressure |
| **Database** | MongoDB Atlas **M0** | **500** max connections cluster-wide; 6 services share this pool |
| **Message broker** | EC2 **t2.micro** + RabbitMQ Docker | Fine for MVP event volume; not tuned for high-throughput burst |
| **Payments** | Razorpay / Stripe test or live | Gateway-side limits apply separately |

#### Estimated concurrent user capacity

| Scenario | Comfortable range | What breaks first |
|----------|-------------------|-------------------|
| **Browsing** (explore, menu, cart — HTTP only) | **~80–150** concurrent users | Render CPU on Restaurant service; shared MongoDB reads |
| **Live sessions** (sellers + riders + customers tracking — WebSocket open) | **~100–200** concurrent users | Single Realtime instance (no Redis adapter) |
| **Checkout burst** (pay + place order at same time) | **~10 orders/min per IP**; **~50–80** platform-wide checkout/min | `orderCreateLimiter` + `paymentLimiter` per IP |
| **Overall MVP load (mixed usage)** | **~50–100** concurrent active users smoothly | — |
| **Degraded but functional** | **~150–250** concurrent users | 429 rate-limit responses, slower API, socket reconnects |

**Local dev** (all services on localhost, Docker RabbitMQ) can handle similar concurrent counts for demos; rate limits still apply per IP.

#### How to scale beyond this

| Bottleneck | Upgrade path |
|------------|--------------|
| WebSocket ceiling | Redis adapter for Socket.IO + multiple Realtime instances |
| MongoDB connections | Atlas M10+ with per-service connection pooling / separate DBs |
| API throughput | Render autoscaling or move hot paths to dedicated instances |
| Rate limits | Tune `max` values in `services/*/middlewares/rateLimit.ts` after load testing |
| RabbitMQ | Larger EC2 instance or Amazon MQ / CloudAMQP managed broker |

---

## Deployment Architecture

ByteBites is deployed across multiple cloud providers, each chosen for what it does best:

```mermaid
flowchart LR
    subgraph Vercel["Vercel"]
        FE["React Frontend<br/>Static SPA + CDN"]
    end

    subgraph Render["Render — Web Services"]
        AUTH["Auth"]
        REST["Restaurant"]
        UTILS["Utils"]
        RT["Realtime"]
        RIDER["Rider"]
        ADMIN["Admin"]
    end

    subgraph AWS["AWS EC2"]
        RMQ["RabbitMQ<br/>Docker Container<br/>Port 5672 + 15672"]
    end

    subgraph Atlas["MongoDB Atlas"]
        DB[("Cluster<br/>M0 Free Tier")]
    end

    FE --> AUTH & REST & UTILS & RT & RIDER & ADMIN
    REST & UTILS & RIDER --> RMQ
    AUTH & REST & RIDER & ADMIN --> DB
```

### Deployment Breakdown

| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | Vercel | Zero-config SPA deploy, global CDN, automatic HTTPS |
| **Auth Service** | Render Web Service | Stateless Node.js API, auto-deploy from Git |
| **Restaurant Service** | Render Web Service | Core business logic, connects to RabbitMQ + MongoDB |
| **Utils Service** | Render Web Service | Payment webhooks and file uploads |
| **Realtime Service** | Render Web Service | Persistent WebSocket connections |
| **Rider Service** | Render Web Service | Long-running RabbitMQ consumer |
| **Admin Service** | Render Web Service | Lightweight admin API |
| **RabbitMQ** | AWS EC2 (t2.micro) | Self-hosted message broker via Docker — full control over queues, no vendor message limits |
| **Database** | MongoDB Atlas | Managed cluster with geospatial indexes, TTL, backups |

### AWS EC2 — RabbitMQ Setup

RabbitMQ runs as a Docker container on an AWS EC2 instance. This gives full ownership of the message broker — critical for payment events and rider dispatch queues.

**EC2 instance setup:**

```bash
# 1. Launch EC2 (Ubuntu 22.04, t2.micro or t3.micro)
# 2. Open security group ports: 22 (SSH), 5672 (AMQP), 15672 (Management UI)

# 3. Install Docker on EC2
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable docker && sudo systemctl start docker

# 4. Run RabbitMQ with management plugin
sudo docker run -d \
  --name bytebites-rabbitmq \
  --restart unless-stopped \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=<username> \
  -e RABBITMQ_DEFAULT_PASS=<strong-password> \
  rabbitmq:3-management

# 5. Verify — Management UI at http://<EC2_PUBLIC_IP>:15672
```

**Connect services to EC2 RabbitMQ:**

```env
# In restaurant, utils, and rider service .env on Render:
RABBITMQ_URL=amqp://<username>:<password>@<EC2_PUBLIC_IP>:5672
PAYMENT_QUEUE=payment_event
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

> **Note:** Restrict port 5672 to Render service IPs or use an AWS Security Group that only allows inbound AMQP from known sources. Never expose RabbitMQ credentials in client-side code.

### Render — Microservices Deployment

Each backend service is deployed as a separate **Render Web Service**:

1. Connect GitHub repository to Render
2. Create one Web Service per microservice (`services/auth`, `services/restaurant`, etc.)
3. Set **Root Directory** to the service folder (e.g. `services/restaurant`)
4. Set **Build Command:** `npm install && npm run build`
5. Set **Start Command:** `npm start`
6. Add all environment variables from the [Environment Variables](#-environment-variables) section
7. Use Render's internal URLs or public `.onrender.com` URLs for inter-service communication

**Render environment variable pattern:**

```env
# Example for Restaurant service on Render
PORT=10000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=<same-secret-across-all-services>
INTERNAL_SERVICE_KEY=<same-key-across-all-services>
UTILS_SERVICE=https://<utils-service-name>.onrender.com
REALTIME_SERVICE=https://<realtime-service-name>.onrender.com
RIDER_SERVICE=https://<rider-service-name>.onrender.com
RABBITMQ_URL=amqp://<user>:<pass>@<EC2_PUBLIC_IP>:5672
PAYMENT_QUEUE=payment_event
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

### Vercel — Frontend Deployment

1. Import the repository on Vercel
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add environment variables:

```env
VITE_AUTH_SERVICE=https://<auth-service>.onrender.com
VITE_RESTAURANT_SERVICE=https://<restaurant-service>.onrender.com
VITE_UTILS_SERVICE=https://<utils-service>.onrender.com
VITE_REALTIME_SERVICE=https://<realtime-service>.onrender.com
VITE_RIDER_SERVICE=https://<rider-service>.onrender.com
VITE_ADMIN_SERVICE=https://<admin-service>.onrender.com
VITE_GOOGLE_CLIENT_ID=<google-client-id>
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
VITE_INTERNAL_SERVICE_KEY=<same-as-backend>
```

5. Add authorized JavaScript origins in Google Cloud Console for the Vercel domain
6. `vercel.json` handles SPA routing (all paths → `index.html`)

---

## Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> placed: Payment confirmed
    placed --> accepted: Restaurant accepts
    placed --> cancelled: Customer or seller cancels
    accepted --> preparing: Kitchen starts
    accepted --> cancelled: Seller cancels
    preparing --> ready_for_rider: Food ready
    preparing --> cancelled: Seller cancels
    ready_for_rider --> rider_assigned: Rider accepts
    rider_assigned --> picked_up: Rider at restaurant
    picked_up --> delivered: Rider at customer
    delivered --> [*]
    cancelled --> [*]
```

| Status | Triggered By | What Happens Next |
|--------|-------------|-------------------|
| `placed` | Payment success via RabbitMQ | Restaurant notified via socket |
| `accepted` | Seller action | Customer ETA updates |
| `preparing` | Seller action | Customer sees kitchen progress |
| `ready_for_rider` | Seller action | RabbitMQ event → rider dispatch starts |
| `rider_assigned` | Rider accepts | Customer + seller notified with rider details |
| `picked_up` | Rider action | Live GPS tracking begins |
| `delivered` | Rider action | Review prompt shown to customer |
| `cancelled` | Customer (pre-preparing) or seller | Refund message displayed |

**Unpaid order cleanup:** Orders with `paymentStatus: pending` have a TTL index on `expiresAt` — automatically removed after 15 minutes.

---

## Smart Rider Dispatch

When a restaurant marks an order as `ready_for_rider`, the platform runs a **sequential nearest-first dispatch algorithm**:

```mermaid
sequenceDiagram
    participant S as Restaurant Partner
    participant R as Restaurant Service
    participant Q as RabbitMQ (EC2)
    participant RD as Rider Service
    participant RT as Realtime
    participant Rider as Rider App

    S->>R: PUT status = ready_for_rider
    R->>Q: Publish ORDER_READY_FOR_RIDER
    Q->>RD: Consume event
    RD->>RD: $geoNear — verified + online riders, sorted by distance
    RD->>RT: Emit order:available → nearest rider
    Note over Rider: 10-second accept window
    alt Rider accepts
        Rider->>RD: POST /accept/:orderId
        RD->>R: PUT /assign/rider
        R->>RT: Emit order:rider_assigned
    else Timeout
        RD->>RT: Emit order:available → next nearest rider
    end
```

| Parameter | Value | Configurable Via |
|-----------|-------|----------------|
| Dispatch radius | 5000m (local) / 500m (production) | `RIDER_DISPATCH_RADIUS_M` |
| Offer timeout | 10 seconds per rider | Code constant |
| Rider requirements | `isVerified: true`, `isAvailble: true` | Admin verification + online toggle |
| Sort order | Nearest first (`$geoNear` + `$sort`) | MongoDB aggregation |

---

## Payment System

ByteBites supports dual payment gateways to serve both domestic and international users.

```mermaid
sequenceDiagram
    participant C as Customer
    participant U as Utils Service
    participant PG as Razorpay / Stripe
    participant Q as RabbitMQ
    participant R as Restaurant Service
    participant RT as Realtime

    C->>U: POST /api/payment/create
    U->>PG: Create payment order/session
    PG-->>C: Payment UI (checkout modal)
    C->>PG: Complete payment
    PG->>U: Webhook / verify callback
    U->>Q: Publish PAYMENT_SUCCESS
    Q->>R: Consume payment event
    R->>R: Mark order paid, record coupon usage
    R->>RT: Emit order:new → restaurant room
```

| Gateway | Currency | Use Case |
|---------|----------|----------|
| **Razorpay** | INR | UPI, cards, netbanking — primary for India |
| **Stripe** | Multi-currency | International card payments |

**Why RabbitMQ for payments?** Payment gateway callbacks are asynchronous and may retry. Publishing to a durable queue ensures the Utils service responds instantly to the gateway while the Restaurant service processes confirmation at its own pace — no lost payments, no blocking HTTP chains.

---

## Pricing Engine

Implemented in `services/restaurant/src/pricing/orderPricing.ts` with a mirrored frontend module for checkout preview consistency.

| Fee Component | Rule |
|---------------|------|
| **Minimum order** | ₹50 — orders below this are rejected |
| **Delivery fee** | Distance-tiered: ₹29 (≤2 km), ₹39 (≤5 km), ₹49 (>5 km); free above ₹250 subtotal |
| **Platform fee** | ₹7 flat |
| **Small order fee** | ₹15 if subtotal is ₹50–₹99 |
| **Coupon discount** | Applied via CouponEngine (see below) |
| **Rider payout** | `ceil(distance_km) × ₹17` per delivery |

---

## Coupon & Discount Engine

Located in `services/restaurant/src/coupon/` — a modular discount system built with established software design patterns.

### Design Patterns

| Pattern | Class | Purpose |
|---------|-------|---------|
| **Facade** | `CouponEngine` | Single `apply()` entry point hiding validation + calculation |
| **Strategy** | `DiscountStrategy` | Pluggable discount algorithms |
| **Factory** | `DiscountStrategyFactory` | Returns strategy by coupon type |
| **Repository** | `CouponRepository` | Abstracts MongoDB coupon queries |
| **Validator** | `CouponValidator` | Chain of eligibility checks |
| **Custom Error** | `CouponError` | Typed errors with HTTP status codes |

### Coupon Types

| Type | Algorithm | Example |
|------|-----------|---------|
| `flat` | Fixed amount off, capped at subtotal | `FLAT50` → ₹50 off |
| `percent_cap` | Percentage off with maximum cap | `SAVE20` → 20% off, max ₹100 |

### Validation Chain

Before any discount is applied, `CouponValidator` runs these checks in order:

1. **Active** — `isActive === true`
2. **Not expired** — `expiresAt > now`
3. **Min order** — `subtotal >= minOrderAmount`
4. **Global usage limit** — `usedCount < usageLimit` (if set)
5. **Per-user limit** — counts paid orders with same `couponId` for this user

### Class Diagram (LLD)

```mermaid
classDiagram
    class CouponEngine {
        -repository: CouponRepository
        -validator: CouponValidator
        +apply(code, context) DiscountResult
        +recordUsage(couponId) void
        -buildDescription(coupon, amount) string
    }

    class CouponRepository {
        +findByCode(code) ICouponData
        +incrementUsage(couponId) void
    }

    class CouponValidator {
        +validate(coupon, context) void
        -assertActive(coupon) void
        -assertNotExpired(coupon) void
        -assertMinOrder(coupon, subtotal) void
        -assertUsageLimit(coupon) void
        -assertPerUserLimit(coupon, userId) void
    }

    class DiscountStrategyFactory {
        -strategies: Record~CouponType, DiscountStrategy~
        +getStrategy(type)$ DiscountStrategy
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

    class ICouponData {
        +_id: string
        +code: string
        +type: CouponType
        +value: number
        +maxDiscount: number
        +minOrderAmount: number
        +usageLimit: number
        +usedCount: number
        +perUserLimit: number
        +expiresAt: Date
        +isActive: boolean
    }

    class DiscountApplyContext {
        +subtotal: number
        +userId: string
    }

    class DiscountResult {
        +discountAmount: number
        +couponId: string
        +couponCode: string
        +couponType: CouponType
        +description: string
    }

    CouponEngine --> CouponRepository
    CouponEngine --> CouponValidator
    CouponEngine --> DiscountStrategyFactory
    DiscountStrategyFactory --> DiscountStrategy
    DiscountStrategy <|.. FlatDiscountStrategy
    DiscountStrategy <|.. PercentWithCapStrategy
    CouponValidator --> CouponError
    CouponEngine --> CouponError
    CouponValidator ..> ICouponData
    CouponEngine ..> DiscountApplyContext
    CouponEngine ..> DiscountResult
```

### Sequence Diagram — Checkout Validation

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend (Checkout)
    participant API as Restaurant Service
    participant CE as CouponEngine
    participant REPO as CouponRepository
    participant VAL as CouponValidator
    participant FACT as DiscountStrategyFactory
    participant STRAT as DiscountStrategy
    participant DB as MongoDB

    C->>FE: Enter coupon code + view cart
    FE->>API: POST /api/coupon/validate { code, subtotal, distanceKm }
    API->>CE: apply(code, { subtotal, userId })

    CE->>REPO: findByCode(code)
    REPO->>DB: Coupon.findOne({ code })
    DB-->>REPO: coupon document
    REPO-->>CE: ICouponData

    CE->>VAL: validate(coupon, context)
    VAL->>VAL: assertActive()
    VAL->>VAL: assertNotExpired()
    VAL->>VAL: assertMinOrder()
    VAL->>DB: count paid orders (per-user limit)
    VAL-->>CE: ok

    CE->>FACT: getStrategy(coupon.type)
    FACT-->>CE: FlatDiscountStrategy | PercentWithCapStrategy
    CE->>STRAT: calculate(subtotal, coupon)
    STRAT-->>CE: discountAmount

    CE-->>API: DiscountResult
    API->>API: calculateOrderPricing(subtotal, discount, distance)
    API-->>FE: { valid, discountAmount, fees, totalAmount }
    FE-->>C: Updated checkout preview
```

### Sequence Diagram — Order Creation & Usage Recording

```mermaid
sequenceDiagram
    actor C as Customer
    participant API as Restaurant Service
    participant CE as CouponEngine
    participant DB as MongoDB
    participant U as Utils Service
    participant Q as RabbitMQ
    participant PC as Payment Consumer

    C->>API: POST /api/order/new { couponCode, addressId, ... }
    API->>CE: apply(couponCode, { subtotal, userId })
    CE-->>API: DiscountResult
    API->>DB: Order.create({ couponId, discountAmount, paymentStatus: pending })
    API-->>C: { orderId, amount }

    C->>U: POST /api/payment/create + verify
    U->>Q: Publish PAYMENT_SUCCESS { orderId, paymentId }
    Q->>PC: Consume event
    PC->>DB: Order.update({ paymentStatus: paid, status: placed })
    PC->>CE: recordUsage(couponId)
    CE->>DB: Coupon.usedCount += 1
    PC->>PC: Socket emit order:new → restaurant
```

---

## Dynamic ETA System

Rule-based ETA engine in `frontend/src/utils/eta.ts` using Haversine distance and configurable speed constants.

```
Travel time  = (distance_km ÷ 22 km/h) × 60 minutes
Base ETA     = 15 min prep + travel time + 5 min buffer
Display      = [total − 5, total + 5] clamped to [20, 60] minutes
```

| Screen | ETA Source |
|--------|-----------|
| Explore cards | User → restaurant Haversine distance |
| Restaurant page | Same distance model |
| Checkout | Updates when delivery address changes |
| Live tracking | Status-aware — adjusts through each order stage |
| Post pickup | Live rider GPS → customer distance when available |

---

## Real-Time Events

Socket.IO powers all live updates. Clients connect to the Realtime service with JWT authentication and auto-join role-specific rooms.

| Event | Trigger | Target Room | Listener |
|-------|---------|-------------|----------|
| `order:new` | Payment confirmed | `restaurant:{id}` | Seller order panel |
| `order:update` | Status change | `user:{customerId}`, `restaurant:{id}` | Customer + seller |
| `order:rider_assigned` | Rider assigned / status update | `user:{customerId}`, `restaurant:{id}` | All parties |
| `order:available` | Dispatch consumer | `user:{riderUserId}` | Rider dashboard |
| `rider:location` | Rider GPS (frontend emit) | `user:{customerUserId}` | Customer tracking map |

**Internal broadcast API:** `POST /api/v1/internal/emit` — used by backend services and rider client to push events into Socket.IO rooms.

---

## RabbitMQ Queues

| Queue | Publisher | Consumer | Event | Purpose |
|-------|-----------|----------|-------|---------|
| `payment_event` | Utils | Restaurant | `PAYMENT_SUCCESS` | Async payment confirmation |
| `order_ready_queue` | Restaurant | Rider | `ORDER_READY_FOR_RIDER` | Trigger rider dispatch |
| `rider_queue` | — | — | — | Reserved for future use |

All queues are **durable** and asserted at service startup on both publisher and consumer sides.

---

## Database Design

All services share a MongoDB Atlas cluster. Geospatial collections use `2dsphere` indexes.

| Collection | Owner Service | Key Fields |
|------------|--------------|------------|
| `users` | Auth, Admin | email, role, isBanned |
| `restaurants` | Restaurant, Admin | autoLocation (2dsphere), isOpen, isVerified, avgRating |
| `menuitems` | Restaurant | restaurantId, price, isAvailable |
| `carts` | Restaurant | userId, restaurantId, itemId, quantity |
| `addresses` | Restaurant | location (2dsphere), formattedAddress |
| `orders` | Restaurant | status, payment, coupon, rider, distance, expiresAt (TTL) |
| `riders` | Rider, Admin | location (2dsphere), isVerified, isAvailble, avgRating |
| `reviews` | Restaurant | orderId (unique), rating 1–5 |
| `riderreviews` | Restaurant | orderId (unique), riderId, rating 1–5 |
| `coupons` | Restaurant (read), Admin (CRUD) | code, type, value, limits, expiresAt |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool and dev server |
| Tailwind CSS 4 | Utility-first styling |
| React Router 7 | Client-side routing |
| Socket.IO Client | Real-time events |
| Leaflet + OSRM | Maps and route rendering |
| Recharts | Analytics charts |
| jsPDF | Receipt generation |
| Axios | HTTP client |
| Google OAuth | Authentication |
| Stripe.js | International payments |

### Backend (per microservice)

| Technology | Purpose |
|------------|---------|
| Node.js 20+ | Runtime |
| Express 5 | HTTP framework |
| TypeScript | Type safety |
| Mongoose 9 | MongoDB ODM (Auth, Restaurant, Rider) |
| MongoDB Native Driver | Admin service direct access |
| amqplib | RabbitMQ client |
| jsonwebtoken | JWT auth |
| multer | File upload handling |
| express-rate-limit | API rate limiting |
| googleapis | Google OAuth token exchange |
| axios | Inter-service HTTP |

### Infrastructure & Third-Party

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Primary database with geospatial indexes |
| **AWS EC2** | Self-hosted RabbitMQ message broker |
| **Render** | Microservices hosting (6 web services) |
| **Vercel** | Frontend SPA hosting with CDN |
| **Cloudinary** | Image storage and CDN |
| **Razorpay** | Domestic payment processing |
| **Stripe** | International payment processing |
| **Google OAuth** | User authentication |
| **OpenStreetMap** | Map tiles |
| **Nominatim** | Reverse geocoding |
| **OSRM** | Route calculation |

---

## Project Structure

```
ByteBites/
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── pages/                    # Route-level pages
│   │   ├── components/               # Reusable UI, maps, charts, modals
│   │   ├── context/                  # AppContext, SocketContext, ThemeContext
│   │   ├── utils/                    # ETA engine, pricing, order flow helpers
│   │   └── types.ts                  # Shared TypeScript interfaces
│   └── vercel.json                   # SPA routing for Vercel deploy
│
├── services/
│   ├── auth/                         # :5007 — OAuth, JWT, roles
│   ├── restaurant/                   # :5001 — Core domain logic
│   │   └── src/coupon/               # Discount engine (Strategy, Factory, Facade)
│   ├── utils/                        # :5002 — Uploads, payments, MQ publish
│   ├── realtime/                     # :5004 — Socket.IO + internal emit
│   ├── rider/                        # :5005 — Profiles, dispatch consumer
│   └── admin/                        # :5006 — Verification, coupons, analytics
│
├── ARCHITECTURE.md                   # Detailed Mermaid architecture diagrams
├── VIVA_DOCUMENTATION.md             # Technical deep-dive for interviews
└── README.md                         # This file
```

Each service includes its own `Dockerfile` (multi-stage Node.js 22 Alpine build), `package.json`, `tsconfig.json`, and `.env`.

---

## Local Development

### Prerequisites

- Node.js 20+ and npm 9+
- MongoDB Atlas cluster (free M0 tier works)
- RabbitMQ — local Docker **or** AWS EC2 instance
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com))
- Cloudinary account (free tier)
- Razorpay test keys + Stripe test keys

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ByteBites

# Frontend
cd frontend && npm install && cd ..

# All backend services
for dir in auth restaurant utils realtime rider admin; do
  (cd services/$dir && npm install)
done
```

### 2. Environment Variables

Copy and fill `.env` files for each service. See the [Environment Variables](#-environment-variables) section below.

**Critical:** `JWT_SEC` and `INTERNAL_SERVICE_KEY` must be **identical** across Auth, Restaurant, Rider, Realtime, Admin, Utils, and the frontend.

### 3. Start RabbitMQ

**Option A — Local Docker (recommended for development):**

```bash
docker run -d --name bytebites-rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3-management
```

Management UI: `http://localhost:15672` (admin / admin123)

**Option B — AWS EC2 (same as production):**

Point `RABBITMQ_URL` in service `.env` files to your EC2 instance (see [AWS EC2 setup](#aws-ec2--rabbitmq-setup)).

### 4. Start All Services

Open 7 terminals and start in this order:

```bash
# Terminal 1 — Auth
cd services/auth && npm run dev          # → :5007

# Terminal 2 — Utils
cd services/utils && npm run dev         # → :5002

# Terminal 3 — Realtime
cd services/realtime && npm run dev      # → :5004

# Terminal 4 — Restaurant (requires RabbitMQ)
cd services/restaurant && npm run dev    # → :5001

# Terminal 5 — Rider (requires RabbitMQ)
cd services/rider && npm run dev         # → :5005

# Terminal 6 — Admin
cd services/admin && npm run dev         # → :5006

# Terminal 7 — Frontend
cd frontend && npm run dev               # → :5173
```

### 5. Create Admin User

In MongoDB Atlas (Compass or shell):

```javascript
db.users.updateOne(
  { email: "your@gmail.com" },
  { $set: { role: "admin" } }
);
```

### 6. Google OAuth for Localhost

In Google Cloud Console → Credentials → OAuth 2.0 Client:

- **Authorized JavaScript origins:** `http://localhost:5173`
- **Authorized redirect URIs:** `http://localhost:5173`

### 7. Open the App

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Landing page |
| `http://localhost:5173/explore` | Main app (after login) |

### Local Testing Checklist

- [ ] All 6 backend services running without errors
- [ ] RabbitMQ connected (check restaurant + rider terminal logs)
- [ ] Google login works
- [ ] Customer can browse, cart, checkout, pay
- [ ] Seller receives order via socket + sound
- [ ] Seller workflow: accept → preparing → ready for rider
- [ ] Rider is admin-verified and online near restaurant
- [ ] Rider receives dispatch notification and can accept
- [ ] Customer sees live tracking during delivery

---

## Environment Variables

### Shared Secrets (must match everywhere)

| Variable | Used By |
|----------|---------|
| `JWT_SEC` | Auth, Restaurant, Rider, Realtime, Admin |
| `INTERNAL_SERVICE_KEY` | Restaurant, Utils, Realtime, Rider + `VITE_INTERNAL_SERVICE_KEY` in frontend |

<details>
<summary><b>Auth</b> — <code>services/auth/.env</code></summary>

```env
PORT=5007
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=<64-char-secret-shared-across-all-services>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

</details>

<details>
<summary><b>Restaurant</b> — <code>services/restaurant/.env</code></summary>

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=<shared-secret>
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RIDER_SERVICE=http://localhost:5005
INTERNAL_SERVICE_KEY=<shared-internal-key>
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
CLOUD_NAME=<cloudinary-cloud-name>
CLOUD_API_KEY=<cloudinary-api-key>
CLOUD_SECRET_KEY=<cloudinary-api-secret>
STRIPE_SECRET_KEY=sk_test_xxxx
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
FRONTEND_URL=http://localhost:5173
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=<shared-internal-key>
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
PAYMENT_QUEUE=payment_event
```

</details>

<details>
<summary><b>Realtime</b> — <code>services/realtime/.env</code></summary>

```env
PORT=5004
JWT_SEC=<shared-secret>
INTERNAL_SERVICE_KEY=<shared-internal-key>
```

</details>

<details>
<summary><b>Rider</b> — <code>services/rider/.env</code></summary>

```env
PORT=5005
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=<shared-secret>
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=<shared-internal-key>
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
RIDER_DISPATCH_RADIUS_M=5000
```

</details>

<details>
<summary><b>Admin</b> — <code>services/admin/.env</code></summary>

```env
PORT=5006
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=Cluster0
JWT_SEC=<shared-secret>
DB_NAME=<your-database-name>
```

</details>

<details>
<summary><b>Frontend</b> — <code>frontend/.env</code></summary>

```env
VITE_AUTH_SERVICE=http://localhost:5007
VITE_RESTAURANT_SERVICE=http://localhost:5001
VITE_UTILS_SERVICE=http://localhost:5002
VITE_REALTIME_SERVICE=http://localhost:5004
VITE_RIDER_SERVICE=http://localhost:5005
VITE_ADMIN_SERVICE=http://localhost:5006
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
VITE_INTERNAL_SERVICE_KEY=<shared-internal-key>
```

</details>

---

## API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | — | Google OAuth login, returns JWT |
| PUT | `/add/role` | JWT | Assign role: customer / seller / rider |
| GET | `/me` | JWT | Current user profile |

### Restaurant — `/api/*`

| Prefix | Key Endpoints |
|--------|---------------|
| `/api/restaurant` | POST `/new`, GET `/my`, GET `/all`, PUT `/status`, PUT `/edit` |
| `/api/item` | POST `/new`, GET `/all/:id`, PUT `/:itemId`, DELETE `/:itemId` |
| `/api/cart` | POST `/add`, GET `/all`, PUT `/inc`, PUT `/dec`, DELETE `/clear` |
| `/api/address` | POST `/new`, GET `/all`, DELETE `/:id` |
| `/api/order` | POST `/new`, GET `/myorder`, PUT `/:orderId`, PUT `/:orderId/cancel`, POST `/:orderId/reorder` |
| `/api/coupon` | POST `/validate` |
| `/api/review` | POST `/`, GET `/my`, GET `/restaurant/:id`, GET `/rider/:id` |

**Internal routes** (require `x-internal-key`):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/order/payment/:id` | Fetch order for payment |
| PUT | `/api/order/assign/rider` | Assign rider to order |
| GET | `/api/order/current/rider` | Rider's active delivery |
| PUT | `/api/order/update/status/rider` | Rider status progression |
| GET | `/api/order/rider/earnings` | Rider earnings analytics |
| GET | `/api/order/rider/dispatch/:orderId` | Dispatch state check |

### Utils — `/api/*`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Cloudinary image upload |
| POST | `/api/payment/create` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify Razorpay payment |
| POST | `/api/payment/stripe/create` | Create Stripe checkout session |
| POST | `/api/payment/stripe/verify` | Verify Stripe payment |

### Realtime

| Type | Path | Description |
|------|------|-------------|
| WebSocket | Socket.IO | JWT-authenticated, auto-joins user/restaurant rooms |
| POST | `/api/v1/internal/emit` | Internal event broadcast |

### Rider — `/api/rider`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/new` | Register rider profile |
| GET | `/myprofile` | Get rider profile |
| GET | `/earnings` | Earnings + trip history |
| PATCH | `/toggle` | Online/offline + GPS update |
| POST | `/accept/:orderId` | Accept delivery request |
| GET | `/order/current` | Active delivery details |
| PUT | `/order/update/:orderId` | Update delivery status |
| PATCH | `/internal/rating` | Sync rating (internal) |

### Admin — `/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id/status` | Ban / unban user |
| GET | `/admin/restaurant/pending` | Pending restaurant verifications |
| PATCH | `/verify/restaurant/:id` | Approve restaurant |
| GET | `/admin/rider/pending` | Pending rider verifications |
| PATCH | `/verify/rider/:id` | Approve rider |
| GET | `/admin/coupons` | List all coupons |
| POST | `/admin/coupon` | Create coupon |
| PATCH | `/admin/coupon/:id` | Update coupon |
| PATCH | `/admin/coupon/:id/toggle` | Toggle coupon active state |
| DELETE | `/admin/coupon/:id` | Delete coupon |
| GET | `/admin/analytics` | Platform GMV and analytics |

---

## Additional Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Detailed Mermaid diagrams — payment flow, order lifecycle, socket events, coupon LLD |
| [VIVA_DOCUMENTATION.md](./VIVA_DOCUMENTATION.md) | Technical deep-dive for interviews and viva |

---

## Design Decisions & Talking Points

1. **Why microservices?** — Independent deployability, fault isolation, and clear domain ownership per service
2. **Why RabbitMQ on EC2?** — Full control over message durability and queue configuration; no third-party message limits
3. **Why Render for services?** — Simple Git-based deploys with zero DevOps overhead for stateless Node.js APIs
4. **Why Vercel for frontend?** — Global CDN, automatic HTTPS, instant preview deploys on every push
5. **Coupon engine patterns** — Strategy for algorithms, Factory for selection, Facade for a clean API surface
6. **Sequential rider dispatch** — Fairer than broadcast-all; nearest rider gets first chance with timeout fallback
7. **Dual payment gateways** — Razorpay for domestic UPI/cards, Stripe for international users
8. **Geospatial indexing** — MongoDB `2dsphere` enables sub-millisecond proximity queries at scale
9. **Rate limiting** — Protects auth and order endpoints from abuse without blocking internal service calls; tuned for ~50–100 concurrent MVP users on Render + Atlas M0
10. **TTL on unpaid orders** — Automatic cleanup prevents stale pending orders from cluttering the database

---

## Known Limitations

| Area | Limitation |
|------|------------|
| **Database** | All services share one MongoDB Atlas cluster — not fully database-per-service |
| **Rider dispatch** | Nearest-first sequential dispatch within a configurable radius; no multi-restaurant batching |
| **Real-time scaling** | Socket.IO runs on a single Realtime instance — no Redis adapter for horizontal socket clustering yet |
| **Notifications** | In-app socket alerts only — no mobile push notifications (FCM/APNs) |
| **ETA engine** | Rule-based Haversine model — not live traffic or historical ML predictions |
| **Refunds** | Customer cancel shows a refund message — no automated Razorpay/Stripe refund pipeline |
| **Admin access** | Admin role is assigned manually in MongoDB — no self-serve admin signup |
| **Testing** | No automated end-to-end or integration test suite in CI yet |
| **Offline rider** | Rider must stay online with GPS active near restaurants to receive dispatch offers |
| **Unused queue** | `rider_queue` is asserted in RabbitMQ but has no active producer/consumer |

These are intentional trade-offs for a production-style learning build — each has a clear path to improve in a v2.

---

## Author

<div align="center">

**Shubham**

Built and deployed **ByteBites** end-to-end — microservices, frontend, cloud infra, and documentation.

<br />

[![GitHub](https://img.shields.io/badge/GitHub-subhm2004-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/subhm2004)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/subhm2004/)
[![Repo](https://img.shields.io/badge/Repository-ByteBites-E23744?style=for-the-badge&logo=github&logoColor=white)](https://github.com/subhm2004/ByteBites)

<br />

*Questions, feedback, or collaboration — feel free to reach out via GitHub or LinkedIn.*

</div>

---

<div align="center">

**ByteBites** — designed, engineered, and deployed as a production-grade food delivery platform.

Built with microservices · real-time tracking · geospatial dispatch · cloud-native infrastructure

</div>
