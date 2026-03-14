# Ports and environment setup

Quick steps to avoid port conflicts and run both servers:

1. Backend

 - Copy `Backend/.env.example` to `Backend/.env` and set values (especially `MONGO_URI`).
 - Start backend with:

```powershell
cd "f:\Final year Project\my-app\Backend"
node index.js
```

or with nodemon (after confirming port free):

```powershell
npm run dev
```

2. Frontend (Create React App)

 - Copy `Frontend/.env.example` to `Frontend/.env` and change `PORT` if you need a different port (e.g., `3001`).
 - Start frontend with:

```powershell
cd "f:\Final year Project\my-app\Frontend"
npm start
```

Notes:

 - The backend reads `PORT` from `process.env.PORT` (falls back to `5000`).
 - The frontend dev server reads `PORT` from the `.env` file when using Create React App.
 - If you see `EADDRINUSE`, stop other node processes or change the PORT in the corresponding `.env` file.
