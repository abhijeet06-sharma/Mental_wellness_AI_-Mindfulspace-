import React, { useState, useEffect, useRef } from "react";
import { Meditation as MeditationEntity } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Brain, 
  Clock, 
  Heart,
  TrendingUp,
  Music,
  Zap,
  Moon,
  Sun,
  Wind,
  Sparkles
} from "lucide-react";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MEDITATION_TYPES = [
  { 
    id: 'mindfulness', 
    name: 'Mindfulness', 
    icon: Brain, 
    color: '#3b82f6', 
    description: 'Focus on present moment awareness',
    music: null, // Will use generated audio
    musicName: 'Generated Meditation Tone',
    guide: [
      'Find a quiet, comfortable space where you won\'t be disturbed',
      'Sit with your back straight but relaxed, or lie down if preferred',
      'Close your eyes gently and take three deep breaths to center yourself',
      'Begin to notice your natural breathing rhythm without changing it',
      'When thoughts arise, acknowledge them without judgment and return to your breath'
    ]
  },
  { 
    id: 'breathing', 
    name: 'Breathing', 
    icon: Wind, 
    color: '#10b981', 
    description: 'Controlled breathing exercises',
    music: null, // Will use generated audio
    musicName: 'Generated Ocean Waves',
    guide: [
      'Sit comfortably with your spine straight and shoulders relaxed',
      'Place one hand on your chest and one on your belly',
      'Breathe in slowly through your nose for 4 counts',
      'Hold your breath gently for 4 counts',
      'Exhale slowly through your mouth for 6 counts, feeling tension release'
    ]
  },
  { 
    id: 'loving_kindness', 
    name: 'Loving Kindness', 
    icon: Sparkles, 
    color: '#8b5cf6', 
    description: 'Compassion and loving-kindness meditation',
    music: null, // Will use generated audio
    musicName: 'Generated Chimes',
    guide: [
      'Sit comfortably and close your eyes with a gentle smile',
      'Begin by sending loving-kindness to yourself',
      'Think of someone you love deeply and send them warm wishes',
      'Think of someone neutral and extend compassion to them',
      'Finally, send loving-kindness to all beings everywhere'
    ]
  }
];

const TIMER_OPTIONS = [10, 20, 30, 45, 60]; // minutes

export default function Meditation() {
  const [meditationSessions, setMeditationSessions] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [isMeditating, setIsMeditating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedType, setSelectedType] = useState('mindfulness');
  const [selectedDuration, setSelectedDuration] = useState(20);
  const [withMusic, setWithMusic] = useState(false);
  const [withAIGuidance, setWithAIGuidance] = useState(true);
  const [currentGuidance, setCurrentGuidance] = useState([]);
  const [currentGuidanceIndex, setCurrentGuidanceIndex] = useState(0);
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [notes, setNotes] = useState('');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showPreGuide, setShowPreGuide] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioRef, setAudioRef] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [audioError, setAudioError] = useState(null);
  const [useFallbackAudio, setUseFallbackAudio] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [audioContext, setAudioContext] = useState(null);

  const timerRef = useRef(null);
  const guidanceIntervalRef = useRef(null);

  useEffect(() => {
    loadMeditationData();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);

  useEffect(() => {
    if (isMeditating && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleMeditationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isMeditating, timeLeft]);

  useEffect(() => {
    if (isMeditating && withAIGuidance && currentGuidance.length > 0) {
      const guidanceInterval = (selectedDuration * 60) / currentGuidance.length;
      guidanceIntervalRef.current = setInterval(() => {
        setCurrentGuidanceIndex(prev => (prev + 1) % currentGuidance.length);
      }, guidanceInterval * 1000);
    } else {
      if (guidanceIntervalRef.current) {
        clearInterval(guidanceIntervalRef.current);
      }
    }

    return () => {
      if (guidanceIntervalRef.current) {
        clearInterval(guidanceIntervalRef.current);
      }
    };
  }, [isMeditating, withAIGuidance, currentGuidance, selectedDuration]);

  const loadMeditationData = async () => {
    setIsLoading(true);
    try {
      const sessions = await MeditationEntity.list();
      const stats = await MeditationEntity.getWeeklyStats();
      setMeditationSessions(sessions);
      setWeeklyStats(stats);
    } catch (error) {
      console.error("Error loading meditation data:", error);
    }
    setIsLoading(false);
  };

  const playMusic = () => {
    if (withMusic) {
      try {
        // Create or resume audio context
        let ctx = audioContext;
        if (!ctx || ctx.state === 'closed') {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          setAudioContext(ctx);
        }
        
        // Resume context if suspended
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        // Stop any existing audio
        stopMusic();
        
        // Create new generated audio
        const audioResult = createMeditationAudio(selectedType, ctx);
        if (audioResult) {
          setGeneratedAudio(audioResult);
          console.log('Generated meditation audio started playing successfully');
          setAudioError(null);
        } else {
          console.error('Failed to create meditation audio');
          setAudioError('Failed to generate meditation audio.');
        }
      } catch (error) {
        console.error('Error playing music:', error);
        setAudioError('Failed to play meditation audio.');
      }
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (generatedAudio && generatedAudio.gainNode) {
      generatedAudio.gainNode.gain.setValueAtTime(newVolume * 0.05, audioContext.currentTime);
    }
    if (generatedAudio && generatedAudio.gainNodes) {
      generatedAudio.gainNodes.forEach(gainNode => {
        gainNode.gain.setValueAtTime(newVolume * 0.02, audioContext.currentTime);
      });
    }
  };

  const createMeditationAudio = (type, ctx) => {
    try {
      if (type === 'breathing') {
        // Create ocean wave-like sound for breathing meditation
        return createOceanWaves(ctx);
      } else if (type === 'loving_kindness') {
        // Create gentle chimes for loving kindness meditation
        return createChimes(ctx);
      } else {
        // Create meditation bell for mindfulness
        return createMeditationBell(ctx);
      }
    } catch (error) {
      console.error('Audio creation failed:', error);
      return false;
    }
  };

  const createOceanWaves = (audioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create ocean wave effect
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
    oscillator.type = 'sawtooth';
    
    // Add filter for ocean-like sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume * 0.05, audioContext.currentTime);
    
    // Create wave-like modulation
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.setValueAtTime(0.1, audioContext.currentTime);
    lfo.type = 'sine';
    lfoGain.gain.setValueAtTime(20, audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.start();
    lfo.start();
    
    return { oscillator, gainNode, lfo };
  };

  const createChimes = (audioContext) => {
    const oscillators = [];
    const gainNodes = [];
    
    // Create multiple chime tones
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.05, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3 + index * 0.5);
      
      oscillator.start();
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
    
    return { oscillators, gainNodes };
  };

  const createMeditationBell = (audioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create bell-like sound
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Add filter for bell resonance
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(440, audioContext.currentTime);
    filter.Q.setValueAtTime(30, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 4);
    
    oscillator.start();
    
    return { oscillator, gainNode };
  };

  const pauseMusic = () => {
    if (generatedAudio) {
      // For generated audio, we can't easily pause, so we'll just log it
      console.log('Meditation audio paused');
    }
  };

  const stopMusic = () => {
    if (generatedAudio) {
      try {
        // Stop all oscillators in the generated audio
        if (generatedAudio.oscillator) {
          generatedAudio.oscillator.stop();
        }
        if (generatedAudio.oscillators) {
          generatedAudio.oscillators.forEach(osc => osc.stop());
        }
        if (generatedAudio.lfo) {
          generatedAudio.lfo.stop();
        }
        setGeneratedAudio(null);
        console.log('Meditation audio stopped');
      } catch (error) {
        console.error('Error stopping audio:', error);
      }
    }
  };

  const showPreMeditationGuide = () => {
    setShowPreGuide(true);
  };

  const startMeditation = async () => {
    setShowPreGuide(false);
    
    if (withAIGuidance) {
      const guidance = await MeditationEntity.getAIGuidance(selectedType, selectedDuration);
      setCurrentGuidance(guidance);
      setCurrentGuidanceIndex(0);
    }
    
    setTimeLeft(selectedDuration * 60);
    setIsMeditating(true);
    setMoodBefore(5); // Reset mood
    
    // Start music if enabled
    if (withMusic) {
      setTimeout(() => playMusic(), 1000); // Small delay to ensure audio is ready
    }
  };

  const pauseMeditation = () => {
    setIsMeditating(false);
    pauseMusic();
  };

  const resumeMeditation = () => {
    setIsMeditating(true);
    if (withMusic) {
      playMusic();
    }
  };

  const stopMeditation = () => {
    setIsMeditating(false);
    setTimeLeft(0);
    setCurrentGuidanceIndex(0);
    stopMusic();
    setShowSessionForm(true);
  };

  const handleMeditationComplete = () => {
    setIsMeditating(false);
    setTimeLeft(0);
    setCurrentGuidanceIndex(0);
    stopMusic();
    setShowSessionForm(true);
  };

  const saveSession = async () => {
    try {
      await MeditationEntity.create({
        date: format(new Date(), 'yyyy-MM-dd'),
        duration_minutes: selectedDuration,
        type: selectedType,
        with_music: withMusic,
        ai_guidance: withAIGuidance,
        mood_before: moodBefore,
        mood_after: moodAfter,
        notes: notes
      });
      
      setShowSessionForm(false);
      setNotes('');
      setMoodAfter(5);
      loadMeditationData();
    } catch (error) {
      console.error("Error saving meditation session:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWeeklyChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const daySessions = meditationSessions.filter(session => session.date === dateStr);
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration_minutes, 0);
      
      return {
        date: format(date, "MMM dd"),
        minutes: totalMinutes,
        sessions: daySessions.length
      };
    });
    
    return last7Days;
  };

  const getTypeDistribution = () => {
    const typeCounts = {};
    meditationSessions.forEach(session => {
      typeCounts[session.type] = (typeCounts[session.type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => {
      const typeInfo = MEDITATION_TYPES.find(t => t.id === type);
      return {
        name: typeInfo?.name || type,
        value: count,
        color: typeInfo?.color || '#6b7280'
      };
    });
  };

  const weeklyData = getWeeklyChartData();
  const typeData = getTypeDistribution();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Meditation & Mindfulness
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find peace and clarity through guided meditation sessions
          </p>
        </div>

        {/* Active Meditation Session */}
        {isMeditating && (
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Brain className="w-6 h-6" />
                Meditation in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {/* Timer Display */}
                <div className="text-6xl font-mono font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(timeLeft)}
                </div>

                {/* AI Guidance */}
                {withAIGuidance && currentGuidance.length > 0 && (
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 max-w-2xl mx-auto">
                    <p className="text-lg text-gray-700 dark:text-gray-300 italic">
                      "{currentGuidance[currentGuidanceIndex]}"
                    </p>
                    <div className="flex justify-center mt-2">
                      {currentGuidance.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full mx-1 ${
                            index === currentGuidanceIndex ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Music Indicator */}
                {withMusic && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Music className="w-5 h-5" />
                    <span>
                      {audioError ? 'Audio generation failed' : `${MEDITATION_TYPES.find(t => t.id === selectedType)?.musicName} playing`}
                    </span>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={isMeditating ? pauseMeditation : resumeMeditation}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isMeditating ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {isMeditating ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    onClick={stopMeditation}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meditation Setup */}
        {!isMeditating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Start Your Meditation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Meditation Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Choose Meditation Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MEDITATION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[140px] flex flex-col items-center justify-center ${
                          selectedType === type.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <type.icon className={`w-12 h-12 mx-auto mb-3 ${selectedType === type.id ? 'text-purple-600' : 'text-gray-400'}`} />
                        <h3 className="font-medium text-base mb-2">{type.name}</h3>
                        <p className="text-sm text-gray-500 text-center">{type.description}</p>
                        {withMusic && (
                          <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1">
                            <Music className="w-4 h-4" />
                            {type.musicName}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMER_OPTIONS.map((duration) => (
                      <Button
                        key={duration}
                        onClick={() => setSelectedDuration(duration)}
                        variant={selectedDuration === duration ? "default" : "outline"}
                        className={selectedDuration === duration ? "bg-purple-600" : ""}
                      >
                        {duration} min
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={withMusic}
                        onChange={(e) => setWithMusic(e.target.checked)}
                        className="rounded"
                      />
                      <Music className="w-4 h-4 text-green-600" />
                      <span className="text-sm">With calming music</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={withAIGuidance}
                        onChange={(e) => setWithAIGuidance(e.target.checked)}
                        className="rounded"
                      />
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">AI guidance</span>
                    </label>
                  </div>

                  {/* Volume Control */}
                  {withMusic && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Volume2 className="w-4 h-4 text-green-600" />
                        Music Volume: {Math.round(volume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  )}
                </div>

                {/* Start Button */}
                <Button
                  onClick={showPreMeditationGuide}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Meditation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Stats */}
        {weeklyStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Sessions
                  </CardTitle>
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {weeklyStats.totalSessions}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Time
                  </CardTitle>
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor(weeklyStats.totalMinutes / 60)}h {weeklyStats.totalMinutes % 60}m
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avg Session
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(weeklyStats.avgSessionLength)}m
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    With Music
                  </CardTitle>
                  <Music className="w-5 h-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {weeklyStats.sessionsWithMusic}/{weeklyStats.totalSessions}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Meditation Trend</CardTitle>
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
                      formatter={(value, name) => [
                        name === 'minutes' ? `${value} minutes` : `${value} sessions`,
                        name === 'minutes' ? 'Time' : 'Sessions'
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Meditation Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {typeData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} sessions`, 'Count']}
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
                    {typeData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-gray-700 dark:text-gray-300">
                          {entry.name}: {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  <p>No meditation data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pre-Meditation Guide Modal */}
        {showPreGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const type = MEDITATION_TYPES.find(t => t.id === selectedType);
                    const Icon = type?.icon || Brain;
                    return <Icon className="w-6 h-6" style={{ color: type?.color }} />;
                  })()}
                  {MEDITATION_TYPES.find(t => t.id === selectedType)?.name} Meditation Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Music Info */}
                  {withMusic && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-800 dark:text-purple-200">
                          Background Music: {MEDITATION_TYPES.find(t => t.id === selectedType)?.musicName}
                        </span>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Calming music will play throughout your session to enhance relaxation.
                      </p>
                    </div>
                  )}

                  {/* 5-Point Guide */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                      Preparation Guide
                    </h3>
                    <div className="space-y-3">
                      {MEDITATION_TYPES.find(t => t.id === selectedType)?.guide.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Session Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 dark:text-blue-300">Duration:</span>
                        <span className="ml-2 font-medium">{selectedDuration} minutes</span>
                      </div>
                      <div>
                        <span className="text-blue-600 dark:text-blue-300">AI Guidance:</span>
                        <span className="ml-2 font-medium">{withAIGuidance ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreGuide(false)}
                    >
                      Back to Setup
                    </Button>
                    <Button
                      onClick={startMeditation}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Meditation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Session Form Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Session Complete! 🎉</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">How do you feel now? (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodAfter}
                      onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (Stressed)</span>
                      <span>10 (Very Relaxed)</span>
                    </div>
                    <p className="text-center mt-2 font-medium">Current: {moodAfter}/10</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Session Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2 border rounded-md h-20 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="How did this session feel? Any insights?"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={saveSession}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Save Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generated Audio - No external audio element needed */}
      </div>
    </div>
  );
}
