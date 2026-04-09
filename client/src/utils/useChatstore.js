import { create } from 'zustand';
import { fetchUsers, fetchMessage } from '../utils/axios.js';
import { connectWs } from '../utils/ws.js'
import API_BASE_URL from '../utils/config.js';

const useChatStore = create((set, get) => ({
    //define states
    users: [],
    messages: [],
    selectedUser: null,
    socket: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    //define actions...

    //1.initialize socket connection
    initSocket: () => {
        if (get().socket?.connected) return;

        const socket = connectWs();

        socket.on("connect", () => {
            console.log("connected to socket server");
        })

        socket.on("receive_message", (newMessage) => {
            const { selectedUser, messages } = get();

            if (newMessage.senderId === selectedUser?._id || newMessage.receiverId === selectedUser?._id) {
                set({ messages: [...messages, newMessage] });
            }
        });

        set({ socket });
    },

    //setting the active chat partner
    setSelectedUser: async (user) => {
        set({ selectedUser: user, isMessagesLoading: true });
        if (user && user._id) {
            // Reusing your existing fetchMessage utility
            const history = await fetchMessage(user._id);
            set({ messages: history || [], isMessagesLoading: false });
        } else {
            set({ messages: [], isMessagesLoading: false });
        }
    },

    //fill users array to initialize
    getUsers: async (myId) => {
        set({ isUsersLoading: true });
        const filteredUsers = await fetchUsers(myId);
        set({ users: filteredUsers || [], isUsersLoading: false });
    },

    //sending message
    sendMessage: (content) => {
        const { socket, selectedUser, messages } = get();
        const loggedInUser = JSON.parse(localStorage.getItem("userInfo") || "{}");

        if (!selectedUser || !socket) return;

        const newMessage = {
            to: selectedUser._id,
            content: content,
            senderId: loggedInUser._id,
            receiverId: selectedUser._id,
        };

        // 1. Emit to server
        socket.emit("send_message", newMessage);

        // 2. Optimistic UI update
        set({ messages: [...messages, newMessage] });
    },

    //cleanup on logout
    clearChatState: () => {
        get().socket?.disconnect();
        set({ users: [], messages: [], selectedUser: null, socket: null });
    }

}))

export default useChatStore;