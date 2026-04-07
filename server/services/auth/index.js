import express from 'express'
import dotenv from 'dotenv'
import { connectDb } from './config.js/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();


//middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}))

app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);

app.get('/health', (req, res) => {
  res.send('Server is running fine');
});

app.listen(3001, () => {
    connectDb();
  console.log('Auth Server running on port 3001');
});

