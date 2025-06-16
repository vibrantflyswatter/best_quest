// models/monsterModel.js
const db = require('../db');

const getAllMonsters = () => {
  return db.query('SELECT * FROM monsters ORDER BY id ASC');
};

const getMonsterById = (id) => {
  return db.query('SELECT * FROM monsters WHERE id = $1', [id]);
};

const createMonster = (monsterData) => {
  const {
    name, description, hp, mp, attack, defense,
    magic, spirit, agility, elem_affinities, image_path, is_placeholder
  } = monsterData;

  const query = `
    INSERT INTO monsters (
      name, description, hp, mp, attack, defense,
      magic, spirit, agility, elem_affinities, image_path, is_placeholder
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
  `;

  const values = [
    name, description, hp, mp, attack, defense,
    magic, spirit, agility, elem_affinities, image_path, is_placeholder
  ];

  return db.query(query, values);
};

const updateMonster = (id, monsterData) => {
  const {
    name, description, hp, mp, attack, defense,
    magic, spirit, agility, elem_affinities, image_path, is_placeholder
  } = monsterData;

  const query = `
    UPDATE monsters SET
      name = $1, description = $2, hp = $3, mp = $4,
      attack = $5, defense = $6, magic = $7, spirit = $8,
      agility = $9, elem_affinities = $10, image_path = $11, is_placeholder = $12
    WHERE id = $13
  `;

  const values = [
    name, description, hp, mp, attack, defense,
    magic, spirit, agility, elem_affinities, image_path, is_placeholder, id
  ];

  return db.query(query, values);
};

const deleteMonster = (id) => {
  return db.query('DELETE FROM monsters WHERE id = $1', [id]);
};

module.exports = {
  getAllMonsters,
  getMonsterById,
  createMonster,
  updateMonster,
  deleteMonster
};