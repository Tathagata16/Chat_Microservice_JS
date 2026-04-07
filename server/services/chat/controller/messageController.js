import Message from "../models/messageModel.js";

export const getMessages = async (req, res) => {
    try {
        const selectedUserId = req.params.id;
        if (!selectedUserId || selectedUserId === 'undefined') {
            return res.status(400).json({ error: "Receiver ID is required" });
        }
        const user = req.user;
        //find user's messages...
        const conversationId = [selectedUserId,user._id].sort().join("_");
        let messages = [];
        
        if (conversationId) {
            messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        }
        

        if (!messages) {
            return res.status(400).json({ message: "no messages to fetch" });
        }
        return res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch messages" });
    }
}