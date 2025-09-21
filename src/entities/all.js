// This file MOCKS (simulates) a database connection.
// In a real application, this would talk to a real backend.

import { format, subDays } from 'date-fns';

// --- Mock Data ---
const mockWellnessEntries = [
  { id: 'w1', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), mood: 'happy', energy_level: 8, sleep_hours: 7.5 },
  { id: 'w2', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), mood: 'neutral', energy_level: 6, sleep_hours: 6 },
  { id: 'w3', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), mood: 'happy', energy_level: 7, sleep_hours: 8 },
];

const mockConversations = [
    { id: 'c1', type: 'therapy', title: 'Feeling a bit anxious', created_date: subDays(new Date(), 1).toISOString(), messages: [{ role: 'user', content: 'I was feeling anxious yesterday.' }] },
    { id: 'c2', type: 'gossip', title: 'Watched a great movie!', created_date: subDays(new Date(), 2).toISOString(), messages: [{ role: 'user', content: 'You have to see this new movie...' }] },
];

const mockNutritionLogs = [
    { id: 'n1', date: format(new Date(), 'yyyy-MM-dd'), food_name: 'Oatmeal with Berries', meal_type: 'breakfast', calories: 350, protein: 10, carbs: 60, fat: 8 },
    { id: 'n2', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), food_name: 'Grilled Chicken Salad', meal_type: 'lunch', calories: 450, protein: 40, carbs: 15, fat: 25 },
];

const mockScreenTimeLogs = [
    { id: 'st1', date: format(new Date(), 'yyyy-MM-dd'), total_minutes: 420, social_media: 120, productivity: 180, entertainment: 90, education: 30, break_reminders: 8 },
    { id: 'st2', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), total_minutes: 380, social_media: 90, productivity: 200, entertainment: 60, education: 30, break_reminders: 6 },
    { id: 'st3', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), total_minutes: 520, social_media: 150, productivity: 220, entertainment: 120, education: 30, break_reminders: 10 },
    { id: 'st4', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), total_minutes: 350, social_media: 80, productivity: 180, entertainment: 70, education: 20, break_reminders: 5 },
    { id: 'st5', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), total_minutes: 480, social_media: 140, productivity: 200, entertainment: 100, education: 40, break_reminders: 7 },
];

const mockMeditationSessions = [
    { id: 'm1', date: format(new Date(), 'yyyy-MM-dd'), duration_minutes: 20, type: 'mindfulness', with_music: true, ai_guidance: true, mood_before: 6, mood_after: 8, notes: 'Felt very relaxed after the session' },
    { id: 'm2', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), duration_minutes: 15, type: 'breathing', with_music: false, ai_guidance: true, mood_before: 5, mood_after: 7, notes: 'Great breathing exercise' },
    { id: 'm4', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), duration_minutes: 10, type: 'mindfulness', with_music: false, ai_guidance: false, mood_before: 7, mood_after: 8, notes: 'Quick morning meditation' },
    { id: 'm5', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), duration_minutes: 45, type: 'loving_kindness', with_music: true, ai_guidance: true, mood_before: 3, mood_after: 9, notes: 'Powerful session, felt very connected' },
];

const mockUser = {
    full_name: "Alex Doe",
    email: "alex@example.com",
    theme: "light",
};


// --- Mock Entities ---

export const WellnessEntry = {
  list: async () => { console.log("MOCK: Listing Wellness Entries"); return mockWellnessEntries; },
  create: async (data) => { console.log("MOCK: Creating Wellness Entry", data); },
  update: async (id, data) => { console.log("MOCK: Updating Wellness Entry", id, data); },
};

export const Conversation = {
  list: async () => { console.log("MOCK: Listing All Conversations"); return mockConversations; },
  filter: async ({ type }) => { 
    console.log(`MOCK: Filtering Conversations for type: ${type}`);
    return mockConversations.filter(c => c.type === type); 
  },
  create: async (data) => {
    console.log("MOCK: Creating Conversation", data);
    const newConvo = { id: `c${Date.now()}`, created_date: new Date().toISOString(), ...data };
    return newConvo;
  },
  update: async (id, data) => { console.log("MOCK: Updating Conversation", id, data); },
  delete: async (id) => { console.log("MOCK: Deleting Conversation", id); },
};

export const NutritionLog = {
    list: async () => { console.log("MOCK: Listing Nutrition Logs"); return mockNutritionLogs; },
    create: async (data) => { console.log("MOCK: Creating Nutrition Log", data); },
};

export const ScreenTime = {
    list: async () => { console.log("MOCK: Listing Screen Time Logs"); return mockScreenTimeLogs; },
    create: async (data) => { 
        console.log("MOCK: Creating Screen Time Log", data); 
        const newLog = { id: `st${Date.now()}`, ...data };
        mockScreenTimeLogs.push(newLog);
        return newLog;
    },
    update: async (id, data) => { 
        console.log("MOCK: Updating Screen Time Log", id, data); 
        const index = mockScreenTimeLogs.findIndex(log => log.id === id);
        if (index !== -1) {
            mockScreenTimeLogs[index] = { ...mockScreenTimeLogs[index], ...data };
            return mockScreenTimeLogs[index];
        }
        return null;
    },
    delete: async (id) => { 
        console.log("MOCK: Deleting Screen Time Log", id); 
        const index = mockScreenTimeLogs.findIndex(log => log.id === id);
        if (index !== -1) {
            return mockScreenTimeLogs.splice(index, 1)[0];
        }
        return null;
    },
    getByDate: async (date) => {
        console.log("MOCK: Getting Screen Time Log by date", date);
        return mockScreenTimeLogs.find(log => log.date === date) || null;
    },
    getWeeklyStats: async () => {
        console.log("MOCK: Getting weekly screen time stats");
        const last7Days = Array.from({ length: 7 }, (_, i) => 
            format(subDays(new Date(), i), 'yyyy-MM-dd')
        );
        const weeklyLogs = mockScreenTimeLogs.filter(log => 
            last7Days.includes(log.date)
        );
        
        const totalMinutes = weeklyLogs.reduce((sum, log) => sum + log.total_minutes, 0);
        const avgDaily = totalMinutes / 7;
        const totalSocial = weeklyLogs.reduce((sum, log) => sum + log.social_media, 0);
        const totalProductivity = weeklyLogs.reduce((sum, log) => sum + log.productivity, 0);
        
        return {
            totalMinutes,
            avgDailyMinutes: avgDaily,
            totalSocialMedia: totalSocial,
            totalProductivity: totalProductivity,
            daysTracked: weeklyLogs.length
        };
    }
};

export const Meditation = {
    list: async () => { console.log("MOCK: Listing Meditation Sessions"); return mockMeditationSessions; },
    create: async (data) => { 
        console.log("MOCK: Creating Meditation Session", data); 
        const newSession = { id: `m${Date.now()}`, ...data };
        mockMeditationSessions.push(newSession);
        return newSession;
    },
    update: async (id, data) => { 
        console.log("MOCK: Updating Meditation Session", id, data); 
        const index = mockMeditationSessions.findIndex(session => session.id === id);
        if (index !== -1) {
            mockMeditationSessions[index] = { ...mockMeditationSessions[index], ...data };
            return mockMeditationSessions[index];
        }
        return null;
    },
    delete: async (id) => { 
        console.log("MOCK: Deleting Meditation Session", id); 
        const index = mockMeditationSessions.findIndex(session => session.id === id);
        if (index !== -1) {
            return mockMeditationSessions.splice(index, 1)[0];
        }
        return null;
    },
    getByDate: async (date) => {
        console.log("MOCK: Getting Meditation Sessions by date", date);
        return mockMeditationSessions.filter(session => session.date === date);
    },
    getWeeklyStats: async () => {
        console.log("MOCK: Getting weekly meditation stats");
        const last7Days = Array.from({ length: 7 }, (_, i) => 
            format(subDays(new Date(), i), 'yyyy-MM-dd')
        );
        const weeklySessions = mockMeditationSessions.filter(session => 
            last7Days.includes(session.date)
        );
        
        const totalMinutes = weeklySessions.reduce((sum, session) => sum + session.duration_minutes, 0);
        const avgSessionLength = totalMinutes / (weeklySessions.length || 1);
        const totalSessions = weeklySessions.length;
        const sessionsWithMusic = weeklySessions.filter(session => session.with_music).length;
        const sessionsWithAI = weeklySessions.filter(session => session.ai_guidance).length;
        
        return {
            totalMinutes,
            avgSessionLength,
            totalSessions,
            sessionsWithMusic,
            sessionsWithAI,
            daysTracked: weeklySessions.length
        };
    },
    getAIGuidance: async (type, duration) => {
        console.log("MOCK: Getting AI guidance for", type, duration);
        const guidance = {
            mindfulness: [
                "Find a comfortable position and close your eyes gently.",
                "Focus on your breath, feeling the air entering and leaving your nostrils.",
                "When your mind wanders, gently bring your attention back to your breath.",
                "Notice any thoughts or feelings without judgment, then return to your breath.",
                "Feel your body becoming more relaxed with each breath."
            ],
            breathing: [
                "Sit comfortably with your back straight but relaxed.",
                "Place one hand on your chest and one on your belly.",
                "Breathe in slowly for 4 counts, feeling your belly rise.",
                "Hold your breath for 4 counts.",
                "Exhale slowly for 6 counts, feeling your belly fall.",
                "Repeat this cycle, focusing on the rhythm of your breath."
            ],
            loving_kindness: [
                "Sit comfortably and close your eyes.",
                "Begin by sending loving-kindness to yourself: 'May I be happy, may I be healthy, may I be peaceful.'",
                "Think of someone you love and send them the same wishes.",
                "Think of someone neutral and send them loving-kindness.",
                "Think of someone difficult and send them compassion.",
                "Finally, send loving-kindness to all beings everywhere."
            ]
        };
        
        return guidance[type] || guidance.mindfulness;
    }
};

export const User = {
    me: async () => { console.log("MOCK: Getting current user"); return mockUser; },
    logout: async () => { console.log("MOCK: Logging out"); alert("Logged out!"); },
    updateMyUserData: async (data) => { console.log("MOCK: Updating user data", data); },
};

