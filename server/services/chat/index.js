import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
dotenv.config();
import cors from 'cors';
import { initSocket } from './sockets/socketHandler.js';
import messageRoutes from './routes/messageRoutes.js';
import cookieParser from 'cookie-parser'

import dotenv from 'dotenv';
import { connectDb } from './utils/db.js';
const app = express();

app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//routes
app.use("/", messageRoutes);

initSocket(io);
server.listen(3002, () =>{
    connectDb();
    console.log('socket is running on port 3002');
});