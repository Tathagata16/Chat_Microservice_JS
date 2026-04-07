import Message from '../models/messageModel.js';

const sendMessage = async ({senderId, receiverId, content}) =>{
    //save to db

    const conversationId = [senderId, receiverId].sort().join("_");
    const message = await Message.create({
        conversationId,
        senderId,
        receiverId,
        content
    });

    return message;
}

export default sendMessage;