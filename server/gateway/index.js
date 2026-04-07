import express from "express";
import {createProxyMiddleware} from 'http-proxy-middleware';
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
dotenv.config();
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(morgan('dev'));

const services = {
    auth: 'http://localhost:3001',
    chat: 'http://localhost:3002'
}

app.use('/api/auth', createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    // pathRewrite:{
    //     '^/api/auth': '',
    // },
    onProxyReq: (proxyReq, req)=>{
        if(req.headers.cookie){
            proxyReq.setHeader('cookie', req.headers.cookie);
        }
    },
    onError: (err, req, res) => {        res.status(500).json({ error: 'Auth service unavailable' });
    }
}));

app.use('/api/chat', createProxyMiddleware({
    target: services.chat,
    changeOrigin: true,
    // pathRewrite:{
    //     '^/api/chat': '',
    // },
    onProxyReq: (proxyReq, req)=>{
        if(req.headers.cookie){
            proxyReq.setHeader('cookie', req.headers.cookie);
        }
    },
    onError: (err, req, res) => {
        res.status(500).json({ error: 'Chat service unavailable' });
    }
}));
//gateway for socket connections
app.use('/socket.io', createProxyMiddleware({
    target: services.chat,
    changeOrigin: true,
    ws: true,
}));

app.get('/health',(req , res)=>{
    res.send('Gateway is healthy');
});

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
});
