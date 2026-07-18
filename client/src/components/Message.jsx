import React from 'react'

function Message({ content, type, timestamp }) {

  const formatTime = (ts) => {
    if (!ts) return "";

    const date = new Date(ts);
    return date.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const isMe = type === "me";

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} fade-in-up`}>
      <div
        className={`max-w-[min(34rem,85%)] rounded-[1.4rem] border px-4 py-3 text-sm leading-relaxed md:text-base ${isMe
            ? 'border-slate-900/90 bg-slate-950 text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] rounded-br-sm'
            : 'border-slate-200 bg-white text-slate-900 shadow-[0_14px_32px_rgba(15,23,42,0.06)] rounded-bl-sm'
          } wrap-break-word whitespace-pre-wrap`}
      >
        <div>{content}</div>
        <div className={`mt-2 flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.2em] ${isMe ? 'text-slate-300' : 'text-slate-500'}`}>
          <span>{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default Message;