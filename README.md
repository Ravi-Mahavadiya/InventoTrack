# InventoTrack

A production-ready fullstack application created with `backendkit`.

## Project Structure
- `backend/` - Node.js + Express backend with MongoDB/PostgreSQL
- `frontend/` - Vite + React + Vanilla CSS frontend

## Getting Started

1. **Install dependencies for both projects:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` in `backend/` to `.env` and fill in your details:
     ```bash
     cp backend/.env.example backend/.env
     ```

3. **Database Setup (PostgreSQL only):**
   - Run the initialization script to create tables:
     ```bash
     npm run db:init --prefix backend
     ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   This will concurrently run:
   - Backend API: http://localhost:5000
   - React Frontend: http://localhost:5173
