# Klaviyo Dashboard

A multi-client dashboard application for viewing Klaviyo metrics. Each client has their own login credentials and can view their Klaviyo metrics in a personalized dashboard.

## Features

- **Admin Panel**: Add clients manually with their name, email, password, and Klaviyo private key
- **Client Authentication**: Secure login system for each client
- **Klaviyo Metrics Dashboard**: View account information, profiles, campaigns, lists, and metrics
- **Modern UI**: Beautiful, responsive interface built with React

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Klaviyo account with API private key

## Installation

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   JWT_SECRET=your-secret-key-change-this-in-production
   PORT=3001
   ```

## Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3001`

2. **Start the frontend (in a new terminal):**
   ```bash
   cd client
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   The application will be available on `http://localhost:3001`

## Usage

### Adding Clients (Admin)

1. Navigate to `http://localhost:3000/admin` (or `http://localhost:3001/admin` in production)
2. Fill in the form with:
   - **Client Name**: The name of the client
   - **Email**: Client's email (used for login)
   - **Password**: Client's password (used for login)
   - **Klaviyo Private Key**: The client's Klaviyo API private key
3. Click "Add Client"
4. The client will appear in the "Existing Clients" list below

### Client Login

1. Navigate to `http://localhost:3000/login` (or `http://localhost:3001/login` in production)
2. Enter the email and password you set for the client
3. Click "Sign In"
4. You'll be redirected to the dashboard showing Klaviyo metrics

### Dashboard Features

The dashboard displays:
- **Account Information**: Account name and contact email
- **Total Profiles**: Number of profiles/subscribers
- **Metrics**: Count of available metrics
- **Campaigns**: Total number of campaigns
- **Lists**: Number of email lists
- **Last Updated**: Timestamp of the last data refresh

Metrics automatically refresh every 5 minutes.

## Project Structure

```
.
├── server.js              # Express server and API routes
├── database.js            # SQLite database setup and operations
├── klaviyoService.js      # Klaviyo API integration service
├── auth.js                # Authentication utilities (JWT, bcrypt)
├── package.json           # Backend dependencies
├── client/                # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   └── AdminPanel.js
│   │   ├── context/       # React context (Auth)
│   │   └── App.js         # Main app component
│   └── package.json       # Frontend dependencies
└── README.md
```

## API Endpoints

### Admin Endpoints
- `POST /api/admin/clients` - Add a new client
- `GET /api/admin/clients` - Get all clients

### Authentication
- `POST /api/auth/login` - Client login

### Dashboard
- `GET /api/dashboard/metrics` - Get Klaviyo metrics (requires authentication)
- `GET /api/dashboard/profile` - Get client profile (requires authentication)

## Database

The application uses SQLite for data storage. The database file (`klaviyo_dashboard.db`) will be created automatically on first run.

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for authentication
- Change the `JWT_SECRET` in production
- Consider adding admin authentication for the admin panel in production
- Klaviyo private keys are stored in the database (consider encryption for production)

## Troubleshooting

### Klaviyo API Errors
- Verify that the Klaviyo private key is correct
- Check that the API key has the necessary permissions
- Ensure your Klaviyo account is active

### Database Issues
- Delete `klaviyo_dashboard.db` to reset the database
- Ensure write permissions in the project directory

### Port Conflicts
- Change the `PORT` in `.env` if port 3001 is in use
- Update the proxy in `client/package.json` if needed

## License

ISC

