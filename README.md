# Angular 21 Auth Boilerplate

This project is an Angular 21 boilerplate that demonstrates a complete authentication flow connected to a real API:

- Email sign up + email verification (via Resend.com)
- Login + logout
- JWT auth header for API requests
- Refresh tokens (cookie-based) + auto-refresh before access token expiry
- Forgot password + reset password
- Role-based authorization (User & Admin)
- Admin area for account management
- Profile area for viewing/updating your own account

## Table of contents

- [1) Prerequisites](#1-prerequisites)
- [2) Run the app](#2-run-the-app)
- [3) Using the app (what to click)](#3-using-the-app-what-to-click)
- [4) How authentication works](#4-how-authentication-works)
- [5) Authorization (roles + route guards)](#5-authorization-roles--route-guards)
- [6) Project structure (quick tour)](#6-project-structure-quick-tour)
- [7) Troubleshooting](#7-troubleshooting)

## 1) Prerequisites

- Node.js (LTS recommended)
- npm (comes with Node.js)
- A running backend API (e.g. Express, .NET Core, etc.)
- A Resend.com account for sending emails

## 2) Run the app

### Step 1: install packages

From the project root (where `package.json` is):

```bash
npm install
```

### Step 2: start your backend API

Start an API that implements the `/accounts/*` endpoints. The frontend expects the API to be available at `http://localhost:4000` by default in development.

### Step 3: start Angular

```bash
npm start
```

This runs `ng serve --open` and should open the app in your browser.

### Step 4: update API URL (if your API runs elsewhere)

Edit the environment file:

* `src/environments/environment.ts` (development)
* `src/environments/environment.prod.ts` (production build)

Update:

```ts
apiUrl: 'http://localhost:4000'
```

## 3) Using the app (what to click)

### A) Create an account

1. Go to Register
2. Fill in your details and submit
3. Check your email (Resend.com will send the verification link)
4. Click the verification link to verify your account

### B) Login

1. Go to Login
2. Enter your email + password

### C) Forgot password + reset password

1. Go to Forgot Password
2. Enter your email and submit
3. Check your email for the reset link
4. Click the reset link and set a new password

## 4) How authentication works

This boilerplate uses two tokens:

* Access token (JWT): short-lived token used in the `Authorization: Bearer <token>` header
* Refresh token: long-lived token stored in a cookie and sent with `withCredentials: true`

### The important pieces

* API base URL: `src/environments/environment.ts`
* Account service: `src/app/_services/account.service.ts`
* App initializer: `src/app/_helpers/app.initializer.ts`
* JWT interceptor: `src/app/_helpers/jwt.interceptor.ts`
* Error interceptor: `src/app/_helpers/error.interceptor.ts`

## 5) Authorization (roles + route guards)

Routes are protected with `AuthGuard`:

* If you are not logged in, you are redirected to `/account/login`
* If you are logged in but don't have the required role, you are redirected to `/`

Role restrictions are applied using route data, for example:

* `/admin` requires `Role.Admin`

Key files:

* `src/app/_helpers/auth.guard.ts`
* `src/app/_models/role.ts`
* `src/app/app-routing.module.ts`

## 6) Project structure (quick tour)

Most code lives under `src/app`:

* `_services/` shared services (e.g. `AccountService`, `AlertService`)
* `_helpers/` cross-cutting helpers (guards, interceptors, app initializer)
* `_models/` shared types and enums (Account, Role, Alert)
* `account/` auth screens (Login/register/verify/forgot/reset)
* `profile/` user profile screens
* `admin/` admin-only screens for account management

The UI is styled with Bootstrap 5 via a CDN link in `src/index.html`.

## 7) Troubleshooting

### The app redirects me back to login after refresh

* Make sure your API sets a refresh token cookie and supports `POST /accounts/refresh-token`.
* If your API runs on a different origin, you must configure CORS to allow credentials and set the correct origin.

### Run unit tests

```bash
npm test
```

