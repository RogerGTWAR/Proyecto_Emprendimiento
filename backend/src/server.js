import express from 'express';
import prisma from './database.js';

const app = express();

app.get('/api/hello', async (req, res) => {

  const users = await prisma.users.findMany();

  res.json(users);

});

app.listen(3000, () => console.log('Backend en http://localhost:3000'));

