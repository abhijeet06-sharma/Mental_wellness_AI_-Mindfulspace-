import React, { useState, useEffect } from "react";
import { ScreenTime as ScreenTimeEntity } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Monitor, 
  Smartphone, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  Brain,
  Gamepad2,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { format, subDays } from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function ScreenTime() {
  const [screenTimeLogs, setScreenTimeLogs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScreenTimeData();
  }, []);

  const loadScreenTimeData = async () => {
    setIsLoading(true);
    try {
      const logs = await ScreenTimeEntity.list();
      const stats = await ScreenTimeEntity.getWeeklyStats();
      setScreenTimeLogs(logs);
      setWeeklyStats(stats);
    } catch (error) {
      console.error("Error loading screen time data:", error);
    }
    setIsLoading(false);
  };

  const getTodayLog = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return screenTimeLogs.find(log => log.date === today);
  };

  const getWeeklyChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const log = screenTimeLogs.find(l => l.date === dateStr);
      
      return {
        date: format(date, "MMM dd"),
        total: log?.total_minutes || 0,
        social: log?.social_media || 0,
        productivity: log?.productivity || 0,
        entertainment: log?.entertainment || 0,
        education: log?.education || 0
      };
    });
    
    return last7Days;
  };

  const getCategoryData = () => {
    const todayLog = getTodayLog();
    if (!todayLog) return [];

    return [
      { name: 'Social Media', value: todayLog.social_media, color: '#3b82f6' },
      { name: 'Productivity', value: todayLog.productivity, color: '#10b981' },
      { name: 'Entertainment', value: todayLog.entertainment, color: '#f59e0b' },
      { name: 'Education', value: todayLog.education, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60); // ✅ rounds to whole number
    return hours > 0
      ? `${hours}h ${String(mins).padStart(2, "0")}m`
      : `${mins}m`;
  };


  const getScreenTimeGoal = () => 480; // 8 hours in minutes
  const getScreenTimeStatus = (minutes) => {
    const goal = getScreenTimeGoal();
    if (minutes <= goal * 0.8) return { status: 'excellent', color: 'text-green-600', icon: TrendingDown };
    if (minutes <= goal) return { status: 'good', color: 'text-blue-600', icon: TrendingUp };
    if (minutes <= goal * 1.2) return { status: 'moderate', color: 'text-yellow-600', icon: AlertCircle };
    return { status: 'high', color: 'text-red-600', icon: AlertCircle };
  };

  const todayLog = getTodayLog();
  const weeklyData = getWeeklyChartData();
  const categoryData = getCategoryData();
  const goal = getScreenTimeGoal();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Screen Time Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Monitor your digital wellness and build healthier screen habits
          </p>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Today's Total
                </CardTitle>
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayLog ? formatTime(todayLog.total_minutes) : '0m'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Goal: {formatTime(goal)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Social Media
                </CardTitle>
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayLog ? formatTime(todayLog.social_media) : '0m'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Productivity
                </CardTitle>
                <Brain className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayLog ? formatTime(todayLog.productivity) : '0m'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Break Reminders
                </CardTitle>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todayLog ? todayLog.break_reminders : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Stats */}
        {weeklyStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTime(weeklyStats.avgDailyMinutes)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Daily Average</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTime(weeklyStats.totalSocialMedia)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Social Media</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {weeklyStats.daysTracked}/7
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Screen Time Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => [formatTime(value), 'Screen Time']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [formatTime(value), name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {categoryData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {entry.name}: {formatTime(entry.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>No data for today yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {todayLog ? 'Update Today' : 'Log Screen Time'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  // This would integrate with device APIs in a real app
                  alert('This would open device screen time settings');
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Device Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Screen Time Form Modal */}
        {showForm && (
          <ScreenTimeFormModal 
            todayLog={todayLog}
            onSave={loadScreenTimeData}
            onClose={() => {
              setShowForm(false);
              setEditingLog(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ScreenTimeFormModal({ todayLog, onSave, onClose }) {
  const [formData, setFormData] = useState({
    total_minutes: todayLog?.total_minutes || 0,
    social_media: todayLog?.social_media || 0,
    productivity: todayLog?.productivity || 0,
    entertainment: todayLog?.entertainment || 0,
    education: todayLog?.education || 0,
    break_reminders: todayLog?.break_reminders || 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (todayLog) {
        await ScreenTimeEntity.update(todayLog.id, formData);
      } else {
        await ScreenTimeEntity.create({
          ...formData,
          date: format(new Date(), "yyyy-MM-dd")
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving screen time log:", error);
    }
  };

  const updateCategory = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const categories = [
    { key: 'social_media', label: 'Social Media', icon: Smartphone, color: 'text-purple-600' },
    { key: 'productivity', label: 'Productivity', icon: Brain, color: 'text-green-600' },
    { key: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'text-orange-600' },
    { key: 'education', label: 'Education', icon: BookOpen, color: 'text-blue-600' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Screen Time Log</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={formData[key]}
                      onChange={(e) => updateCategory(key, e.target.value)}
                      className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Minutes"
                    />
                    <span className="text-sm text-gray-500">min</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-orange-600" />
                Break Reminders
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.break_reminders}
                onChange={(e) => setFormData({...formData, break_reminders: parseInt(e.target.value) || 0})}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Number of break reminders"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Screen Time:</span>
                <span className="text-lg font-bold">
                  {Math.floor((formData.social_media + formData.productivity + formData.entertainment + formData.education) / 60)}h {(formData.social_media + formData.productivity + formData.entertainment + formData.education) % 60}m
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {todayLog ? 'Update Log' : 'Save Log'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
