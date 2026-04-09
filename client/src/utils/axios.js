import axios from 'axios';
import API_BASE_URL from './config.js';


//fetch all the users that are on the app
export const fetchUsers = async (currentUserId) =>{
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
        const filteredUsers = data.filter(user => user._id != currentUserId);

        return filteredUsers;
      } catch (error) {
        console.log("error in frontend fetch user function", error);
      }
    }

//fetch previous messages
export const fetchMessage = async (targetUserId)=>{
      try {
        if (!targetUserId) return[];

        //fetch old messages
        const res = await fetch(`${API_BASE_URL}/api/chat/messages/${targetUserId}`, {
          method: 'GET',
          credentials: 'include', // THIS IS THE MISSING LINK
          headers: {
            'Content-Type': 'application/json'
          },
        });

        if (!res.ok) throw new Error("failed to fetch messages");

        const data = await res.json();
        return data;

      } catch (error) {
        console.log('error in fetching messages in clinet function: ', error.message);
        return [];
      }

    }






