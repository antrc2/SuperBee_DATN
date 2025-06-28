import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@contexts/ChatContext";
import { useAuth } from "@contexts/AuthContext";
import { decodeData } from "../../utils/hook";

const ChatComponent = () => {
  const {
    isLoggedIn,
    agentChatRoom, // object containing roomId, messages, info, etc. for the agent chat
    sendChatMessage,
    requestAgentChat,
    leaveAgentChatRoom, // Function to leave the agent chat room
  } = useChat();
  console.log("🚀 ~ ChatComponent ~ agentChatRoom:", agentChatRoom);
  const refToken = useRef(null);
  const { token } = useAuth(); // To identify the user's own messages (sender_id)
  if (token) {
    refToken.current = decodeData(token);
  } else {
    refToken.current = null; // Xóa refToken khi logout
  }

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive or when agentChatRoom updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentChatRoom?.messages]); // Only scroll when the messages array in agentChatRoom changes

  // Display message if user is not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-[30rem] max-h-[45rem] bg-gray-100 p-4 rounded-lg shadow-lg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-8 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.418-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chat Functionality
            </h3>
            <p className="text-gray-500 mb-4">
              You need to log in to use the chat feature with support staff.
            </p>
            <p className="text-sm text-gray-400">
              However, you can still receive general notifications from the
              system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle sending message
  const handleSendMessage = () => {
    if (newMessage.trim() && agentChatRoom?.roomId) {
      const success = sendChatMessage(newMessage.trim());
      if (success) {
        setNewMessage(""); // Clear input content after successful send
      }
    }
  };

  // Handle requesting chat with agent
  const handleRequestAgentChat = async () => {
    try {
      await requestAgentChat();
    } catch (error) {
      console.error("Could not create chat with agent:", error);
      alert("Could not create chat with agent: " + error.message);
    }
  };

  // Handle leaving chat room with agent
  const handleLeaveRoom = async () => {
    if (!agentChatRoom?.roomId) {
      return;
    }

    try {
      await leaveAgentChatRoom();
    } catch (error) {
      console.error("Could not leave agent chat room:", error);
      alert("Could not leave agent chat room: " + error.message);
    }
  };

  const currentMessages = agentChatRoom?.messages || [];
  return (
    <div className="flex flex-col min-h-[30rem] max-h-[45rem] bg-gray-100 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4 p-3 bg-white rounded-lg shadow">
        <div className="flex space-x-2">
          {!agentChatRoom?.roomId && (
            <button
              onClick={handleRequestAgentChat}
              className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            >
              Chat with Agent
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white p-4 rounded-lg overflow-y-auto shadow-inner mb-4 flex flex-col space-y-2">
        {agentChatRoom?.roomId ? (
          <>
            {currentMessages.map((msg) => {
              const isOwnMessage = msg.sender_id == refToken.current?.user_id;
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    isOwnMessage
                      ? "bg-blue-500 text-white self-end ml-auto"
                      : "bg-gray-300 text-gray-800 self-start mr-auto"
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {isOwnMessage
                      ? "You"
                      : `${msg.sender_name || "Support Staff"}`}
                  </p>
                  <p className="text-base">{msg.content}</p>
                  <span className="block text-xs mt-1 opacity-75">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Click "Chat with Agent" to start a conversation with support
              staff.
            </p>
          </div>
        )}
      </div>

      {agentChatRoom?.roomId && (
        <div className="flex items-center p-2 bg-white rounded-lg shadow">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={!agentChatRoom?.roomId}
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!newMessage.trim() || !agentChatRoom?.roomId}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
//  chat của client
