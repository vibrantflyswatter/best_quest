const db = require('../db');

async function createCharacter(userId, name = 'Adventurer') {
  return db.query(
    `INSERT INTO characters (user_id, name, level, hp, max_hp, strength, defense, agility, created_at)
     VALUES ($1, $2, 1, 10, 10, 5, 5, 3, NOW())
     RETURNING *`,
    [userId, name]
  );
}

async function getCharacterByUserId(userId) {
  const result = await db.query(
    `SELECT * FROM characters WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0];
}

module.exports = {
  createCharacter,
  getCharacterByUserId,
};