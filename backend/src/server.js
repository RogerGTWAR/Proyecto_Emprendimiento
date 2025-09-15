import express from 'express';
import prisma from './database.js';
import materialRouter from './routes/materialRoutes.js';

const app = express();

app.use(express.json());

app.use('/api/materials', materialRouter);

app.listen(3000, () => console.log('Backend en http://localhost:3000'));

