const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'klaviyo_dashboard.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // Clients table
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      klaviyo_private_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating clients table:', err.message);
      } else {
        console.log('Clients table ready');
      }
    });
  });
}

// Database operations
const dbOperations = {
  // Add a new client
  addClient: (name, email, password, klaviyoPrivateKey) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO clients (name, email, password, klaviyo_private_key) 
         VALUES (?, ?, ?, ?)`,
        [name, email, password, klaviyoPrivateKey],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, name, email });
          }
        }
      );
    });
  },

  // Get client by email
  getClientByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, name, email, password, klaviyo_private_key FROM clients WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  // Get client by ID
  getClientById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, name, email, klaviyo_private_key FROM clients WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  },

  // Get all clients (for admin)
  getAllClients: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, email, created_at FROM clients ORDER BY created_at DESC`,
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
};

module.exports = { db, dbOperations };

