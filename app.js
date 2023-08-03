const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();

// Sample users for demonstration purposes (replace this with your database)
const users = [
  {
    id: 1,
    username: 'user1',
    password: '$2b$10$EW1z2W3ooYQS4QqN/nwMJeOMeQRvvUlE/npW/iE10/ElJ4NAR43pO'
  },
  {
    id: 2,
    username: 'user2',
    password: '$2b$10$EW1z2W3ooYQS4QqN/nwMJeOMeQRvvUlE/npW/iE10/ElJ4NAR43pO'
  }
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret-key', // Change this to a unique and secure key
    resave: false,
    saveUninitialized: true
  })
);

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

app.get('/', requireLogin, (req, res) => {
  res.send(`Welcome, ${req.session.user.username}!`);
});

app.get('/login', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);

  if (!user) {
    console.log('User not found:', username);
    return res.send('User not found. Please check your username.');
  }

  try {
    const hashedInputPassword = await bcrypt.hash(password, 10); // Hash the input password
    console.log('Hashed Input Password:', hashedInputPassword);
    console.log('Hashed Password:', user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      req.session.user = { id: user.id, username: user.username };
      console.log('User logged in:', user.username);
      return res.redirect('/');
    } else {
      console.log('Incorrect password for user:', username);
      return res.send('Invalid password. Please check your password.');
    }
  } catch (error) {
    console.error('Error during password comparison:', error);
    return res.send('An error occurred during login. Please try again later.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error while logging out:', err);
    }
    res.redirect('/login');
  });
});

module.exports = app;

