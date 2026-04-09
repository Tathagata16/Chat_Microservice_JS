import React from 'react'

function Message({content, type, timestamp}) {
  
  const formatTime = (ts) =>{
    if(!ts) return "";
    
    const date = new Date(ts);
    return date.toLocaleString([], {
      hour: "2-digit",
      minute:"2-digit",
      hour12:true
    });
  };
  
  const isMe = type === "me";

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[70%] p-3 text-sm md:text-base ${
          isMe 
            ? 'bg-black text-white rounded-l-lg rounded-tr-lg' 
            : 'bg-gray-200 text-black rounded-r-lg rounded-tl-lg'
        } shadow-sm wrap-break-word`}
      >
        {content}
      <span className=' text-[9px] text-green-400 m-3 uppercase'>{formatTime(timestamp)}</span>
      </div>
    </div>
  );
};

export default Message;