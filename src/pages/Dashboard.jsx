
import React, { useState, useEffect } from "react";
import { WellnessEntry, Conversation, ScreenTime, Meditation } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Brain, 
  Moon, 
  Zap, 
  TrendingUp, 
  Plus,
  Calendar,
  Smile,
  MessageCircle,
  Coffee, // Added Coffee icon
  Apple, // Added Apple icon
  Monitor, // Added Monitor icon for screen time
  Sparkles // Added Sparkles icon for meditation
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const INSPIRATION_QUOTES = [
  "Progress, not perfection. Every small step toward wellness is a victory worth celebrating.",
  "You are stronger than you know, braver than you believe, and more capable than you imagine.",
  "Self-care is not selfish. It's essential for your well-being and those around you.",
  "Every breath is a new beginning. Every moment is a chance to start fresh.",
  "Your mental health is just as important as your physical health. Take care of both.",
  "Small daily improvements lead to stunning long-term results.",
  "You don't have to be perfect to be amazing. You just have to be you.",
  "Healing is not linear, but every step forward counts.",
  "Your worth is not determined by your productivity. You are valuable just as you are.",
  "It's okay to not be okay. What matters is that you're taking steps to feel better."
];

export default function Dashboard() {
  const [wellnessEntries, setWellnessEntries] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [screenTimeLogs, setScreenTimeLogs] = useState([]);
  const [meditationSessions, setMeditationSessions] = useState([]);
  const [showWellnessForm, setShowWellnessForm] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const [todayScreenTime, setTodayScreenTime] = useState(null);
  const [todayMeditation, setTodayMeditation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyQuote, setDailyQuote] = useState("");

  useEffect(() => {
    loadDashboardData();
    // Set a random inspiration quote
    const randomQuote = INSPIRATION_QUOTES[Math.floor(Math.random() * INSPIRATION_QUOTES.length)];
    setDailyQuote(randomQuote);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const entries = await WellnessEntry.list("-created_date", 30);
      const chats = await Conversation.list("-created_date", 10);
      const screenTimeData = await ScreenTime.list();
      const meditationData = await Meditation.list();
      
      setWellnessEntries(entries);
      setConversations(chats);
      setScreenTimeLogs(screenTimeData);
      setMeditationSessions(meditationData);
      
      const today = format(new Date(), "yyyy-MM-dd");
      const todaysEntry = entries.find(entry => entry.date === today);
      const todaysScreenTime = screenTimeData.find(log => log.date === today);
      const todaysMeditation = meditationData.find(session => session.date === today);
      setTodayEntry(todaysEntry);
      setTodayScreenTime(todaysScreenTime);
      setTodayMeditation(todaysMeditation);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getWeeklyStats = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      format(subDays(new Date(), i), "yyyy-MM-dd")
    );
    
    const weeklyEntries = wellnessEntries.filter(entry => 
      last7Days.includes(entry.date)
    );
    
    const avgMood = weeklyEntries.reduce((sum, entry) => {
      const moodValue = {
        'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
      }[entry.mood] || 3;
      return sum + moodValue;
    }, 0) / (weeklyEntries.length || 1);
    
    const avgSleep = weeklyEntries.reduce((sum, entry) => 
      sum + (entry.sleep_hours || 0), 0
    ) / (weeklyEntries.length || 1);
    
    const avgEnergy = weeklyEntries.reduce((sum, entry) => 
      sum + (entry.energy_level || 0), 0
    ) / (weeklyEntries.length || 1);

    return { avgMood, avgSleep, avgEnergy, totalEntries: weeklyEntries.length };
  };

  const getMoodChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const entry = wellnessEntries.find(e => e.date === dateStr);
      
      const moodValue = entry ? {
        'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
      }[entry.mood] || 3 : null;
      
      return {
        date: format(date, "MMM dd"),
        mood: moodValue,
        energy: entry?.energy_level || null
      };
    });
    
    return last7Days;
  };

  const stats = getWeeklyStats();
  const chartData = getMoodChartData();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to Your Wellness Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Track your mental wellness journey and celebrate every small victory
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Weekly Mood
                </CardTitle>
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.avgMood.toFixed(1)}/5
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Avg Sleep
                </CardTitle>
                <Moon className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.avgSleep.toFixed(1)}h
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Energy Level
                </CardTitle>
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.avgEnergy.toFixed(1)}/10
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Check-ins
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalEntries}/7
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Screen Time
                </CardTitle>
                <Monitor className="w-5 h-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayScreenTime ? `${Math.floor(todayScreenTime.total_minutes / 60)}h ${todayScreenTime.total_minutes % 60}m` : '0m'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Meditation
                </CardTitle>
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayMeditation ? `${todayMeditation.duration_minutes}m` : '0m'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Button
                onClick={() => setShowWellnessForm(true)}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {todayEntry ? 'Update Today' : 'Log Wellness'}
                </span>
              </Button>
              
              <Link to={createPageUrl("Therapist")}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                >
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span className="text-xs font-medium text-center">AI Therapist</span>
                </Button>
              </Link>

              <Link to={createPageUrl("Gossip")}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                >
                  <Coffee className="w-6 h-6 text-pink-600" />
                  <span className="text-xs font-medium text-center">Gossip Corner</span>
                </Button>
              </Link>

              <Link to={createPageUrl("Nutrition")}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                >
                  <Apple className="w-6 h-6 text-green-600" />
                  <span className="text-xs font-medium text-center">Track Nutrition</span>
                </Button>
              </Link>

              <Link to={createPageUrl("ScreenTime")}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                >
                  <Monitor className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-medium text-center">Screen Time</span>
                </Button>
              </Link>

              <Link to={createPageUrl("Meditation")}>
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col items-center justify-center gap-2"
                >
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <span className="text-xs font-medium text-center">Meditation</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Mood Chart */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-4">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                7-Day Mood & Energy Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="Mood (1-5)"
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="Energy (1-10)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary & Recent Activity */}
          <div className="space-y-6">
            <Card className="p-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayEntry ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mood</span>
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-green-600" />
                        <span className="font-medium capitalize">
                          {todayEntry.mood?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {todayEntry.sleep_hours && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sleep</span>
                        <span className="font-medium">{todayEntry.sleep_hours}h</span>
                      </div>
                    )}
                    {todayEntry.energy_level && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Energy</span>
                        <span className="font-medium">{todayEntry.energy_level}/10</span>
                      </div>
                    )}
                    {todayScreenTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Screen Time</span>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">
                            {Math.floor(todayScreenTime.total_minutes / 60)}h {todayScreenTime.total_minutes % 60}m
                          </span>
                        </div>
                      </div>
                    )}
                    {todayMeditation && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Meditation</span>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">
                            {todayMeditation.duration_minutes}m ({todayMeditation.type.replace('_', ' ')})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No entry for today yet
                    </p>
                    <Button 
                      onClick={() => setShowWellnessForm(true)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Today's Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Daily Inspiration</CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-base text-gray-600 dark:text-gray-400 italic">
                  "{dailyQuote}"
                </blockquote>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  — Your MindfulSpace companion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Wellness Form Modal */}
        {showWellnessForm && (
          <WellnessFormModal 
            todayEntry={todayEntry}
            todayScreenTime={todayScreenTime}
            todayMeditation={todayMeditation}
            onSave={loadDashboardData}
            onClose={() => setShowWellnessForm(false)}
          />
        )}
      </div>
    </div>
  );
}

function WellnessFormModal({ todayEntry, todayScreenTime, todayMeditation, onSave, onClose }) {
  const [formData, setFormData] = useState({
    mood: todayEntry?.mood || "neutral",
    energy_level: todayEntry?.energy_level || 5,
    sleep_hours: todayEntry?.sleep_hours || 8,
    sleep_quality: todayEntry?.sleep_quality || "good",
    stress_level: todayEntry?.stress_level || 5,
    gratitude: todayEntry?.gratitude || "",
    screen_time_minutes: todayScreenTime?.total_minutes || 0,
    meditation_minutes: todayMeditation?.duration_minutes || 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save wellness entry
      if (todayEntry) {
        await WellnessEntry.update(todayEntry.id, formData);
      } else {
        await WellnessEntry.create({
          ...formData,
          date: format(new Date(), "yyyy-MM-dd")
        });
      }

      // Save screen time data if provided
      if (formData.screen_time_minutes > 0) {
        const screenTimeData = {
          total_minutes: formData.screen_time_minutes,
          social_media: Math.floor(formData.screen_time_minutes * 0.3), // Estimate 30% social media
          productivity: Math.floor(formData.screen_time_minutes * 0.4), // Estimate 40% productivity
          entertainment: Math.floor(formData.screen_time_minutes * 0.2), // Estimate 20% entertainment
          education: Math.floor(formData.screen_time_minutes * 0.1), // Estimate 10% education
          break_reminders: Math.floor(formData.screen_time_minutes / 60), // 1 reminder per hour
          date: format(new Date(), "yyyy-MM-dd")
        };

        if (todayScreenTime) {
          await ScreenTime.update(todayScreenTime.id, screenTimeData);
        } else {
          await ScreenTime.create(screenTimeData);
        }
      }

      // Save meditation data if provided
      if (formData.meditation_minutes > 0) {
        const meditationData = {
          duration_minutes: formData.meditation_minutes,
          type: 'mindfulness', // Default type
          with_music: false, // Default
          ai_guidance: false, // Default
          mood_before: formData.energy_level, // Use energy level as mood before
          mood_after: formData.energy_level + 1, // Assume meditation improves mood
          notes: 'Logged via wellness check-in',
          date: format(new Date(), "yyyy-MM-dd")
        };

        if (todayMeditation) {
          await Meditation.update(todayMeditation.id, meditationData);
        } else {
          await Meditation.create(meditationData);
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving wellness entry:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Today's Wellness Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">How are you feeling?</label>
              <select 
                value={formData.mood} 
                onChange={(e) => setFormData({...formData, mood: e.target.value})}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="very_sad">😢 Very Sad</option>
                <option value="sad">😔 Sad</option>
                <option value="neutral">😐 Neutral</option>
                <option value="happy">😊 Happy</option>
                <option value="very_happy">😄 Very Happy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sleep Hours</label>
              <input 
                type="number" 
                min="0" 
                max="24" 
                step="0.5"
                value={formData.sleep_hours}
                onChange={(e) => setFormData({...formData, sleep_hours: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Energy Level (1-10): {formData.energy_level}</label>
              <input 
                type="range" 
                min="1" 
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({...formData, energy_level: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Screen Time Today (minutes)</label>
              <input 
                type="number" 
                min="0" 
                max="1440" 
                value={formData.screen_time_minutes}
                onChange={(e) => setFormData({...formData, screen_time_minutes: parseInt(e.target.value) || 0})}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter screen time in minutes"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.screen_time_minutes > 0 ? 
                  `${Math.floor(formData.screen_time_minutes / 60)}h ${formData.screen_time_minutes % 60}m` : 
                  '0m'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meditation Today (minutes)</label>
              <input 
                type="number" 
                min="0" 
                max="120" 
                value={formData.meditation_minutes}
                onChange={(e) => setFormData({...formData, meditation_minutes: parseInt(e.target.value) || 0})}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter meditation time in minutes"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.meditation_minutes > 0 ? 
                  `${formData.meditation_minutes}m` : 
                  '0m'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">What are you grateful for?</label>
              <textarea 
                value={formData.gratitude}
                onChange={(e) => setFormData({...formData, gratitude: e.target.value})}
                className="w-full p-2 border rounded-md h-20 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Express your gratitude..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
