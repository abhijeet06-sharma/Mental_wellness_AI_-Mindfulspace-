import React, { useState, useEffect, useRef } from "react";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Loader2, Heart, User } from "lucide-react";
import { format, isValid } from "date-fns";

export default function Therapist() {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewConversation = () => {
    const newConversationId = `c${Date.now()}`;
    setCurrentConversation({ id: newConversationId });
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm here to provide you with a safe, supportive space. How are you feeling today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };
  
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentConversation) return;
    const userMessage = { role: "user", content: inputValue.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call backend and get AI response directly
      const responseData = await apiClient("/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: userMessage.content,
          conversation_id: currentConversation.id,
          timestamp: userMessage.timestamp,
        }),
      });

      const aiMessage = {
        role: "assistant",
        content: responseData.result,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I couldn't respond right now. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {currentConversation ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Therapy Session</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Safe, confidential, and supportive</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Share what's on your mind..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
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
            <Brain className="w-16 h-16 mx-auto text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to Your Safe Space</h2>
            <p className="text-gray-600 dark:text-gray-400">This is a judgment-free zone where your conversations are saved for you to review later in your history.</p>
            <Button 
              onClick={startNewConversation}
              className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              size="lg"
            >
              <Heart className="w-4 h-4 mr-2" />
              Start New Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components
function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const date = new Date(message.timestamp);
  const isValidDate = isValid(date);
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Brain className="w-4 h-4 text-white" />}
      </div>
      <div className={`flex-1 max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-2xl ${isUser ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'} ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isValidDate ? format(date, "h:mm a") : ''}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-purple-500 to-indigo-500">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm p-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
