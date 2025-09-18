import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import materialRouter from './routes/materialRoutes.js';
import productRouter from './routes/productRoutes.js';
import tagRouter from "./routes/tagRoutes.js";
import userRouter from './routes/userRoutes.js';

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

app.listen(3000, () => console.log('Backend en http://localhost:3000'));

