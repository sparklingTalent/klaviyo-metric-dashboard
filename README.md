# Klaviyo Dashboard

Multi-client Klaviyo metrics dashboard with separate frontend and backend deployments.

## Project Structure

```
.
├── backend/          # Backend API (Node.js/Express)
│   ├── server.js
│   ├── klaviyoService.js
│   ├── auth.js
│   ├── database.js
│   └── package.json
├── frontend/         # Frontend React App
│   ├── src/
│   ├── public/
│   └── package.json
└── vercel.json       # Vercel deployment config (frontend)
```

## Features

- Multi-client authentication system
- Klaviyo API v3 integration
- Real-time metrics dashboard
- Campaign, Flow, and Event metrics
- Revenue tracking

## Deployment

### Frontend (Vercel)

1. Navigate to the `frontend/` directory
2. Deploy to Vercel:
   ```bash
   cd frontend
   vercel deploy
   ```
   Or connect your GitHub repo to Vercel and set the root directory to `frontend/`

### Backend (Railway)

1. Navigate to the `backend/` directory
2. Deploy to Railway:
   - Connect your GitHub repo
   - Set the root directory to `backend/`
   - Railway will automatically detect the `package.json` and deploy

## Environment Variables

### Backend (.env in backend/)

```
PORT=3001
JWT_SECRET=your-secret-key
```

### Frontend

Update `frontend/src/config.js` with your backend API URL:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/login` - Client login
- `GET /api/admin/clients` - List all clients (admin)
- `POST /api/admin/clients` - Add new client (admin)
- `GET /api/dashboard/metrics` - Get dashboard metrics (authenticated)

## License

ISC
