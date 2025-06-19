const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all maps
router.get('/', async (req, res) => {
  const result = await db.query('SELECT id, name, width, height FROM maps');
  res.json(result.rows);
});

// Get single map by ID
router.get('/:id', async (req, res) => {
  const result = await db.query('SELECT * FROM maps WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Map not found' });
  res.json(result.rows[0]);
});

// Create new map
router.post('/', async (req, res) => {
  const { name, width, height, data, start_x, start_y, start_dir } = req.body;
const result = await db.query(
  'INSERT INTO maps (name, width, height, data, start_x, start_y, start_dir) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
  [name, width, height, data, start_x, start_y, start_dir]
);
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, width, height, data, start_x, start_y, start_dir } = req.body;

  const result = await db.query(
  'UPDATE maps SET name = $1, width = $2, height = $3, data = $4, start_x = $5, start_y = $6, start_dir = $7 WHERE id = $8 RETURNING *',
  [name, width, height, data, start_x, start_y, start_dir, req.params.id]
);

  if (result.rows.length === 0) return res.status(404).json({ error: 'Map not found' });
  res.json(result.rows[0]);
});

// Delete map
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM maps WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;