import React from 'react'

function Message({content, type}) {
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
      </div>
    </div>
  );
};

export default Message;