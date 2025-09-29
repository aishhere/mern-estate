
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cors from "cors";



import uploadRouter from './routes/upload.route.js';
import path from "path";


import cookieParser from 'cookie-parser';


dotenv.config();

mongoose.connect(process.env.MONGO)
.then(() => {
    console.log('Connected to MongoDB!')
})
.catch((err) => {
    console.log(err);
});

const app = express();

app.use(cookieParser());

app.use(express.json());



app.use(
  cors({
    origin: "http://localhost:5173", // React app URL
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));






app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);


app.use("/api/upload", uploadRouter);



app.use((err ,req , res, next) => {
    const statusCode =  err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
