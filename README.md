# Odoo Integration Demo

Small full-stack integration project for learning and demonstrating the Odoo 19 JSON-2 API. Odoo remains the system of record; the app provides a Node/Express integration API and a compact React frontend for contact workflows.

## Architecture

```text
React / TypeScript
        |
        v
Node / Express integration API
        |
        v
Odoo 19 JSON-2 API
        |
        v
Odoo / PostgreSQL
```

The frontend never receives the Odoo API key or database credentials. Browser requests go to the Node API, and the Node API talks to Odoo.

## Local Setup

1. Start Odoo and PostgreSQL from the repository root:

```sh
docker compose up -d
```

2. Create `server/.env` from the example in [server/README.md](server/README.md), then start the backend:

```sh
cd server
npm install
npm run dev
```

The backend defaults to `http://localhost:3001`.

3. Create `client/.env` from `client/.env.example` if you need to override the API base URL, then start the frontend:

```sh
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` and `/health` to the backend during local development.

## Current Features

- List Odoo contacts.
- Create Odoo contacts.
- Edit Odoo contacts.
- Show loading, empty, success, and error states.
- Display Odoo record ids and synced status.

## Non-Goals

This is intentionally a small integration demonstration, not a replacement CRM or ERP. It does not include authentication, deletion, products, invoices, analytics, background jobs, or a separate local database.
