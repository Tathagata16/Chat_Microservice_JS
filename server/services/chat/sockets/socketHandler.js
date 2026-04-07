import sendMessage  from '../services/messageService.js';
import cookie from 'cookie';
import jwt from 'jsonwebtoken'

const userSocketMap = {};

function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        //getting the cookies from handshake headers
        const rawCookies = socket.handshake.headers.cookie || '';
        const cookies = cookie.parse(rawCookies);
        const token = cookies.token;
        if(!token){
            console.log("no token found in socket Handshake");
            return socket.disconnect();
        }
        try{
            //verifying token to get userId

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;

            console.log('verified user id is: ', userId);
            userSocketMap[userId] = socket.id;
    
            //send message event
            socket.on("send_message", async (data) => {
    
                if(!data.to || !data.content) return;
    
                const message = await sendMessage({
                    senderId: userId,
                    receiverId: data.to,
                    content: data.content
                });
    
                const recieverSocketId = userSocketMap[data.to];
                if (recieverSocketId) {
                    io.to(recieverSocketId).emit("receive_message", message);
                }
    
            });
    
    
            //disconnect event
            socket.on('disconnect', () => {
                delete userSocketMap[userId];
            });

        }catch(error){
            console.log("socket JWT verification failed in socket server",error.message);
            socket.disconnect();

        }

    });
}



export {initSocket}