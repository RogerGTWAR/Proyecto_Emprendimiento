import express from 'express';
import cors from 'cors';
import materialRouter from './routes/materialRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/materials', materialRouter);

app.listen(3000, () => console.log('Backend en http://localhost:3000'));

