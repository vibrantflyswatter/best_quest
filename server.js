// server.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;



// Disable caching for specific pages and API routes
app.use((req, res, next) => {
  if (
    req.path === '/dungeon.html' ||
    req.path === '/monster_form.html' || // Optional: add more protected pages here
    req.path.startsWith('/auth/me')
  ) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ultisnecious',
  resave: false,
  saveUninitialized: false
}));
const DEV_MODE = true;
if (DEV_MODE) {
  const autoLogin = require('./middleware/devLogin');
  app.use(autoLogin);
}

// HEAD check route -- no wildcards, pure Express-safe
app.head('/headcheck', (req, res) => {
  let relativePath = req.query.file;

  if (!relativePath) {
    return res.status(400).send('Missing file parameter');
  }

  // Remove any leading slash just in case
  relativePath = relativePath.replace(/^\/+/, '');

  const publicRoot = path.join(__dirname, 'public');
  const fullPath = path.join(publicRoot, relativePath);

  // Prevent path traversal
  if (!fullPath.startsWith(publicRoot)) {
    return res.status(400).end();
  }

  console.log("Checking full path:", fullPath);

  res.sendFile(fullPath, err => {
    if (err) {
      res.status(204).end();
    } else {
      res.status(200).end();
    }
  });
});

// Route imports
const monsterRoutes = require('./routes/monsters');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const mapRoutes = require('./routes/maps');
app.use('/dev/maps', mapRoutes);
app.use('/dev/monsters', monsterRoutes); 
app.use('/dev/reports', reportRoutes);
app.use('/auth', userRoutes);



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});