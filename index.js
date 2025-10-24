import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/connectDB.js';
import userRouter from './route/user.route.js';
import categoryRouter from './route/categoryRoute.js';

import productRouter from './route/product.route.js';
import checkoutRoute from './route/stripeRoute.js';

dotenv.config();

const app = express();


// Middleware
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}));

// ⚡ Fix for PayloadTooLargeError
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet({
    crossOriginResourcePolicy: false
}));

// Health check route
app.get('/', (req, res) => {
    res.send('API is working!');
});

app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/products', productRouter)
app.use("/api/checkout", checkoutRoute);




connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
