# 🎁 Gyftee

> **Swipe. Discover. Find the perfect gift.**

Gyftee is a personalized, social gift-discovery platform that combines a
swipe-based interface with machine-learning recommendations and social
features.

Instead of manually searching through a large gift catalog, users can
quickly swipe through gifts, build a preference profile through their
interactions, save liked gifts to a wishlist, follow other users, and
discover gift preferences through the social feed.

**Live Demo:** https://gyftee.vercel.app/\
**Repository:** https://github.com/Sal-1807/Gyftee

------------------------------------------------------------------------

## ✨ Features

### 🎴 Personalized Swipe Discovery

-   Swipe through gifts using an interactive card-based interface.
-   Like or dislike gifts to build a preference history.
-   Previously swiped gifts are excluded from future recommendations.
-   Refreshing the deck prioritizes new, unseen gifts rather than
    repeatedly showing the same cards.
-   User interests are used to improve cold-start discovery.

### 🤖 Hybrid ML Recommendations

Gyftee uses a hybrid recommendation engine combining:

-   **TF-IDF + cosine similarity** for content-based recommendations.
-   **SVD-based collaborative filtering** for learning patterns across
    users.
-   **Dynamic model weighting** based on the amount of user interaction
    data.
-   Cold-start handling for users without enough interaction history.

The recommendation strategy adapts as the user provides more feedback:

  User history           Content   Collaborative
  -------------------- --------- ---------------
  Fewer than 5 likes        100%              0%
  5--19 likes                60%             40%
  20+ likes                  40%             60%

The ML service trains from the PocketBase gift/swipe data and performs
real-time inference using the authenticated user's current swipe
history.

### ❤️ Wishlist

-   Liked gifts are automatically reflected in the user's wishlist.
-   Wishlist state is synchronized after follow/unfollow actions.
-   Users can remove gifts from their wishlist.

### 👥 Social Features

-   Follow and unfollow users.
-   View profiles and follower/following information.
-   See followed users' liked gifts.
-   Discover activity through the social feed.
-   Wishlist visibility is controlled by PocketBase authorization rules.

### 🔒 Security & Authorization

The production system includes several security controls:

-   Server-side authentication for recommendation requests.
-   The recommendation API derives user identity from the authenticated
    session instead of trusting a client-supplied `userId`.
-   Vercel → ML service communication uses an internal authentication
    token.
-   ML recommendation, retraining, and model-diagnostic endpoints are
    protected.
-   PocketBase swipe access is restricted to the user's own data or data
    belonging to users they follow.
-   Follower creation is restricted so a user can only create a follow
    relationship where they are the follower.
-   Secrets are stored in environment variables and deployment secret
    stores rather than committed to the repository.

------------------------------------------------------------------------

## 🧠 Recommendation Architecture

``` text
                    ┌─────────────────────┐
                    │   Gyftee Frontend   │
                    │ Next.js + React      │
                    └──────────┬──────────┘
                               │
                               │ Authenticated request
                               ▼
                    ┌─────────────────────┐
                    │ Next.js API Route   │
                    │ /api/recommendations│
                    └──────────┬──────────┘
                               │
                     X-Internal-Token
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI ML        │
                    │   Recommendation    │
                    │      Service        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ Content-Based   │        │ Collaborative   │
        │ TF-IDF          │        │ Filtering       │
        │ Cosine Similarity│       │ Truncated SVD   │
        └────────┬────────┘        └────────┬────────┘
                 └─────────────┬───────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Hybrid Ranking      │
                    │ Dynamic weighting   │
                    └──────────┬──────────┘
                               │
                               ▼
                    Recommended gift IDs
                               │
                               ▼
                    ┌─────────────────────┐
                    │ PocketBase Catalog  │
                    │ + User Swipe Data   │
                    └─────────────────────┘
```

### Content-Based Filtering

Gift metadata is converted into TF-IDF vectors using categories and
tags. A user's taste profile is constructed from liked gifts, with
disliked gifts providing a weaker negative signal. Candidate gifts are
then ranked using cosine similarity.

### Collaborative Filtering

User interactions are represented as a user-item matrix:

-   liked → `+1.0`
-   disliked → `-0.5`
-   unseen → `0`

Truncated SVD decomposes this matrix into latent user/gift
representations, allowing the system to identify patterns between users
with similar interaction behavior.

### Hybrid Ranking

The two recommendation signals are combined using a weighted score:

``` text
final_score =
    content_weight × content_score
  + collaborative_weight × collaborative_score
```

This allows Gyftee to start safely with content-based recommendations
and gradually incorporate collaborative signals as more interaction data
becomes available.

------------------------------------------------------------------------

## 🏗️ System Architecture

Gyftee is split into three main application layers:

### Frontend --- `gyftee/`

A Next.js application responsible for:

-   UI and navigation
-   authentication/session handling
-   swipe interaction
-   wishlist and profile views
-   social features
-   feed
-   recommendation API integration
-   client-side caching and state synchronization

### ML Service --- `ml-service/`

A FastAPI service responsible for:

-   training recommendation models
-   serving personalized recommendations
-   content-based filtering
-   collaborative filtering
-   model diagnostics
-   periodic model retraining

### PocketBase --- `pocketbase/`

The data layer providing:

-   user records
-   gift catalog
-   swipe history
-   follower relationships
-   authentication
-   API-level authorization rules

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   Next.js 15
-   React 19
-   TypeScript
-   Tailwind CSS v4
-   TanStack React Query
-   Framer Motion
-   Lucide React

### Backend / Data

-   PocketBase
-   REST APIs
-   PocketBase authentication and API rules

### Machine Learning

-   Python
-   FastAPI
-   scikit-learn
-   NumPy
-   pandas
-   TF-IDF
-   Cosine similarity
-   Truncated SVD

### Deployment

-   Vercel --- frontend / Next.js API
-   Fly.io --- ML service
-   PocketHost --- production PocketBase

------------------------------------------------------------------------

## 📁 Repository Structure

``` text
Gyftee/
├── gyftee/                  # Next.js frontend
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── package.json
│   └── ...
│
├── ml-service/              # FastAPI recommendation service
│   ├── main.py
│   ├── models.py
│   ├── recommendations.py
│   ├── content_based.py
│   ├── collaborative.py
│   ├── pocketbase_client.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── fly.toml
│
├── pocketbase/
│   ├── pb_migrations/
│   └── ...
│
├── .env.example
└── README.md
```

------------------------------------------------------------------------

## 🚀 Local Development

### Prerequisites

-   Node.js
-   npm
-   Python 3.12+
-   A local PocketBase instance

### 1. Clone the repository

``` bash
git clone https://github.com/Sal-1807/Gyftee.git
cd Gyftee
```

### 2. Configure environment variables

Use `.env.example` as the template.

For the Next.js application, create:

``` text
gyftee/.env.local
```

For the ML service, create:

``` text
ml-service/.env
```

Do **not** commit these files.

The main configuration includes:

``` text
NEXT_PUBLIC_POCKETBASE_URL=
ML_SERVICE_URL=
INTERNAL_API_TOKEN=
```

The ML service also requires its PocketBase connection and server-side
credentials.

The `INTERNAL_API_TOKEN` must be identical between the Next.js server
environment and ML service environment.

### 3. Start PocketBase

Run your local PocketBase instance on the configured local port, for
example:

``` bash
./pocketbase serve --http=0.0.0.0:8090
```

Then configure the required collections and migrations.

### 4. Start the ML service

``` bash
cd ml-service
python -m venv venv
```

Windows:

``` bash
venv\Scripts\activate
```

macOS/Linux:

``` bash
source venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Start FastAPI:

``` bash
uvicorn main:app --reload --port 8000
```

Health check:

``` text
http://localhost:8000/health
```

### 5. Start the frontend

Open another terminal:

``` bash
cd gyftee
npm install
npm run dev
```

Open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## 🔐 Environment & Secrets

Production secrets are intentionally not stored in Git.

Use:

-   local `.env` / `.env.local` files for development
-   Vercel environment variables for the Next.js deployment
-   Fly.io secrets for the ML service

The repository contains only placeholder values in `.env.example`.

Never commit:

``` text
.env
.env.local
```

or any production credentials/tokens.

------------------------------------------------------------------------

## 🔄 Recommendation Flow

A typical recommendation request follows this sequence:

1.  User opens or refreshes the swipe deck.
2.  The frontend sends a request to the Next.js recommendation route.
3.  The server validates the authenticated session.
4.  The server derives the user's identity from the session.
5.  The server calls the ML service using the internal authentication
    token.
6.  The ML service fetches the user's current swipe history.
7.  The hybrid recommender calculates candidate scores.
8.  Previously swiped gifts are excluded.
9.  The ML service returns ranked gift IDs.
10. The frontend resolves those IDs against the PocketBase catalog.
11. Preference-aware tiering and recently-shown exclusion are applied.
12. The resulting deck is displayed to the user.

------------------------------------------------------------------------

## 🧪 Testing & Verification

The project was tested across several layers:

### Recommendation system

-   ML service health
-   model training
-   personalized recommendation requests
-   cold-start behavior
-   recommendation IDs matching the gift catalog
-   no-repeat refresh behavior

### Security

-   unauthenticated ML endpoint rejection
-   internal token validation
-   authenticated recommendation flow
-   client-supplied `userId` rejection/ignoring
-   PocketBase swipe authorization
-   follower creation authorization

### Application behavior

-   swipe history
-   wishlist
-   follow/unfollow
-   profile privacy
-   social feed
-   recommendation refresh
-   client-side cache invalidation

------------------------------------------------------------------------

## 🔒 Production Security Model

The recommendation service is intentionally not exposed as a public
recommendation API.

``` text
Browser
   │
   │ authenticated session
   ▼
Vercel / Next.js
   │
   │ X-Internal-Token
   ▼
Fly.io ML Service
   │
   │ server-side PocketBase credentials
   ▼
PocketBase
```

The ML service exposes `/health` publicly for service health checks,
while recommendation, retraining, and model-diagnostic endpoints require
the internal token.

PocketBase API rules enforce the data boundary independently of the
frontend.

------------------------------------------------------------------------

## 🌐 Deployment

### Frontend

The Next.js application is deployed through Vercel.

Production:

https://gyftee.vercel.app/

### ML Service

The FastAPI service is containerized with Docker and deployed through
Fly.io.

### Database

PocketBase is hosted through PocketHost in production.

Environment-specific configuration is kept outside the repository.

------------------------------------------------------------------------

## 🎥 Demo

A project walkthrough / pitch video will be added here.

``` text
[5-minute pitch video]
```

------------------------------------------------------------------------

## 🗺️ Future Improvements

Potential future work includes:

-   richer recommendation explanations
-   more advanced implicit-feedback modeling
-   larger-scale collaborative filtering
-   recommendation evaluation metrics such as Precision@K and Recall@K
-   improved cold-start personalization
-   notification and activity improvements
-   automated ML model monitoring
-   stronger production observability

------------------------------------------------------------------------

## 👥 Project

**Gyftee** --- an intelligent social gift-discovery platform.

Built as a full-stack application combining:

**Next.js + PocketBase + FastAPI + Machine Learning**

------------------------------------------------------------------------

## 📄 License

Gyftee is currently under active development.

This repository is publicly available for project evaluation and
educational reference. Licensing and usage terms may be updated
as Gyftee evolves toward a public product.