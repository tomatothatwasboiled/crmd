const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./crisis_mind.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT,
  severity TEXT,
  description TEXT,
  protocol TEXT,
  lat REAL,
  lng REAL,
  status TEXT,
  timestamp TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  incident_id TEXT,
  name TEXT,
  type TEXT,
  FOREIGN KEY(incident_id) REFERENCES incidents(id)
)`);

app.post('/api/incidents', (req, res) => {
  const { id, title, severity, description, protocol, lat, lng, status, timestamp, units } = req.body;
  
  db.run(
    `INSERT INTO incidents (id, title, severity, description, protocol, lat, lng, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, severity, description, protocol, lat, lng, status, timestamp],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      if (units && units.length > 0) {
        const stmt = db.prepare(`INSERT INTO units (id, incident_id, name, type) VALUES (?, ?, ?, ?)`);
        units.forEach((u, idx) => {
          stmt.run(`${id}-u${idx}`, id, u.name, u.type);
        });
        stmt.finalize();
      }

      res.json({ success: true, message: 'Incident and dispatch units stored in SQL database.' });
    }
  );
});

app.get('/api/incidents', (req, res) => {
  db.all(`SELECT * FROM incidents`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(8000, () => {
  console.log('Backend SQL server running on http://localhost:8000');
});