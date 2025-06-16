// routes/monsters.js  //also, adding this comment here to test out the auto reset.
const express = require('express');
const multer = require('multer');
const path = require('path');
const Monster = require('../models/monsterModel');
const { requireLogin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/monsters/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// GET /monsters
router.get('/', requireLogin, async (req, res) => {
  try {
    const result = await Monster.getAllMonsters();
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /monsters/:id
router.get('/:id', requireLogin, async (req, res) => {
  try {
    const result = await Monster.getMonsterById(req.params.id);
    if (result.rows.length === 0) return res.status(404).send('Monster not found');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /monsters
router.post('/', requireLogin, upload.single('image'), async (req, res) => {
  try {
    const image_path = req.file ? `/uploads/monsters/${req.file.filename}` : null;
    await Monster.createMonster({ ...req.body, image_path, is_placeholder: 0 });
    res.send(`<h2>Monster submitted!</h2><a href="/monsters.html">Add another</a>`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// PUT /monsters/:id
router.post('/:id', requireLogin, upload.single('image'), async (req, res) => {
  console.log('>>> Update route hit with ID:', req.params.id);
  try {
    const image_path = req.file ? `/uploads/monsters/${req.file.filename}` : req.body.image_path || null;
    const updated = await Monster.updateMonster(req.params.id, { ...req.body, image_path, is_placeholder: 0 });
    res.sendStatus(updated.rowCount ? 200 : 404);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE /monsters/:id
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    const deleted = await Monster.deleteMonster(req.params.id);
    res.sendStatus(deleted.rowCount ? 200 : 404);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;