import express,{ Application, NextFunction, Request, Response } from "express";
import { envVaribales } from "./config/env_variables";
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from "./boot/db";
import router from "./routers";
import cors from "cors";
import cookieParser from 'cookie-parser';

console.log(envVaribales.FRONTEND_URL,"this is my frontend  url====>")
const app:Application=express();
const PORT = envVaribales.PORT;
console.log(envVaribales.FRONTEND_URL)
app.use(cors({
  origin: [envVaribales.FRONTEND_URL], 
  credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("./assets"))
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
app.use('/', router);
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Error:', err.message + " 💥💥💥💥💥💥💥💥💥💥💥💥💥");
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

connectDB();
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT} 🚀🚀🚀🚀🚀`)
})