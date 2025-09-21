import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/api/client"; // 1. IMPORT our new apiClient
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Send, Loader2, Sparkles, User } from "lucide-react";
import { format } from "date-fns";

export default function Gossip() {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 2. Start a new chat session
  const startNewConversation = () => {
    setCurrentConversation({ id: `gossip-${Date.now()}` }); // Temporary ID
    setMessages([
      {
        role: "assistant",
        content: "Hey there! ☕ What's on your mind today? I'm all ears and ready for some good conversation!",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // 3. Send message (gossip is stateless)
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentConversation) return;

    const userMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message locally
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    let geminiResponse;
    try {
      const responseData = await apiClient("/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: userMessage.content,
          section: "gossip", // 👈 ensures backend does NOT save it
          timestamp: new Date().toISOString(),
        }),
      });
      geminiResponse = {
        role: "assistant",
        content: responseData.result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to get response from AI:", error);
      geminiResponse = {
        role: "assistant",
        content: "Sorry, I couldn't get a response right now. Please try again.",
        timestamp: new Date().toISOString(),
      };
    } finally {
      setMessages((prevMessages) => [...prevMessages, geminiResponse]);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {currentConversation ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Coffee className="w-6 h-6 text-pink-600" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Your AI Friend</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ready to chat about anything! ☕</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <GossipMessage key={index} message={message} />
            ))}
            {isLoading && <GossipTypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="What's on your mind? Spill the tea! ☕"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-pink-600 to-rose-600"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </>
      ) : (
        // Welcome Screen
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="space-y-4 max-w-md">
            <Coffee className="w-16 h-16 mx-auto text-pink-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ready for Some Fun Chat?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This is your space to gossip, share random thoughts, or just have a casual conversation. No judgment, no history, just good vibes! ☕✨
            </p>
            <Button
              onClick={startNewConversation}
              className="mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start a New Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---
function GossipMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-pink-500 to-rose-500"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Coffee className="w-4 h-4 text-white" />}
      </div>
      <div className={`flex-1 max-w-[70%] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block p-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? "text-right" : "text-left"}`}>
          {format(new Date(message.timestamp), "h:mm a")}
        </p>
      </div>
    </div>
  );
}

function GossipTypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-pink-500 to-rose-500">
        <Coffee className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm p-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}
