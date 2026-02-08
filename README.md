# Oryzem Frontend (React)

React + Vite project prepared for a Spring Boot backend and AWS Cognito authentication.

## Requirements

- Node.js 18+
- npm 9+

## Setup

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

## Build (production)

```bash
npm run build
```

## Lint and format

```bash
npm run lint
npm run lint:fix
npm run format
```

## Environment variables

Create a `.env` file in the project root (already scaffolded) with:

```
VITE_API_BASE_URL=http://localhost:8080
VITE_COGNITO_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_app_client_id
```

## Project structure

```
src/
  api/          axios instance + interceptors
  services/     API consumption functions
  auth/         Cognito config and helpers
  pages/        Route-level screens
  components/   Reusable UI pieces
  hooks/        Custom hooks
  contexts/     React contexts
  styles/       Global + app styles
  assets/       Static assets
```

## API example

- `src/api/axios.js` reads the backend base URL from `VITE_API_BASE_URL`
- `src/services/userService.js` shows a sample `GET /users`
- `src/pages/UsersPage.jsx` calls the service and renders results
