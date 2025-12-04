#!/bin/bash

echo "Setting up Klaviyo Dashboard..."

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
PORT=3001
EOF
    echo ".env file created with a random JWT_SECRET"
else
    echo ".env file already exists, skipping..."
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend: npm run dev (or npm start for production)"
echo "  2. Frontend: cd client && npm start (for development)"
echo "  3. Or build frontend: npm run build && npm start (for production)"
echo ""
echo "Access the admin panel at: http://localhost:3000/admin"
echo "Access the login page at: http://localhost:3000/login"

