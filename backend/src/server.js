import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import materialRouter from './routes/materialRoutes.js';
import productRouter from './routes/productRoutes.js';
import tagRouter from "./routes/tagRoutes.js";
import userRouter from './routes/userRoutes.js';
import workerRouter from './routes/workerRoutes.js';
import serviceRouter from './routes/serviceRoutes.js';
import processRouter from './routes/processRoutes.js';

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/materials', materialRouter);
app.use('/api/products', productRouter);
app.use('/api/tags', tagRouter);
app.use('/api/users', userRouter);
app.use('/api/workers', workerRouter);
app.use('/api/services', serviceRouter);
app.use('/api/processes', processRouter);

app.listen(3000, () => console.log('Backend en http://localhost:3000'));

