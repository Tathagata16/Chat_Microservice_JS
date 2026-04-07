import React, { useState } from 'react';
import { useEffect } from 'react';
import { connectWs } from '../utils/ws.js';
import { useRef } from 'react';
import API_BASE_URL from '../utils/config.js';

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
  const [messagesData, setMessagesData] = useState({
    1: [
      { id: 1, text: "Hey Alice! How are you?", sender: "me" },
      { id: 2, text: "I'm good! Thanks for asking", sender: "other" },
    ],
    2: [
      { id: 1, text: "Hi Bob, ready for the meeting?", sender: "me" },
      { id: 2, text: "Yes, I'm ready", sender: "other" },
    ],
    3: [
      { id: 1, text: "Charlie, did you see the document?", sender: "me" },
      { id: 2, text: "Not yet, sending it now", sender: "other" },
    ],
    4: [
      { id: 1, text: "Diana, can you help me with this?", sender: "me" },
      { id: 2, text: "Sure, what do you need?", sender: "other" },
    ],
  });


  //------------------section end-------------------------------------/
  const socket = useRef(null);

  const [users, setUsers] = useState([]);
  //getting all the signedup users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/allusers`, {
          method:"GET",
          headers:{
            'Content-Type':"application/josn"
          },
          credentials:'include',
        });
        const data = await res.json();

        console.log(data);
        setUsers(data);
        console.log(users.length);
      } catch (error) {
        console.log("error in frontend fetch user function", error);
      }
    }

    fetchUsers();

  }, []);

  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  //get Previous messages..
  useEffect(() => {
    if (!selectedUser || !selectedUser._id) return;

    //fetch old messages
    const res = fetch(`${API_BASE_URL}/api/chat/messages/${selectedUser._id}`, {
      method: 'GET',
      credentials: 'include', // THIS IS THE MISSING LINK
      headers: {
        'Content-Type': 'application/json'
      },
    });
    res.then((response) => response.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });

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


    const newMessage = {
      to: selectedUser._id,
      content: inputText,
    };

    socket.current.emit("send_message", newMessage);

    setInputText("");

  };

  const handleLogout = async ()=>{
    try{
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method:"POST",
        credentials:'include'
      });
      if(res.ok){
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }catch(error){
      alert('error in logout')
      console.error(error);
    }
  }

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
        <div className="border-b border-black p-4">
          <h1 className="text-black text-xl font-bold">Chats</h1>
          <p className="text-gray-600 text-sm mt-1">{users.length} contacts</p>
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
            {messagesData[selectedUser._id]?.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 wrap-break-word ${message.sender === 'me'
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black'
                    }`}
                >
                  {message.text}
                </div>
              </div>
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