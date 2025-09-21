
import React, { useState, useEffect, useCallback } from "react";
import { NutritionLog } from "@/entities/all";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Apple, 
  Camera, 
  Plus, 
  Target,
  Sparkles,
  Flame,
  Utensils
} from "lucide-react";
import { format } from "date-fns";

export default function Nutrition() {
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState(null);

  // Food Upload States
  const [file, setFile] = useState(null);
  const [mealType, setMealType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Manual Entry States
  const [manualForm, setManualForm] = useState({
    meal_type: "",
    food_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const loadNutritionLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await NutritionLog.list("-created_date", 100);
      setNutritionLogs(logs);
    } catch (error) {
      console.error("Error loading nutrition logs:", error);
    }
    setIsLoading(false);
  };

  const generateDailySuggestions = useCallback(async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const todaysLogs = nutritionLogs.filter(log => log.date === today);
      
      const totalCalories = todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const totalProtein = todaysLogs.reduce((sum, log) => sum + (log.protein || 0), 0);

      const response = await InvokeLLM({
        prompt: `Based on today's nutrition intake (${totalCalories} calories, ${totalProtein}g protein), provide wellness tips and food suggestions for mental health and happiness.`,
        response_json_schema: {
          type: "object",
          properties: {
            mood_boosting_foods: {
              type: "array",
              items: { type: "string" }
            },
            wellness_tips: {
              type: "array", 
              items: { type: "string" }
            },
            daily_message: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  }, [nutritionLogs]);

  useEffect(() => {
    loadNutritionLogs();
  }, []);

  useEffect(() => {
    if (nutritionLogs.length > 0) {
      generateDailySuggestions();
    }
  }, [nutritionLogs, generateDailySuggestions]);

  const handleFoodAnalyzed = async (foodData) => {
    try {
      await NutritionLog.create({
        ...foodData,
        date: format(new Date(), "yyyy-MM-dd")
      });
      loadNutritionLogs();
      // generateDailySuggestions() is now handled by useEffect when nutritionLogs update
    } catch (error) {
      console.error("Error saving food log:", error);
    }
  };

  const analyzeFood = async () => {
    if (!file || !mealType) {
      alert("Please select a file and meal type.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { file_url } = await UploadFile({ file });
      const analysis = await InvokeLLM({
        prompt: `Analyze this food image and provide nutritional information. Estimate calories, protein, carbs, and fat.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            food_name: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" }
          }
        }
      });

      setAnalysisResult({
        ...analysis,
        meal_type: mealType,
        image_url: file_url
      });

    } catch (error) {
      console.error("Error analyzing food:", error);
      alert("Error analyzing food. Please try again.");
    }
    setIsAnalyzing(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleFoodAnalyzed({
      ...manualForm,
      calories: parseFloat(manualForm.calories) || 0,
      protein: parseFloat(manualForm.protein) || 0,
      carbs: parseFloat(manualForm.carbs) || 0,
      fat: parseFloat(manualForm.fat) || 0,
    });
    setManualForm({
      meal_type: "",
      food_name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  const getTodaysStats = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todaysLogs = nutritionLogs.filter(log => log.date === today);
    
    return {
      totalCalories: todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
      totalProtein: todaysLogs.reduce((sum, log) => sum + (log.protein || 0), 0),
      mealCount: todaysLogs.length
    };
  };

  const todaysStats = getTodaysStats();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Nutrition Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track your meals with AI-powered food recognition and get personalized wellness tips
          </p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Calories
                </CardTitle>
                <Flame className="w-4 h-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todaysStats.totalCalories}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">kcal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Protein
                </CardTitle>
                <Target className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(todaysStats.totalProtein)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">g</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meals
                </CardTitle>
                <Utensils className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {todaysStats.mealCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Goal
                </CardTitle>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round((todaysStats.totalCalories / 2000) * 100)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">of 2000</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="upload">
                      <Camera className="w-4 h-4 mr-2" />
                      Photo Upload
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Entry
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      History
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="p-6">
                    {!analysisResult ? (
                      <div className="space-y-4 max-w-lg mx-auto">
                        <div className="text-center">
                          <h3 className="text-xl font-semibold mb-2">Upload Food Photo</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            AI-powered nutrition analysis from your food photos
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Meal Type</Label>
                            <Select value={mealType} onValueChange={setMealType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meal type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                                <SelectItem value="lunch">☀️ Lunch</SelectItem>
                                <SelectItem value="dinner">🌙 Dinner</SelectItem>
                                <SelectItem value="snack">🍎 Snack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Upload Photo</Label>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => setFile(e.target.files[0])}
                            />
                          </div>
                          
                          <Button 
                            onClick={analyzeFood} 
                            disabled={!file || !mealType || isAnalyzing}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                          >
                            {isAnalyzing ? "Analyzing..." : "Analyze My Meal"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">AI Analysis Result</h3>
                        <img src={analysisResult.image_url} alt={analysisResult.food_name} className="rounded-lg w-full max-h-60 object-contain bg-gray-100" />
                        <h4 className="text-lg font-semibold">{analysisResult.food_name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <p><strong>Calories:</strong> {Math.round(analysisResult.calories)}</p>
                          <p><strong>Protein:</strong> {Math.round(analysisResult.protein)}g</p>
                          <p><strong>Carbs:</strong> {Math.round(analysisResult.carbs)}g</p>
                          <p><strong>Fat:</strong> {Math.round(analysisResult.fat)}g</p>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => {setAnalysisResult(null); setFile(null); setMealType("");}}>
                            Discard
                          </Button>
                          <Button onClick={() => {handleFoodAnalyzed(analysisResult); setAnalysisResult(null); setFile(null); setMealType("");}}>
                            Save Log
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="manual" className="p-6">
                    <div className="space-y-4 max-w-lg mx-auto">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">Manual Food Entry</h3>
                      </div>
                      <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Meal Type</Label>
                            <Select value={manualForm.meal_type} onValueChange={(value) => setManualForm({...manualForm, meal_type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select meal" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                                <SelectItem value="lunch">☀️ Lunch</SelectItem>
                                <SelectItem value="dinner">🌙 Dinner</SelectItem>
                                <SelectItem value="snack">🍎 Snack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Food Name</Label>
                            <Input value={manualForm.food_name} onChange={(e) => setManualForm({...manualForm, food_name: e.target.value})} required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Calories</Label>
                            <Input type="number" value={manualForm.calories} onChange={(e) => setManualForm({...manualForm, calories: e.target.value})} />
                          </div>
                          <div>
                            <Label>Protein (g)</Label>
                            <Input type="number" value={manualForm.protein} onChange={(e) => setManualForm({...manualForm, protein: e.target.value})} />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          <Plus className="w-4 h-4 mr-2" /> Add Food Log
                        </Button>
                      </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="p-6">
                    <div className="space-y-4">
                      {nutritionLogs.length > 0 ? (
                        nutritionLogs.slice(0, 10).map(log => (
                          <Card key={log.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{log.food_name}</p>
                                  <p className="text-sm text-gray-500 capitalize">{log.meal_type} • {format(new Date(log.date), "MMM dd")}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">{Math.round(log.calories)} kcal</p>
                                  <p className="text-xs text-gray-500">P:{Math.round(log.protein)}g</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Utensils className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                          <h3 className="font-semibold">No nutrition logs yet</h3>
                          <p className="text-sm text-gray-500">Start logging your meals to see your history.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Wellness Suggestions */}
            {suggestions && (
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Wellness Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{suggestions.daily_message}"
                  </p>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">
                      🌟 Mood-Boosting Foods:
                    </h4>
                    <div className="space-y-1">
                      {suggestions.mood_boosting_foods?.slice(0, 3).map((food, index) => (
                        <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                          • {food}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
