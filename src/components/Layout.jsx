// src/components/Layout.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import apiClient from "@/api/client";
import {
  Brain,
  LayoutDashboard,
  Coffee,
  History as HistoryIcon, // Renamed to avoid naming conflict with the page
  Apple,
  Monitor,
  Sparkles,
  Moon,
  Sun,
  Heart,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Therapist", url: "/therapist", icon: Brain },
  { title: "Gossip Corner", url: "/gossip", icon: Coffee },
  { title: "Chat History", url: "/history", icon: HistoryIcon },
  { title: "Nutrition", url: "/nutrition", icon: Apple },
  { title: "Screen Time", url: "/screentime", icon: Monitor },
  { title: "Meditation", url: "/meditation", icon: Sparkles },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // 1. THEME FIX: Initialize theme from localStorage, defaulting to 'light'.
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiClient("/users/me/");
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user. Redirecting to login.", error);
        navigate("/login"); 
      }
    };
    loadUser();
  }, [navigate]);

  // 2. THEME FIX: This effect runs whenever the theme changes to update the page and save the choice.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("theme"); // Also clear the theme on logout
    navigate("/login");
  };
  
  if (!user) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900"><p>Loading...</p></div>;
  }

  return (
    // 3. SCROLLING FIX: The main container now fills the screen height and prevents its own scrollbar.
    <div className="h-screen w-full flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <Heart className="w-8 h-8 text-pink-500 mr-3" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">MindfulSpace</h2>
        </div>

        {/* 4. SCROLLING FIX: The navigation list can now scroll independently if it gets too long. */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 ${location.pathname === item.url ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            >
              <item.icon className={`w-5 h-5 ${item.color || ''}`} />
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </Button>
          <div className="flex items-center justify-between mt-2">
            <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">{user?.full_name || "User"}</p>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center border-b px-4 py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold ml-4">MindfulSpace</h1>
        </header>

        {/* 5. SCROLLING FIX: The main content area now scrolls internally, independent of the sidebar. */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}