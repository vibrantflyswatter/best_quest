const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const session = require('express-session'); 
const { Pool } = require('pg');

const app = express();
const port = 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
app.use(session({
  secret: 'supersecretkey', // Replace this in production
  resave: false,
  saveUninitialized: true
}));  //whats up with this?

const storage = multer.diskStorage({
  destination: 'public/assets/images/monsters/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage }); //this is probably going to get moved.

const pool = new Pool({
  user: 'devuser',
  host: 'localhost',
  database: 'housemaster',
  password: '@$$|\/|@$+e|2',
  port: 5432,
});

// --- routes come AFTER pool (previously, "db") is defined ---

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'bug123';

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    return res.redirect('/reports');
  } else {
    return res.send('<h2>Login failed</h2><a href="/login">Try again</a>');
  }
});

const useragent = require('useragent');

app.post('/submit', async (req, res) => {
  const { name, email, title, description, severity } = req.body;
  const userAgent = req.get('User-Agent');
  const submittedAt = new Date().toISOString();

  // --- Metadata extraction ---
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const agent = useragent.parse(req.headers['user-agent']);
  const os = agent.os.toString();
  const browser = agent.toAgent();
  const language = req.get('Accept-Language') || 'Unknown';
  const referrer = req.get('Referer') || 'Direct';

  // --- Updated SQL query ---
  const query = `
    INSERT INTO reports (
      name, email, title, description, severity, submittedAt, userAgent)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  const values = [
    name, email, title, description, severity, submittedAt, userAgent
  ];

  try {
    await pool.query(query, values);
    res.send(`<h2>Bug report submitted!</h2><a href="/report">Back</a><a href="/reports">i'm a table</a>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving report.");
  }
});

app.get('/reports', async (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY submittedAt DESC');
    const rows = result.rows;

    let html = `
      <h1>Submitted Bug Reports</h1>
      <table border="1" cellpadding="5">
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Title</th>
          <th>Description</th><th>Severity</th><th>Submitted At</th><th>User-Agent</th><th>Actions</th>
        </tr>
    `;

    rows.forEach(r => {
      html += `
        <tr>
          <td>${r.id}</td>
          <td>${r.name}</td>
          <td>${r.email}</td>
          <td>${r.title}</td>
          <td>${r.description}</td>
          <td>${r.severity}</td>
          <td>${new Date(r.submittedat).toLocaleString()}</td>
          <td>${r.useragent}</td>
          <td>
            <a href="/edit/${r.id}">Edit</a> |
            <a href="/delete/${r.id}" onclick="return confirm('Delete this report?')">Delete</a>
          </td>
        </tr>
      `;
    });
   

    html += `
      </table>
      <br>
      <a href="/export/json">Download JSON</a> |
      <a href="/export/csv">Download CSV</a> |
      <a href="/logout">Log Out</a>
    `;

    res.send(html);
  } catch (err) {
    console.error('Error loading reports:', err);
    res.status(500).send('Could not load reports.');
  }
});


app.get('/edit/:id', async (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    const report = result.rows[0];

    if (!report) return res.status(404).send("Report not found.");

    res.send(`
      <h1>Edit Report #${id}</h1>
      <form method="POST" action="/edit/${id}">
        <label>Name:<br><input value="${report.name}" readonly></label><br>
        <label>Email:<br><input value="${report.email}" readonly></label><br>
        <label>Title:<br><input name="title" value="${report.title}" required></label><br>
        <label>Description:<br><textarea name="description" required>${report.description}</textarea></label><br>
        <label>Severity:<br>
          <select name="severity">
            <option value="Low" ${report.severity === 'Low' ? 'selected' : ''}>Low</option>
            <option value="Moderate" ${report.severity === 'Moderate' ? 'selected' : ''}>Moderate</option>
            <option value="High" ${report.severity === 'High' ? 'selected' : ''}>High</option>
          </select>
        </label><br>
        <button type="submit">Update</button>
      </form>
      <br><a href="/reports">Back to Reports</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading report.");
  }
});

app.post('/edit/:id', async (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  const { title, description, severity } = req.body;
  const id = req.params.id;

  try {
    await pool.query(
      'UPDATE reports SET title = $1, description = $2, severity = $3 WHERE id = $4',
      [title, description, severity, id]
    );
    res.redirect('/reports');
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed.");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send("Logout failed.");
    }
    res.redirect('/login');
  });
});


app.get('/delete/:id', async (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  const id = req.params.id;
  try {
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);
    res.redirect('/reports');
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed.");
  }
});

// POSTGRESQL-BASED MONSTER ROUTES

// GET all monsters
app.get('/monsters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM monsters ORDER BY id');
    const rows = result.rows;

    const monsterRows = rows.map(monster => `
      <tr>
        <td>${monster.id}</td>
        <td><strong>${monster.name}</strong></td>
        <td>${monster.hp}/${monster.mp}</td>
        <td>ATK:${monster.attack} DEF:${monster.defense}</td>
        <td>${monster.magic}/${monster.spirit}/${monster.agility}</td>
        <td>${monster.elem_affinities}</td>
        <td>
          ${monster.image_path ? `<img src="${monster.image_path}" width="50" />` : 'No image'}
        </td>
        <td>
          <a href="/monsters/edit/${monster.id}">Edit</a> |
          <form action="/monsters/delete/${monster.id}" method="POST" style="display:inline">
            <button type="submit" onclick="return confirm('Delete this monster?')">Delete</button>
          </form>
        </td>
      </tr>
    `).join('');

    res.send(`
      <h1>Monster List</h1>
      <p><a href="/monsters/new">+ Create New Monster</a></p>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>HP/MP</th><th>Stats</th>
            <th>MAG/SPIRIT/AGI</th><th>Affinities</th><th>Image</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${monsterRows}
        </tbody>
      </table>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error.");
  }
});

// GET edit monster
app.get('/monsters/edit/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM monsters WHERE id = $1', [id]);
    const monster = result.rows[0];

    if (!monster) return res.status(404).send('Monster not found.');

    res.send(`
      <h1>Edit Monster</h1>
      <form action="/monsters/edit/${id}" method="POST" enctype="multipart/form-data">
        <label>Name: <input name="name" value="${monster.name}" /></label><br>
        <label>Description: <input name="description" value="${monster.description}" /></label><br>
        <label>HP: <input name="hp" type="number" value="${monster.hp}" /></label><br>
        <label>MP: <input name="mp" type="number" value="${monster.mp}" /></label><br>
        <label>Attack: <input name="attack" type="number" value="${monster.attack}" /></label><br>
        <label>Defense: <input name="defense" type="number" value="${monster.defense}" /></label><br>
        <label>Magic: <input name="magic" type="number" value="${monster.magic}" /></label><br>
        <label>Spirit: <input name="spirit" type="number" value="${monster.spirit}" /></label><br>
        <label>Agility: <input name="agility" type="number" value="${monster.agility}" /></label><br>
        <label>Element Affinities (JSON): <input name="elem_affinities" value="${monster.elem_affinities || ''}" /></label><br>
        <label>Is Placeholder?
          <input name="is_placeholder" type="checkbox" value="1" ${monster.is_placeholder ? 'checked' : ''}>
        </label><br>
        <label>Replace Image: <input name="image" type="file" /></label><br>
        <button type="submit">Update Monster</button>
      </form>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving monster.');
  }
});

// POST update monster
app.post('/monsters/edit/:id', upload.single('image'), async (req, res) => {
  const id = req.params.id;
  const {
    name, description, hp, mp, attack,
    defense, magic, spirit, agility,
    elem_affinities
  } = req.body;
  const is_placeholder = req.body.is_placeholder ? 1 : 0;
  const image_path = req.file ? `/assets/images/monsters/${req.file.filename}` : null;

  const baseQuery = `
    UPDATE monsters SET
      name = $1, description = $2, hp = $3, mp = $4, attack = $5, defense = $6,
      magic = $7, spirit = $8, agility = $9, elem_affinities = $10, is_placeholder = $11
      ${image_path ? ', image_path = $12' : ''}
    WHERE id = $${image_path ? 13 : 12}
  `;

  const values = [
    name, description, hp, mp, attack, defense, magic,
    spirit, agility, elem_affinities, is_placeholder
  ];

  if (image_path) values.push(image_path);
  values.push(id);

  try {
    await pool.query(baseQuery, values);
    res.redirect('/monsters');
  } catch (err) {
    console.error(err);
    res.status(500).send('Update failed.');
  }
});

// GET new monster form
app.get('/monsters/new', (req, res) => {
  res.send(`
    <h1>Create New Monster</h1>
    <form action="/monsters/new" method="POST" enctype="multipart/form-data">
      <label>Name: <input name="name" required /></label><br>
      <label>Description: <input name="description" /></label><br>
      <label>HP: <input name="hp" type="number" /></label><br>
      <label>MP: <input name="mp" type="number" /></label><br>
      <label>Attack: <input name="attack" type="number" /></label><br>
      <label>Defense: <input name="defense" type="number" /></label><br>
      <label>Magic: <input name="magic" type="number" /></label><br>
      <label>Spirit: <input name="spirit" type="number" /></label><br>
      <label>Agility: <input name="agility" type="number" /></label><br>
      <label>Elemental Affinities (JSON): <input name="elem_affinities" /></label><br>
      <label>Image: <input name="image" type="file" /></label><br>
      <button type="submit">Submit</button>
    </form>
  `);
});

// POST new monster
app.post('/monsters/new', upload.single('image'), async (req, res) => {
  const {
    name, description, hp, mp,
    attack, defense, magic, spirit,
    agility, elem_affinities
  } = req.body;

  const imagePath = req.file
    ? `/assets/images/monsters/${req.file.filename}`
    : null;

  const query = `
    INSERT INTO monsters
      (name, description, hp, mp, attack, defense, magic, spirit, agility, elem_affinities, image_path)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `;

  const values = [
    name, description, hp, mp,
    attack, defense, magic, spirit,
    agility, elem_affinities || "{}", imagePath
  ];

  try {
    await pool.query(query, values);
    res.redirect('/monsters');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create monster');
  }
});

// POST delete monster
app.post('/monsters/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM monsters WHERE id = $1', [id]);
    res.redirect('/monsters');
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete monster.");
  }
});

// GET all monsters as API
app.get('/api/monsters', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM monsters ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch monsters' });
  }
});


app.get('/export/json', async (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  try {
    const result = await pool.query('SELECT * FROM reports');
    res.setHeader('Content-Disposition', 'attachment; filename="reports.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).send("Export failed.");
  }
});

app.get('/export/csv', async (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/login');

  try {
    const result = await pool.query('SELECT * FROM reports');

    const rows = result.rows;
    if (rows.length === 0) return res.send("No data available.");

    const headers = Object.keys(rows[0]).join(',');
    const data = rows.map(row =>
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const csv = headers + '\n' + data;
    res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send("CSV export failed.");
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Bug report app running at http://localhost:${port}`);
});
