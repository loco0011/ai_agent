import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Trash,
  Edit,
  Plus,
  Send,
  MessageSquare,
  Bot,
  Menu,
  Clock,
  Lightbulb,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

const TypingIndicator = ({ isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className={`p-4 rounded-lg shadow-sm mr-auto float-left clear-both mb-4 inline-block ${
      isDark ? "bg-gray-800" : "bg-gray-100"
    }`}
    style={{
      maxWidth: "70%",
      width: "fit-content",
    }}
  >
    <div className="flex space-x-2 items-center">
      <div className="flex space-x-1">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className={`w-2 h-2 rounded-full ${
            isDark ? "bg-gray-500" : "bg-gray-400"
          }`}
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          className={`w-2 h-2 rounded-full ${
            isDark ? "bg-gray-500" : "bg-gray-400"
          }`}
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          className={`w-2 h-2 rounded-full ${
            isDark ? "bg-gray-500" : "bg-gray-400"
          }`}
        />
      </div>
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Agent Sam is typing...
      </span>
    </div>
  </motion.div>
);

const ClockDisplay = ({ isDark }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`p-4 border-t ${
        isDark
          ? "border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800"
          : "border-gray-200 bg-gradient-to-r from-grey-50 to-indigo-50"
      }`}
    >
      <div className="shadow-sm">
        <div className="flex items-center space-x-3">
          <div
            className={`${
              isDark ? "bg-blue-900" : "bg-blue-100"
            } p-2 rounded-lg`}
          >
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-lg font-semibold ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {formatTime(time)}
            </span>
            <span
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {formatDate(time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isDark, setIsDark] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/chat/chats"
        );
        // Sort chats by creation date, newest first
        const sortedChats = response.data.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setChats(sortedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!selectedChatId) return;
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/chats/${selectedChatId}/messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  const createChat = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat/chats",
        { name: "New Chat" }
      );
      setChats((prev) => [response.data, ...prev]);
      setSelectedChatId(response.data._id);
      setMessages([]);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChatId) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessage("");
    scrollToBottom();

    try {
      const response = await axios.post(
        `http://localhost:5000/api/chat/chats/${selectedChatId}/messages`,
        { message }
      );
      const botMessage = { role: "assistant", content: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
      scrollToBottom();

      if (
        chats.find((chat) => chat._id === selectedChatId)?.name === "New Chat"
      ) {
        renameChat(selectedChatId, message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const renameChat = async (id, newName) => {
    try {
      await axios.put(`http://localhost:5000/api/chat/chats/${id}`, {
        name: newName,
      });
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === id ? { ...chat, name: newName } : chat
        )
      );
      setRenamingChatId(null);
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const deleteChat = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/chats/${id}`);
      setChats((prev) => prev.filter((chat) => chat._id !== id));
      if (selectedChatId === id) {
        setSelectedChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const reorderChats = (newOrder) => {
    setChats(newOrder);
  };

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        id="sidebar"
        className={`fixed md:static w-[280px] shadow-lg flex flex-col h-screen
          ${isDark ? "bg-gray-800" : "bg-white"}
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          z-30`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Conversations
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-colors relative group ${
                isDark ? "text-yellow-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="relative">
                <Lightbulb className="w-5 h-5" fill={isDark ? "none" : "currentColor"} />
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createChat}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <Reorder.Group axis="y" values={chats} onReorder={reorderChats}>
            <AnimatePresence>
              {chats.map((chat) => (
                <Reorder.Item
                  key={chat._id}
                  value={chat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  whileDrag={{
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.25)",
                    cursor: "grabbing",
                  }}
                  className={`p-3 gap-2 flex justify-between items-center cursor-grab active:cursor-grabbing rounded-lg mb-2 border ${
                    selectedChatId === chat._id
                      ? "bg-blue-500 text-white border-transparent"
                      : isDark
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedChatId(chat._id);
                    setIsSidebarOpen(false);
                  }}
                >
                  {renamingChatId === chat._id ? (
                    <input
                      type="text"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      onBlur={() => renameChat(chat._id, newChatName)}
                      onKeyDown={(e) => e.key === "Enter" && renameChat(chat._id, newChatName)}
                      autoFocus
                      className={`w-full p-1 rounded ${
                        isDark ? "bg-gray-700 text-gray-200" : "bg-white text-gray-900"
                      }`}
                    />
                  ) : (
                    <span className="flex-1 truncate text-sm">{chat.name}</span>
                  )}

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingChatId(chat._id);
                        setNewChatName(chat.name);
                      }}
                    >
                      <Edit
                        className={`w-4 h-4 ${
                          selectedChatId === chat._id
                            ? "text-white"
                            : isDark
                            ? "text-gray-400 hover:text-gray-200"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat._id);
                      }}
                    >
                      <Trash className="w-4 h-4 text-red-600 hover:text-red-400" />
                    </motion.button>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        <div className="border-t">
          <ClockDisplay isDark={isDark} />
        </div>
      </div>

      <div className="flex-1 flex flex-col w-full">
        <div className="md:hidden p-4 flex justify-between items-center border-b">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          <h2 className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Agent Sam
          </h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 p-1 md:p-6 overflow-hidden">
          {selectedChatId ? (
            <>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 inline-block"
              >
                <div
                  className={`flex items-center space-x-3 px-4 py-2 rounded-xl border shadow-sm ${
                    isDark
                      ? "bg-gray-800/50 backdrop-blur-sm border-gray-700/20"
                      : "bg-white/50 backdrop-blur-sm border-white/20"
                  }`}
                >
                  <div className={`${isDark ? "bg-blue-500/20" : "bg-blue-500/10"} p-2 rounded-lg`}>
                    <Bot className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Agent Sam
                  </span>
                </div>
              </motion.div>

              <div className="flex-1 overflow-y-auto mb-2 h-[calc(100vh-280px)] md:h-[calc(105vh-240px)]">
                <div className="flex flex-col">
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-lg mb-4 shadow-sm inline-block ${
                          msg.role === "user"
                            ? "bg-blue-500 mr-2 text-white ml-auto float-right clear-both"
                            : isDark
                            ? "bg-gray-800 text-gray-200 mr-auto float-left clear-both"
                            : "bg-white text-gray-800 mr-auto float-left clear-both"
                        }`}
                        style={{
                          maxWidth: "70%",
                          width: "fit-content",
                        }}
                      >
                        <p className="text-sm md:text-base whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <AnimatePresence>
                    {loading && <TypingIndicator isDark={isDark} />}
                  </AnimatePresence>
                </div>
                <div ref={messagesEndRef} className="h-1" />
              </div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={sendMessage}
                className="flex gap-2 sticky bottom-0 bg-inherit pt-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`flex-1 p-3 md:p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm md:text-base ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  placeholder="Type your message..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-blue-500 text-white p-3 md:p-4 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </motion.form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 mt-10 md:mt-20 flex flex-col items-center justify-center px-4"
            >
              <div className={`p-4 rounded-full mb-6 ${isDark ? "bg-gray-800/50" : "bg-white/50"}`}>
                <Bot className="w-16 h-16 md:w-20 md:h-20 text-blue-500" />
              </div>
              <h2 className={`text-xl md:text-2xl font-bold mb-3 text-center ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}>
                Welcome to Agent Sam
              </h2>
              <p className={`mb-6 text-center max-w-md text-sm md:text-base ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Your personal AI assistant ready to help with anything you need.
                Start a new conversation to begin.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createChat}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md text-sm md:text-base"
              >
                Start New Chat
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;