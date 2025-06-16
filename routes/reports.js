const express = require('express');
const db = require('../db');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');

// GET /dev/reports
router.get('/', requireLogin, (req, res) => {
  db.query('SELECT * FROM reports ORDER BY submittedAt DESC', (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.json(result.rows);
  });
});

// POST /dev/reports
router.post('/', (req, res) => {
  const { name, email, title, description, severity } = req.body;
  const submittedAt = new Date().toISOString();
  const user_agent = req.get('User-Agent') || '';
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

  const query = `
    INSERT INTO reports (name, email, title, description, severity, submittedAt, user_agent, ip)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [name, email, title, description, severity, submittedAt, user_agent, ip];

  db.query(query, values, err => {
    if (err) {
    console.error('[REPORT INSERT ERROR]', err); // 🔍 Add this
    return res.status(500).send('Database error.');
  }
    res.json({ message: 'Report submitted successfully' });
  });
});

// PUT /dev/reports/:id
router.put('/:id', (req, res) => {
  const { name, email, title, description, severity } = req.body;
  const query = `
    UPDATE reports SET
      name = $1, email = $2, title = $3, description = $4, severity = $5
    WHERE id = $6
  `;
  const values = [name, email, title, description, severity, req.params.id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(result.rowCount ? 200 : 404);
  });
});

// DELETE /dev/reports/:id
router.delete('/:id', requireLogin, (req, res) => {
  db.query('DELETE FROM reports WHERE id = $1', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(result.rowCount ? 200 : 404);
  });
});

module.exports = router;