import React, { useState, useEffect } from "react";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Search, Trash2, MessageCircle, User, Loader2 } from "lucide-react";
import { format, isValid } from "date-fns";

export default function History() {
  const [allConversations, setAllConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const loadConversationList = async () => {
      setIsLoading(true);
      try {
        const conversationsData = await apiClient("/conversations");
        if (Array.isArray(conversationsData)) {
          setAllConversations(conversationsData);
          setFilteredConversations(conversationsData);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
      setIsLoading(false);
    };
    loadConversationList();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(allConversations);
      return;
    }
    setFilteredConversations(
      allConversations.filter(conv =>
        conv.title && conv.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, allConversations]);

  const viewConversationDetails = async (conversation) => {
    setSelectedConversation({ ...conversation, messages: null });
    try {
      const messageData = await apiClient(`/conversations/${conversation.id}/messages`);
      setSelectedConversation({ ...conversation, messages: messageData || [] });
    } catch (error) {
      console.error("Error loading messages:", error);
      setSelectedConversation({ ...conversation, messages: [] });
    }
  };

  const deleteConversation = async (conversationId) => {
    if (window.confirm("Are you sure you want to delete this chat history? This cannot be undone.")) {
      try {
        await apiClient(`/conversations/${conversationId}`, { method: "DELETE" });
        setAllConversations(prev => prev.filter(c => c.id !== conversationId));
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {selectedConversation ? (
          <FullConversationView
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">Therapy Chat History</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">Review and manage your past sessions.</p>
            </div>
            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by conversation title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
            </Card>
            <ConversationList 
              conversations={filteredConversations}
              onDelete={deleteConversation}
              isLoading={isLoading}
              onClick={viewConversationDetails}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ConversationList({ conversations, onDelete, isLoading, onClick }) {
  if (isLoading) {
    return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
  }
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="text-lg font-semibold mt-4">No conversations found</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const date = new Date(conversation.created_at);
        const isValidDate = isValid(date);
        return (
          <Card key={conversation.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => onClick(conversation)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Brain className="w-6 h-6 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  {/* THIS IS THE FIX: Removed the 'truncate' class to allow text to wrap */}
                  <h3 className="font-semibold">{conversation.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isValidDate ? format(date, "MMM dd, yyyy 'at' h:mm a") : '...'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost" size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(conversation.id); }}
                className="text-gray-400 hover:text-red-600 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FullConversationView({ conversation, onBack }) {
  const areMessagesLoading = conversation.messages === null;

  return (
    <div>
      <Button onClick={onBack} className="mb-4">Back to History</Button>
      <h2 className="text-2xl font-bold mb-4">{conversation.title}</h2>
      <div className="space-y-4">
        {areMessagesLoading ? (
          <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
        ) : conversation.messages.length > 0 ? (
          conversation.messages.map((msg, idx) => <ChatMessage key={`${idx}-${msg.timestamp}`} message={msg} />)
        ) : (
          <p className="text-center text-gray-500">This conversation has no messages yet.</p>
        )}
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
    const isUser = message.role === "user";
    const date = new Date(message.timestamp);
    const isValidDate = isValid(date);
    return (
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-500' : 'bg-purple-500'}`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Brain className="w-4 h-4 text-white" />}
        </div>
        <div className={`p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 shadow-sm'}`}>
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {isValidDate ? format(date, "h:mm a") : ''}
          </p>
        </div>
      </div>
    );
}

