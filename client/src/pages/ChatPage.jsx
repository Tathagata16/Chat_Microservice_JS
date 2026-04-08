//feature: show time of the message delivery
//featuer: show typing...

import React, { useState } from 'react';
import { useEffect } from 'react';
import { connectWs } from '../utils/ws.js';
import { useRef } from 'react';
import API_BASE_URL from '../utils/config.js';
import Message from '../components/Message.jsx';

const ChatPage = () => {
  // ------------------------------
  //dummy data section
  //dummy users
  //   const users = [
  //   { id: 1, name: "Alice Johnson", status: "online" },
  //   { id: 2, name: "Bob Smith", status: "offline" },
  //   { id: 3, name: "Charlie Brown", status: "online" },
  //   { id: 4, name: "Diana Prince", status: "away" },
  // ];

  // Messages for each user


  //------------------section end-------------------------------------/
  const socket = useRef(null);

  //defining the current user
  const loggedInUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const myId = loggedInUser._id;

  //getting all the signedup users
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        //api call
        const res = await fetch(`${API_BASE_URL}/api/auth/allusers`, {
          method: "GET",
          headers: {
            'Content-Type': "application/josn"
          },
          credentials: 'include',
        });
        const data = await res.json();

        console.log(data);
        //filtering the loggedin user out of the list
        const filteredUsers = data.filter(user => user._id != loggedInUser._id);

        //setting up the list
        setUsers(filteredUsers);
        console.log(users.length);
      } catch (error) {
        console.log("error in frontend fetch user function", error);
      }
    }

    fetchUsers();

  }, []);

  //get Previous messages..
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  useEffect(() => {
    if (!selectedUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        if (!selectedUser || !selectedUser._id) return;

        //fetch old messages
        const res = await fetch(`${API_BASE_URL}/api/chat/messages/${selectedUser._id}`, {
          method: 'GET',
          credentials: 'include', // THIS IS THE MISSING LINK
          headers: {
            'Content-Type': 'application/json'
          },
        });
        if (!res.ok) throw new Error("failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.log('error in fetching messages in clinet function: ', error.message);
      }

    }

    fetchMessages();

  }, [selectedUser]);


  //establishing connection
  useEffect(() => {
    socket.current = connectWs();

    socket.current.on('connect', () => {
      console.log("connected to the socket server from client");

    })

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const [inputText, setInputText] = useState("");
  //sending message
  const handleSend = () => {
    if (!selectedUser || inputText.trim() == "") return;
    if (!socket.current) return;

    const loggedInUser = JSON.parse(localStorage.getItem('userInfo'));

    const newMessage = {
      to: selectedUser._id,
      content: inputText,
      senderId: loggedInUser._id,
      receiverId: selectedUser._id,
    };

    socket.current.emit("send_message", newMessage);

    setMessages((prev) => [...prev, newMessage]);

    setInputText("");

  };

  //receive message listner
  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("receive_message", (newMessage) => {
      //only adding the message to the ui if the selected user's id matches to the sender || reciever id
      if (newMessage.senderId === selectedUser?._id || newMessage.receiverId === selectedUser?._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    })
    //cleanup
    return () => {
      socket.current.off("receive_message");
    }

  }, [selectedUser])

  //logout button function
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });
      if (res.ok) {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    } catch (error) {
      alert('error in logout')
      console.error(error);
    }
  }

  //message sent on pressing enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };




  return (
    <div className="h-screen bg-white flex">
      {/* Sidebar - User List */}
      <div className="w-80 border-r border-black flex flex-col">
        {/* Sidebar Header */}
        <div className="border-b border-black p-4 bg-gray-50">
          {/* Horizontal Profile & Chats Header */}
          <div className="flex items-center justify-between mb-2">

            {/* Left Side: Chat Title */}
            <div className="text-right">
              <h1 className="text-black text-xl font-black tracking-tight uppercase">Chats</h1>
            </div>
            {/* Right Side: Logged-in User */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm shrink-0">
                {loggedInUser.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase leading-none mb-1">Me</span>
                <h2 className="text-black font-bold text-sm truncate max-w-25">
                  {loggedInUser.username}
                </h2>
              </div>
            </div>

          </div>

          {/* Contact Count Subheader */}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 cursor-pointer border-b border-gray-200 transition-colors ${selectedUser?._id === user._id
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-black font-semibold">{user.username}</h3>
                  {/* <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)} mr-2`}></div>
                    <span className="text-gray-600 text-sm capitalize">{user.status}</span>
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleLogout} className='border-2 text-black items-end bg-white m-3 h-10 hover:bg-black hover:text-white cursor-pointer'>Logout</button>
      </div>

      {/* Chat Section */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-black p-4">
            <div className="flex items-center">
              <div>
                <h2 className="text-black text-xl font-bold">{selectedUser.username}</h2>

              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <Message
                key={msg._id || Math.random()}
                content={msg.content}
                type={msg.senderId === myId ? "me" : "other"}
              />
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-black p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message ${selectedUser.name}...`}
                className="flex-1 px-4 py-2 border border-black bg-white text-black focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        // No User Selected State
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Select a user to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;