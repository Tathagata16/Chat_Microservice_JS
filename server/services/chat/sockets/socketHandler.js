import sendMessage  from '../services/messageService.js';

const userSocketMap = {};

function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);
        const userId = socket.handshake.auth.userId;

        console.log('user id is: ', userId);
        userSocketMap[userId] = socket.id;

        //send message event
        socket.on("send_message", async (data) => {

            if(!data.to || !data.content) return;

            const message = await sendMessage({
                senderId: userId,
                receiverId: data.to,
                content: data.content
            });

            const recieverSocketId = userSocketMap[to];
            if (recieverSocketId) {
                io.to(recieverSocketId).emit("receive_message", message);
            }

        });


        //disconnect event
        socket.on('disconnect', () => {
            delete userSocketMap[userId];
        });
    });
}



export {initSocket}