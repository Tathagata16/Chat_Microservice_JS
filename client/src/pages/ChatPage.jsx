import React, { useEffect, useRef, useState } from 'react';
import API_BASE_URL from '../utils/config.js';
import Message from '../components/Message.jsx';
import useChatStore from '../utils/useChatstore.js';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const navigate = useNavigate();
  const { getUsers, initSocket, users, selectedUser, setSelectedUser, messages, sendMessage, clearChatState, isTyping, isUsersLoading, isMessagesLoading } = useChatStore();

  const loggedInUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const myId = loggedInUser?._id;

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const typingRef = useRef(false);
  const timeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const hasSpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!loggedInUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (myId) {
      getUsers(myId);
      initSocket();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  useEffect(() => {
    if (!hasSpeechRecognition) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    recognition.onresult = (event) => {

      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {

        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }

      }

      setInputText(finalTranscript + interimTranscript);

    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };

  }, [hasSpeechRecognition]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      recognitionRef.current?.stop?.();
    };
  }, []);

  //handle typing event
  const handleTyping = (e) => {

    setInputText(e.target.value);

    const socket = useChatStore.getState().socket;

    if (!selectedUser || !socket) return;

    if (!typingRef.current) {
      typingRef.current = true;

      socket.emit("typing", {
        to: selectedUser._id
      });
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {

      typingRef.current = false;

      socket.emit("stop_typing", {
        to: selectedUser._id
      });

    }, 1000);
  };

  //listening for speech input
  const toggleListening = () => {

    if (!recognitionRef.current || !hasSpeechRecognition) return;

    if (isListening) {

      recognitionRef.current.stop();
      setIsListening(false);

    } else {

      recognitionRef.current.start();
      setIsListening(true);

    }

  };

  //sending message
  const handleSend = () => {
    if (!selectedUser || inputText.trim() == "") return;

    const socket = useChatStore.getState().socket;

    if (typingRef.current) {

      socket.emit("stop_typing", {
        to: selectedUser._id
      });

      typingRef.current = false;
      clearTimeout(timeoutRef.current);
    }

    sendMessage(inputText);
    setInputText("");
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  };

  //logout button function
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: 'include'
      });
      if (res.ok) {
        localStorage.removeItem('userInfo');
        clearChatState();
        navigate('/login', { replace: true });
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-[240px] flex-col border-b border-white/10 bg-slate-950/95 text-white lg:border-b-0 lg:border-r lg:border-slate-800/80">
          <div className="border-b border-white/10 bg-white/5 px-5 py-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Conversations</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Chats</h1>
                <p className="mt-2 max-w-xs text-sm text-slate-300">Pick a contact and keep every conversation in one focused workspace.</p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/20">
                  {loggedInUser?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Me</p>
                  <h2 className="truncate text-sm font-semibold text-white">{loggedInUser?.username || 'Guest'}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-sm text-slate-300">
            <span>{users.length} contacts</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sync live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {isUsersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/5 rounded-full bg-white/10" />
                        <div className="h-2 w-2/5 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                No contacts available yet. Once the backend returns users, they will appear here automatically.
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => {
                  const isSelected = selectedUser?._id === user._id;

                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`group w-full rounded-3xl border px-4 py-4 text-left transition-all duration-200 focus-ring ${isSelected
                        ? 'border-white/15 bg-white/10 shadow-[0_16px_32px_rgba(15,23,42,0.22)]'
                        : 'border-transparent bg-white/0 hover:border-white/10 hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-semibold text-white transition-transform ${isSelected ? 'bg-gradient-to-br from-sky-400 to-indigo-500' : 'bg-slate-800 group-hover:scale-[1.02]'}`}>
                          {user.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="truncate font-semibold text-white">{user.username}</h3>
                            <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          </div>
                          <p className="mt-1 text-sm text-slate-400">Tap to open the conversation</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Chat Section */}
        {selectedUser ? (
          <main className="flex min-h-screen min-w-0 flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,250,252,0.96))]">
            <div className="border-b border-slate-200/80 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
                    {selectedUser.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-slate-950">{selectedUser.username}</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{isTyping ? 'typing…' : 'ready to chat'}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 md:inline-flex">
                  Secure session
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                {isMessagesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <div className="h-14 w-56 animate-pulse rounded-[1.4rem] bg-slate-200/80" />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <Message
                      key={msg._id || `${msg.senderId}-${msg.createdAt}-${index}`}
                      content={msg.content}
                      type={msg.senderId === myId ? "me" : "other"}
                      timestamp={msg.createdAt}
                    />
                  ))
                ) : (
                  <div className="mx-auto flex min-h-[260px] w-full max-w-xl flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/20">
                      <span className="text-2xl">✦</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-950">Start the conversation</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Send the first message to begin a real-time thread with {selectedUser.username}.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-4xl">
                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label htmlFor="message-input" className="sr-only">Message</label>
                      <input
                        id="message-input"
                        type="text"
                        value={inputText}
                        onChange={handleTyping}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${selectedUser.username}...`}
                        className="focus-ring w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400"
                      />
                      <p className="mt-2 text-xs text-slate-500">Press Enter to send. Voice input is available when supported.</p>
                    </div>

                    <div className="flex gap-2 sm:shrink-0">
                      <button
                        onClick={toggleListening}
                        disabled={!hasSpeechRecognition}
                        className={`focus-ring inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${isListening
                          ? 'border-rose-200 bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          } ${!hasSpeechRecognition ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <span>{isListening ? 'Stop' : 'Voice'}</span>
                        <span className="text-base">{isListening ? '◉' : '◌'}</span>
                      </button>

                      <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="focus-ring inline-flex min-w-24 items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex min-h-screen items-center justify-center px-6 py-10">
            <div className="panel-surface max-w-xl rounded-[2rem] px-8 py-10 text-center fade-in-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/20">
                <span className="text-2xl">◎</span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Select a user to start chatting</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your contacts appear in the sidebar. Choose one to open the message thread and continue the conversation.
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default ChatPage;