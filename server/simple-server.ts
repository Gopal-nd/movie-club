import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

app.get('/api/movies/search', (req, res) => {
  res.json({ message: 'Search endpoint' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
