// server.js //
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ultisnecious',
  resave: false,
  saveUninitialized: false
}));

// Route imports
const monsterRoutes = require('./routes/monsters');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
app.use('/dev/monsters', monsterRoutes); // Development API
app.use('/dev/reports', reportRoutes);   // Development API
app.use('/auth', userRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
