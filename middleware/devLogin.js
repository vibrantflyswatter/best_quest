const db = require('../db');

module.exports = async function autoLogin(req, res, next) {
  if (!req.session.user) {
    try {
      // Change the username or id here
      const result = await db.query('SELECT id, username, is_admin FROM users WHERE id = $1', [6]);
      
      if (result.rows.length > 0) {
        req.session.user = result.rows[0];
        console.log(`[DEV] Auto-logged in as ${req.session.user.username}`);
      } else {
        console.warn('[DEV] No user found with username: devadmin');
      }
    } catch (err) {
      console.error('[DEV] Auto-login error:', err.message);
    }
  }
  next();
};