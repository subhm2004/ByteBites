<div align="center">

# 🍔 ByteBites

### Production-Style Food Delivery Platform — Zomato / Swiggy Clone

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-CloudAMQP-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Educational-blue)](#)

**Microservices · Real-time tracking · Dual payments · Role-based dashboards**

[Features](#-features) ·
[Ports](#-service-ports) ·
[Architecture](#-system-architecture) ·
[Flows](#-core-flows) ·
[Setup](#-getting-started--complete-setup-guide) ·
[Docs](#-documentation)

<br />

<img src="https://img.shields.io/badge/Brand-%23E23744?style=for-the-badge&labelColor=1a1a1a" alt="Brand color" />

</div>

---

## 📖 About

**ByteBites** is a full-stack food delivery web application built with a **microservices architecture**. It connects **customers**, **restaurant partners**, **delivery riders**, and **platform admins** in a single ecosystem — similar to Zomato or Swiggy.

Unlike typical college monolith projects, this system uses **6 independent backend services**, **RabbitMQ** for async messaging, **Socket.IO** for live updates, **MongoDB Atlas** for cloud data, and **Razorpay + Stripe** for payments.

> Built following the [Small Town Coder — Zomato Clone Tutorial](https://www.youtube.com/watch?v=79F36yYEDyo) with a polished landing page and production-style patterns.

---

## ✨ Features

### 👤 Customer
- Google OAuth sign-in
- Browse nearby restaurants (geospatial queries)
- Search, cart, saved addresses
- Checkout with **Razorpay** (INR) or **Stripe** (global)
- **Live order tracking** on Leaflet map
- Real-time status updates via WebSocket

### 🏪 Restaurant (Seller)
- Restaurant & menu CRUD with **Cloudinary** images
- Open / close toggle
- Live incoming orders with **sound notification**
- Order status workflow (placed → preparing → ready)

### 🛵 Delivery Rider
- Profile registration with document upload
- Online / offline availability toggle
- GPS location updates
- Accept nearby orders (500m radius matching)
- Map navigation & delivery status updates

### 🛡️ Admin
- View pending restaurants & riders
- One-click verification (`isVerified`)

### 🌐 Landing Page
- Premium marketing site at `/`
- Animated hero, iPhone mockup, category carousel
- Features, how-it-works, reviews, FAQ
- App experience at `/explore` after login

---

## 🛠 Tech Stack

### Frontend (`frontend/` — Port **5173**)

| Technology | Purpose |
|------------|---------|
| **React 19** + **TypeScript** | UI & type safety |
| **Vite 7** | Dev server & bundler |
| **Tailwind CSS 4** | Styling |
| **React Router 7** | SPA routing & protected routes |
| **Axios** | REST API calls |
| **Socket.IO Client** | Real-time events |
| **Leaflet + React-Leaflet** | Maps & live tracking |
| **@react-oauth/google** | Google login |
| **@stripe/stripe-js** | Stripe checkout |
| **react-hot-toast** | Notifications |

### Backend Microservices (`services/`)

| Technology | Purpose |
|------------|---------|
| **Node.js** + **Express 5** | HTTP APIs |
| **TypeScript** | Type-safe services |
| **Mongoose 9** | MongoDB ODM |
| **jsonwebtoken** | JWT auth (15-day expiry) |
| **googleapis** | Google OAuth token exchange |
| **amqplib** | RabbitMQ messaging |
| **socket.io** | WebSocket server |
| **Cloudinary** | Image CDN |
| **Razorpay + Stripe SDKs** | Payment processing |

### Infrastructure & External Services

| Service | Role |
|---------|------|
| **MongoDB Atlas** | Cloud database (`Zomato_Clone`) |
| **CloudAMQP** | Managed RabbitMQ |
| **Google Cloud Console** | OAuth 2.0 credentials |
| **OpenStreetMap / Nominatim** | Map tiles & geocoding |
| **Vercel** (optional) | Frontend deployment |
| **Render** (optional) | Backend deployment |

---

## 🔌 Service Ports

Local development mein har service ka default port:

| Port | Service | Folder | Base URL | Main routes |
|------|---------|--------|----------|-------------|
| **5173** | **Frontend** (React + Vite) | `frontend/` | [http://localhost:5173](http://localhost:5173) | `/` landing · `/explore` app · `/login` |
| **5007** | **Auth** | `services/auth/` | `http://localhost:5007` | `/api/auth/*` — Google login, JWT, roles |
| **5001** | **Restaurant** | `services/restaurant/` | `http://localhost:5001` | `/api/restaurant` · `/api/cart` · `/api/order` · `/api/address` |
| **5002** | **Utils** | `services/utils/` | `http://localhost:5002` | `/api/upload` · `/api/payment` — Cloudinary, Razorpay, Stripe |
| **5004** | **Realtime** | `services/realtime/` | `http://localhost:5004` | WebSocket (Socket.IO) · `/api/v1/internal/emit` |
| **5005** | **Rider** | `services/rider/` | `http://localhost:5005` | `/api/rider/*` — profile, accept order, GPS |
| **5006** | **Admin** | `services/admin/` | `http://localhost:5006` | `/api/v1/*` — verify restaurants & riders |

**Infrastructure (not a Node service):**

| Port | Service | Notes |
|------|---------|-------|
| **5672** | **RabbitMQ** | Local: `amqp://admin:admin123@localhost:5672` — payment & order queues |
| — | **MongoDB Atlas** | Cloud — `MONGO_URI` in auth, restaurant, rider, admin `.env` |

> **Auth port 5007 (not 5000):** macOS **AirPlay Receiver** port 5000 block karta hai (403 Forbidden). Isliye Auth **5007** par chalta hai — `frontend/src/main.tsx` aur `services/auth/.env` dono mein yahi set hai.

**Frontend → backend mapping** (`frontend/src/main.tsx`):

```ts
authService       → http://localhost:5007
restaurantService → http://localhost:5001
utilsService      → http://localhost:5002
realtimeService   → http://localhost:5004
riderService      → http://localhost:5005
adminService      → http://localhost:5006
```

---

## 🏗 System Architecture

```mermaid
flowchart TB
    subgraph Client["🌐 Browser — React SPA :5173"]
        FE["Landing · Explore · Cart · Checkout · Tracking"]
    end

    subgraph Backend["⚙️ Node.js Microservices"]
        AUTH["Auth :5007<br/><code>/api/auth</code>"]
        REST["Restaurant :5001<br/><code>/api/restaurant · /cart · /order</code>"]
        UTILS["Utils :5002<br/><code>/api/upload · /api/payment</code>"]
        RT["Realtime :5004<br/>WebSocket + internal emit"]
        RIDER["Rider :5005<br/><code>/api/rider</code>"]
        ADMIN["Admin :5006<br/><code>/api/v1</code>"]
    end

    subgraph Data["💾 Data & Messaging"]
        MONGO[("MongoDB Atlas<br/>Zomato_Clone")]
        RMQ{{"RabbitMQ<br/>payment_event<br/>order_ready_queue"}}
    end

    subgraph External["☁️ Third-Party"]
        GOOGLE["Google OAuth"]
        CLOUD["Cloudinary"]
        STRIPE["Stripe"]
        RAZOR["Razorpay"]
    end

    FE -->|"HTTP + JWT"| AUTH & REST & UTILS & RIDER & ADMIN
    FE -->|"WebSocket"| RT

    AUTH --> MONGO
    REST --> MONGO
    RIDER --> MONGO
    ADMIN --> MONGO

    UTILS -->|"publish PAYMENT_SUCCESS"| RMQ
    REST -->|"consume / publish"| RMQ
    RIDER -->|"consume ORDER_READY"| RMQ

    AUTH --> GOOGLE
    UTILS --> CLOUD & STRIPE & RAZOR
    REST & RIDER -->|"internal HTTP"| RT
    REST & RIDER --> UTILS
```

### Service Responsibility Matrix

| Service | Port | Responsibility | Database | Queue |
|---------|------|----------------|----------|-------|
| **Auth** | 5007 | Google login, JWT, roles | `users` | — |
| **Restaurant** | 5001 | Restaurants, menu, cart, orders, addresses | 5 collections | consume + publish |
| **Utils** | 5002 | Image upload, Razorpay, Stripe | — | publish |
| **Realtime** | 5004 | Socket.IO rooms & event relay | — | — |
| **Rider** | 5005 | Rider profile, accept orders, GPS | `riders` | consume |
| **Admin** | 5006 | Verify restaurants & riders | direct MongoDB | — |
| **Frontend** | 5173 | React SPA | — | — |

### MongoDB Collections

| Collection | Owner Service | Description |
|------------|---------------|-------------|
| `users` | Auth | Google users + roles |
| `restaurants` | Restaurant, Admin | Seller restaurants + verification |
| `menuitems` | Restaurant | Food items |
| `carts` | Restaurant | Shopping carts |
| `addresses` | Restaurant | GeoJSON delivery addresses |
| `orders` | Restaurant, Rider | Full order lifecycle |
| `riders` | Rider, Admin | Delivery partner profiles |

---

## 🔄 Core Flows

### 1️⃣ Authentication & Role Selection

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant G as Google OAuth
    participant A as Auth :5007
    participant DB as MongoDB
    participant RT as Realtime :5004

    U->>FE: Continue with Google
    FE->>G: OAuth auth-code flow
    G-->>FE: Authorization code
    FE->>A: POST /api/auth/login { code }
    A->>G: Exchange code + fetch profile
    A->>DB: Find or create User
    A-->>FE: JWT (15d) + user JSON
    FE->>FE: Store token in localStorage

    U->>FE: Select role (customer / seller / rider)
    FE->>A: PUT /api/auth/add/role + JWT
    A->>DB: Update user.role
    A-->>FE: New JWT + user

    FE->>RT: Socket connect { auth: { token } }
    Note over RT: JWT verified with shared JWT_SEC
```

### 2️⃣ Customer Order + Payment

```mermaid
sequenceDiagram
    actor U as Customer
    participant FE as Frontend
    participant R as Restaurant :5001
    participant U2 as Utils :5002
    participant PG as Razorpay / Stripe
    participant Q as RabbitMQ
    participant RT as Realtime :5004

    U->>FE: Checkout
    FE->>R: POST /api/order/new (JWT)
    R-->>FE: orderId, amount

    FE->>U2: POST /api/payment/create
    U2->>PG: Create payment session
    U->>PG: Complete payment
    FE->>U2: POST /api/payment/verify
    U2->>Q: PAYMENT_SUCCESS event

    Q->>R: payment.consumer
    R->>R: paymentStatus = paid
    R->>RT: emit order:new → restaurant room
    RT-->>FE: Seller hears notification 🔔
```

### 3️⃣ Rider Dispatch & Live Tracking

```mermaid
sequenceDiagram
    participant Seller as Seller UI
    participant R as Restaurant :5001
    participant Q as RabbitMQ
    participant RID as Rider :5005
    participant RT as Realtime :5004
    participant Cust as Customer UI

    Seller->>R: PUT status → ready_for_rider
    R->>Q: ORDER_READY_FOR_RIDER
    Q->>RID: orderReady.consumer
    RID->>RID: Find riders within 500m
    RID->>RT: emit order:available → rider rooms

    Note over RID: Rider accepts order
    RID->>R: PUT assign rider (internal key)
    R->>RT: emit order:rider_assigned
    RT-->>Cust: Live map tracking updates
```

### Order Status State Machine

```mermaid
stateDiagram-v2
    [*] --> placed: Order created (payment pending)
    placed --> placed: Payment confirmed via RabbitMQ
    placed --> preparing: Seller accepts
    preparing --> ready_for_rider: Food ready
    ready_for_rider --> rider_assigned: Rider accepts
    rider_assigned --> picked_up: Rider picks up
    picked_up --> delivered: Delivered to customer
    delivered --> [*]
```

---

## 📡 Real-time Events (Socket.IO)

| Event | Triggered By | Target Room | UI Effect |
|-------|--------------|-------------|-----------|
| `order:new` | Restaurant (after payment) | `restaurant:{id}` | Seller order alert + sound |
| `order:update` | Restaurant / Rider | `user:{customerId}` | Customer status update |
| `order:rider_assigned` | Restaurant | customer + restaurant | Rider details shown |
| `order:available` | Rider service | `user:{riderId}` | New delivery request |
| `rider:location` | Rider GPS | order tracking | Map dot moves |

**Socket rooms on connect:**
- Every user → `user:{userId}`
- Sellers → `restaurant:{restaurantId}`

---

## 📬 RabbitMQ Queues

| Queue | Publisher | Consumer | Event Type |
|-------|-----------|----------|------------|
| `payment_event` | Utils (after payment verify) | Restaurant | `PAYMENT_SUCCESS` |
| `order_ready_queue` | Restaurant (food ready) | Rider | `ORDER_READY_FOR_RIDER` |
| `rider_queue` | — | — | Reserved (not used yet) |

> **Why RabbitMQ?** Payment verification and rider dispatch run **asynchronously** — the HTTP response is not blocked, and services stay decoupled.

---

## 📁 Project Structure

```
ByteBites/
├── README.md                    ← You are here
├── ARCHITECTURE.md              ← Detailed Mermaid diagrams
├── VIVA_DOCUMENTATION.md        ← Full viva / report guide (2000+ lines)
│
├── frontend/                    ← React + Vite + TypeScript (:5173)
│   ├── src/
│   │   ├── pages/               Landing, Explore, Cart, Checkout, Orders…
│   │   ├── components/          Navbar, carousels, iPhone mockup…
│   │   ├── context/             AppContext, SocketContext
│   │   ├── App.tsx              Role-based routing
│   │   └── main.tsx             Service URLs
│   └── package.json
│
└── services/
    ├── auth/          :5007     Google OAuth, JWT, roles
    ├── restaurant/    :5001     Core business logic + RabbitMQ
    ├── utils/         :5002     Cloudinary + Razorpay + Stripe
    ├── realtime/      :5004     Socket.IO server
    ├── rider/         :5005     Delivery partner APIs
    └── admin/         :5006     Platform moderation
```

### Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing (marketing) | Public |
| `/login` | Google sign-in | Public |
| `/explore` | Restaurant discovery | Customer |
| `/restaurant/:id` | Menu & add to cart | Customer |
| `/cart` | Shopping cart | Customer |
| `/checkout` | Payment | Customer |
| `/orders` | Order history | Customer |
| `/order/:id` | Live tracking map | Customer |
| `/select-role` | Role picker | New users |
| Seller UI | `Restaurant.tsx` | Seller role |
| Rider UI | `RiderDashboard.tsx` | Rider role |
| Admin UI | `Admin.tsx` | Admin role |

---

## 🚀 Getting Started — Complete Setup Guide

> **📄 Video/PDF companion:** Step-by-step RabbitMQ + AWS setup ke liye tutorial guide dekho:  
> [**RabbitMQ & AWS Setup Guide (PDF)**](https://drive.google.com/file/d/1zCPzq7nQPKkq2m4vseQg7CoRVw19m1Cx/view)  
> Neeche wala guide is project ke hisaab se likha hai — PDF ke saath follow karo for visual walkthrough.

---

### Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **Node.js** | 20+ | 22+ |
| **npm** | 9+ | Latest |
| **RAM** | 8 GB | 16 GB |
| **OS** | Windows 10 / macOS / Linux | macOS or Ubuntu |
| **Browser** | Chrome (latest) | Chrome + location permission enabled |
| **Internet** | Required | Required (cloud DB, OAuth, payments) |
| **Docker** (optional) | — | For local RabbitMQ |

**Accounts to create (all have free tiers):**

| Service | Purpose | Sign up |
|---------|---------|---------|
| MongoDB Atlas | Cloud database | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| CloudAMQP **or** Docker | RabbitMQ message broker | [cloudamqp.com](https://www.cloudamqp.com/) |
| Google Cloud Console | OAuth login | [console.cloud.google.com](https://console.cloud.google.com/) |
| Cloudinary | Restaurant/rider image CDN | [cloudinary.com](https://cloudinary.com/) |
| Razorpay | INR payments (test mode) | [razorpay.com](https://razorpay.com/) |
| Stripe | Global payments (test mode) | [stripe.com](https://stripe.com/) |

---

### Step 1 — Clone & install dependencies

```bash
git clone <your-repo-url>
cd ByteBites

# Frontend
cd frontend && npm install && cd ..

# All microservices (run from ByteBites root)
for dir in auth restaurant utils realtime rider admin; do
  (cd services/$dir && npm install)
done
```

---

### Step 2 — MongoDB Atlas setup

1. [MongoDB Atlas](https://www.mongodb.com/atlas) par account banao.
2. **Create cluster** → Free **M0** tier choose karo.
3. **Database Access** → user create karo (username + password note karo).
4. **Network Access** → **Add IP Address** → `0.0.0.0/0` (development ke liye; production mein restrict karo).
5. **Connect** → **Drivers** → connection string copy karo:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

6. Password mein special characters (`@`, `#`, `%`) ho to URL-encode karo.

**Ye `.env` files mein `MONGO_URI` daalo:**

| File | Variable |
|------|----------|
| `services/auth/.env` | `MONGO_URI` |
| `services/restaurant/.env` | `MONGO_URI` |
| `services/rider/.env` | `MONGO_URI` |
| `services/admin/.env` | `MONGO_URI` + `DB_NAME=Zomato_Clone` |

> Admin service native MongoDB driver use karta hai — `DB_NAME` wahi database name hai jahan collections banti hain.

---

### Step 3 — RabbitMQ setup

ByteBites **3 queues** use karta hai:

| Queue name | Env variable | Publisher | Consumer | Purpose |
|------------|--------------|-----------|----------|---------|
| `payment_event` | `PAYMENT_QUEUE` | Utils | Restaurant | Payment success → order confirm |
| `order_ready_queue` | `ORDER_READY_QUEUE` | Restaurant | Rider | Order ready → notify nearby riders |
| `rider_queue` | `RIDER_QUEUE` | — | — | Reserved (future use) |

**Option A — Local Docker (recommended for dev)**

Docker install karo, phir:

```bash
docker run -d --name bytebites-rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  rabbitmq:3-management
```

- **AMQP URL:** `amqp://admin:admin123@localhost:5672`
- **Management UI:** [http://localhost:15672](http://localhost:15672) (login: `admin` / `admin123`)

**Option B — CloudAMQP (cloud, no Docker)**

1. [cloudamqp.com](https://www.cloudamqp.com/) → free **Little Lemur** plan.
2. Instance create karo → **AMQP URL** copy karo (usually `amqps://...`).
3. Ye URL teen services mein same daalo: `restaurant`, `utils`, `rider`.

**Option C — AWS EC2 + Docker (production-style)**

Tutorial PDF mein detail hai: [RabbitMQ & AWS Setup Guide](https://drive.google.com/file/d/1zCPzq7nQPKkq2m4vseQg7CoRVw19m1Cx/view)

Short steps:
1. AWS EC2 instance launch karo (Ubuntu, t2.micro free tier).
2. Security group mein port **5672** (AMQP) aur **15672** (management, optional) open karo.
3. EC2 par Docker install karke same `docker run` command chalao.
4. `RABBITMQ_URL=amqp://admin:admin123@<EC2_PUBLIC_IP>:5672`

**RabbitMQ env — ye 3 files mein same URL hona chahiye:**

```env
RABBITMQ_URL=amqp://admin:admin123@localhost:5672   # local Docker
# RABBITMQ_URL=amqps://user:pass@xxx.rmq.cloudamqp.com/user   # CloudAMQP
PAYMENT_QUEUE=payment_event
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

| Service | Needs RabbitMQ? |
|---------|-----------------|
| `services/utils/.env` | ✅ publish payment events |
| `services/restaurant/.env` | ✅ consume payment + publish order ready |
| `services/rider/.env` | ✅ consume order ready |

> **Important:** Restaurant service startup par RabbitMQ connect karta hai — RabbitMQ pehle chalna chahiye, warna restaurant crash ho sakta hai.

---

### Step 4 — Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/) → **New Project** (e.g. `tomato-webapp`).
2. **APIs & Services → OAuth consent screen** → External → app name set karo.
3. **Credentials → Create Credentials → OAuth client ID** → **Web application**.
4. **Authorized JavaScript origins** mein add karo:
   - `http://localhost:5173`
   - (production: `https://your-domain.vercel.app`)
5. Client ID aur Client Secret copy karo.

**Backend** — `services/auth/.env`:

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

**Frontend** — `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com   # same Client ID as auth
```

> Dono jagah **same** `GOOGLE_CLIENT_ID` hona chahiye. Mismatch par login fail hoga.

---

### Step 5 — Cloudinary setup (image uploads)

1. [cloudinary.com](https://cloudinary.com/) → free account.
2. Dashboard se **Cloud name**, **API Key**, **API Secret** copy karo.

**`services/utils/.env` only:**

```env
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_SECRET_KEY=your_api_secret
```

> Utils service start hote hi ye 3 vars check karta hai — missing hone par crash.

---

### Step 6 — Payment gateways (test mode)

#### Razorpay (INR)

1. [dashboard.razorpay.com](https://dashboard.razorpay.com/) → **Test Mode** ON.
2. **Settings → API Keys** → Key ID + Key Secret.

**`services/utils/.env`:**

```env
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
```

#### Stripe (international)

1. [dashboard.stripe.com](https://dashboard.stripe.com/) → **Test mode**.
2. **Developers → API keys** → Publishable + Secret key.

**Backend** — `services/utils/.env`:

```env
STRIPE_SECRET_KEY=sk_test_xxxx
```

**Frontend** — `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

---

### Step 7 — Shared secrets (must match everywhere)

Ye values **sab services mein identical** honi chahiye — warna JWT verify fail ya internal API 403 aayega.

| Secret | Used in | Rule |
|--------|---------|------|
| `JWT_SEC` | auth, restaurant, rider, realtime, admin | **Same string** — 64+ char random |
| `INTERNAL_SERVICE_KEY` | restaurant, utils, realtime, rider + frontend | **Same string** — service-to-service auth |

Generate example (terminal):

```bash
# JWT secret (64 chars)
openssl rand -base64 48

# Internal key (custom strong string)
openssl rand -base64 32
```

**Frontend internal key** (same value as backend):

```env
# frontend/.env
VITE_INTERNAL_SERVICE_KEY=your-internal-service-key
```

| Service file | `JWT_SEC` | `INTERNAL_SERVICE_KEY` |
|--------------|-----------|------------------------|
| `services/auth/.env` | ✅ | — |
| `services/restaurant/.env` | ✅ | ✅ |
| `services/utils/.env` | — | ✅ |
| `services/realtime/.env` | ✅ | ✅ |
| `services/rider/.env` | ✅ | ✅ |
| `services/admin/.env` | ✅ | — |
| `frontend/.env` | — | ✅ (`VITE_` prefix) |

---

### Step 8 — Complete `.env` templates

Har service ke liye `services/<name>/.env` file banao (gitignored — kabhi commit mat karo).

<details>
<summary><b>Auth</b> — <code>services/auth/.env</code></summary>

```env
PORT=5007
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

</details>

<details>
<summary><b>Restaurant</b> — <code>services/restaurant/.env</code></summary>

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
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
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=your-internal-service-key
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
ORDER_READY_QUEUE=order_ready_queue
RIDER_QUEUE=rider_queue
```

</details>

<details>
<summary><b>Admin</b> — <code>services/admin/.env</code></summary>

```env
PORT=5006
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SEC=your-64-char-jwt-secret-same-in-all-services
DB_NAME=Zomato_Clone
```

</details>

<details>
<summary><b>Frontend</b> — <code>frontend/.env</code></summary>

```env
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
VITE_INTERNAL_SERVICE_KEY=your-internal-service-key
```

> Service URLs hardcoded hain `frontend/src/main.tsx` mein — production deploy par wahan update karo.

</details>

---

### Step 9 — Start services (order matters)

**Pehle infrastructure**, phir backends, last mein frontend:

```bash
# 0. RabbitMQ (agar local Docker use kar rahe ho)
docker start bytebites-rabbitmq   # pehli baar: docker run command from Step 3

# 1. Auth (:5007)
cd services/auth && npm run dev

# 2. Utils (:5002) — Cloudinary + payments
cd services/utils && npm run dev

# 3. Realtime (:5004) — Socket.IO
cd services/realtime && npm run dev

# 4. Restaurant (:5001) — RabbitMQ consumer; isse pehle RabbitMQ chalna chahiye
cd services/restaurant && npm run dev

# 5. Rider (:5005)
cd services/rider && npm run dev

# 6. Admin (:5006)
cd services/admin && npm run dev

# 7. Frontend (:5173)
cd frontend && npm run dev
```

**7 terminals** chahiye (RabbitMQ Docker alag se background mein).

---

### Step 10 — Verify setup

| Check | How | Expected |
|-------|-----|----------|
| Auth | Terminal log | `Server running on port 5007` |
| MongoDB | Auth/Restaurant startup | `connected to mongodb` |
| RabbitMQ | Restaurant startup | No connection error |
| Utils | Terminal | `Server running on port 5002` |
| Google login | [localhost:5173/login](http://localhost:5173/login) | Google popup → redirect to app |
| Images | Seller → add restaurant | Image upload works (Cloudinary) |
| Payment | Checkout → Razorpay test | Test card: `4111 1111 1111 1111` |
| Socket | Order page open | Real-time status updates |

---

### Step 11 — Open the app

| URL | Description |
|-----|-------------|
| [http://localhost:5173](http://localhost:5173) | Landing page |
| [http://localhost:5173/login](http://localhost:5173/login) | Sign in |
| [http://localhost:5173/explore](http://localhost:5173/explore) | App (after login) |
| [http://localhost:15672](http://localhost:15672) | RabbitMQ management UI (local Docker) |

---

### Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Google login 403 / `invalid_client` | Client ID mismatch | `frontend/.env` aur `auth/.env` mein same `GOOGLE_CLIENT_ID` |
| Auth 403 on port 5000 | macOS AirPlay blocks 5000 | Auth **5007** use karo (already configured) |
| `Unauthorized` on internal API | `INTERNAL_SERVICE_KEY` mismatch | Sab services + `frontend/.env` mein same key |
| JWT invalid / 401 everywhere | `JWT_SEC` mismatch | auth, restaurant, rider, realtime, admin — sab same |
| Restaurant won't start | RabbitMQ not running | Docker start karo ya CloudAMQP URL check karo |
| Image upload fails | Cloudinary vars missing | `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_SECRET_KEY` in utils |
| Payment stuck | Utils/Restaurant down | Dono services running + same `INTERNAL_SERVICE_KEY` |
| `.env` changes not applied | Hot reload doesn't reload env | Service restart karo |
| MongoDB connection error | IP not whitelisted | Atlas → Network Access → `0.0.0.0/0` add karo |

---

## 🔐 Security Model

| Layer | Mechanism |
|-------|-----------|
| **User auth** | Google OAuth 2.0 → JWT (Bearer token) |
| **Service-to-service** | `x-internal-key` header (`INTERNAL_SERVICE_KEY`) |
| **Socket auth** | JWT in `handshake.auth.token` |
| **Payments** | Razorpay / Stripe signature verification |
| **Role access** | JWT payload `role` + frontend route guards |

---

## 🌍 Deployment (Optional)

| Component | Suggested Platform |
|-----------|-------------------|
| Frontend | **Vercel** (`frontend/vercel.json`) |
| Microservices | **Render** / Railway (one service per instance) |
| Database | **MongoDB Atlas** |
| Message broker | **CloudAMQP** or **AWS EC2 + Docker** |
| Images | **Cloudinary** |

**Production checklist:**
- Replace all `http://localhost:xxxx` URLs in every `.env` with deployed service URLs
- Update `frontend/src/main.tsx` service URLs (or move to env vars)
- Google OAuth → add production domain to **Authorized JavaScript origins**
- MongoDB Atlas → IP whitelist ya `0.0.0.0/0`
- Razorpay/Stripe → **live keys** (not test) for real payments
- `JWT_SEC` + `INTERNAL_SERVICE_KEY` → strong production values, same across services

See also: [RabbitMQ & AWS Setup Guide (PDF)](https://drive.google.com/file/d/1zCPzq7nQPKkq2m4vseQg7CoRVw19m1Cx/view)

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [**RabbitMQ & AWS Setup (PDF)**](https://drive.google.com/file/d/1zCPzq7nQPKkq2m4vseQg7CoRVw19m1Cx/view) | Tutorial guide — RabbitMQ local/cloud/AWS setup |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Mermaid diagrams — auth, payment, order, socket flows |
| [**VIVA_DOCUMENTATION.md**](./VIVA_DOCUMENTATION.md) | Complete viva guide — APIs, Q&A, demo script, schemas |

---

## 🎯 Viva Demo Checklist (10 min)

1. **Landing page** — show marketing UI at `/`
2. **Google login** → role selection
3. **Customer** — browse restaurant → add to cart → checkout → pay (test mode)
4. **Seller** — show live order notification + status update
5. **Rider** — accept order → update delivery status
6. **Customer** — live map tracking on order page
7. **Admin** — verify a pending restaurant/rider
8. **Architecture** — explain 6 services + RabbitMQ + Socket.IO

---

## 🚧 Limitations & Future Work

**Current limitations:**
- No native mobile app
- No SMS / push notifications
- No ratings & reviews in app
- Single-restaurant cart only
- `rider_queue` declared but unused

**Future enhancements:**
- Coupon / discount engine
- Cash on delivery
- Automated CI/CD
- Docker Compose for local dev
- Rating system & order history analytics

---

## 🙏 Acknowledgements

- Tutorial: [Small Town Coder — Zomato Clone (25+ hrs)](https://www.youtube.com/watch?v=79F36yYEDyo)
- Maps: [OpenStreetMap](https://www.openstreetmap.org/) · [Leaflet](https://leafletjs.com/)
- Icons: [React Icons](https://react-icons.github.io/react-icons/)

---

<div align="center">

**Built with ❤️ for Final Year Project / Viva**

🍔 **ByteBites** — *Crave it. Order it. Love it.*

</div>
