import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Pool for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API: Get Leaderboard Data
  app.get('/api/leaderboard', async (req, res) => {
    const MOCK_DATA = [
      { suburb: 'KUWADZANA', total_hours: 142.5, avg_duration: 4.5 },
      { suburb: 'MABVUKU', total_hours: 110.2, avg_duration: 5.1 },
      { suburb: 'BORROWDALE', total_hours: 98.4, avg_duration: 3.8 },
      { suburb: 'AVONDALE', total_hours: 72.1, avg_duration: 3.2 },
      { suburb: 'MBARE', total_hours: 68.8, avg_duration: 4.1 },
      { suburb: 'HATFIELD', total_hours: 45.3, avg_duration: 3.2 },
    ];

    if (!process.env.DATABASE_URL) {
      return res.json(MOCK_DATA);
    }

    try {
      const query = `
        SELECT 
          s.name as suburb, 
          COALESCE(SUM(EXTRACT(EPOCH FROM (o.end_time - o.start_time))/3600), 0)::float as total_hours,
          COALESCE(AVG(EXTRACT(EPOCH FROM (o.end_time - o.start_time))/3600), 0)::float as avg_duration
        FROM Power_Outages o
        JOIN Suburbs s ON o.suburb_id = s.suburb_id
        GROUP BY s.name
        ORDER BY total_hours DESC
        LIMIT 10;
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.warn('Leaderboard Fetch Live Data Failed:', err instanceof Error ? err.message : 'Unknown');
      res.json(MOCK_DATA);
    }
  });

  // API: Predict Outage (The Oracle)
  app.post('/api/predict', async (req, res) => {
    const { suburb_id, outage_hour } = req.body;
    
    try {
      const hour = parseInt(outage_hour);
      let prediction = 'Low Risk';
      let type = 'Grid Stable';
      let confidence = 0.85;

      if (hour >= 17 && hour <= 21) {
        prediction = 'High Risk';
        type = 'Load Shedding';
        confidence = 0.92;
      } else if (hour >= 5 && hour <= 9) {
        prediction = 'Medium Risk';
        type = 'Load Shedding';
        confidence = 0.78;
      } else if (Math.random() > 0.85) {
        prediction = 'Moderate Risk';
        type = 'Local Fault';
        confidence = 0.65;
      }

      res.json({
        suburb_id,
        outage_hour,
        prediction,
        type,
        confidence,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: 'Prediction failed' });
    }
  });

  // API: List Suburbs
  app.get('/api/suburbs', async (req, res) => {
    const MOCK_SUBURBS = [
      { id: 1, name: 'AVONDALE' },
      { id: 2, name: 'BORROWDALE' },
      { id: 3, name: 'KUWADZANA' },
      { id: 4, name: 'MABVUKU' },
      { id: 5, name: 'MBARE' },
    ];

    if (!process.env.DATABASE_URL) {
      return res.json(MOCK_SUBURBS);
    }

    try {
      const result = await pool.query('SELECT suburb_id as id, name FROM Suburbs ORDER BY name ASC');
      res.json(result.rows);
    } catch (err) {
      res.json(MOCK_SUBURBS);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZesaGrid Server running on http://localhost:${PORT}`);
  });
}

startServer();
