const db = require('../db');

const getAllReports = () => db.query('SELECT * FROM reports ORDER BY submittedAt DESC');

const createReport = (data, ip, userAgent) => {
  const { name, email, title, description, severity } = data;
  const submittedAt = new Date().toISOString();

  const query = `
    INSERT INTO reports (name, email, title, description, severity, submittedAt, user_agent, ip)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  const values = [name, email, title, description, severity, submittedAt, userAgent, ip];
  return db.query(query, values);
};

const updateReport = (id, data) => {
  const { name, email, title, description, severity } = data;
  const query = `
    UPDATE reports SET
      name = $1, email = $2, title = $3, description = $4, severity = $5
    WHERE id = $6
  `;
  return db.query(query, [name, email, title, description, severity, id]);
};

const deleteReport = (id) => {
  return db.query('DELETE FROM reports WHERE id = $1', [id]);
};

module.exports = { getAllReports, createReport, updateReport, deleteReport };