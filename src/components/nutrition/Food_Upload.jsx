
import React, { useState } from "react";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Loader2, Sparkles, X, Check } from "lucide-react";

export default function FoodUpload({ onFoodAnalyzed }) {
  const [file, setFile] = useState(null);
  const [mealType, setMealType] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisResult(null);
    }
  };

  const analyzeFood = async () => {
    if (!file || !mealType) {
      alert("Please select a file and a meal type.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { file_url } = await UploadFile({ file });
      const analysis = await InvokeLLM({
        prompt: `Analyze this food image and provide detailed nutritional information. Estimate the food items, serving sizes, and nutritional breakdown (calories, protein, carbs, fat). Provide realistic estimates.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            food_name: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            confidence: { type: "string", enum: ["high", "medium", "low"] }
          }
        }
      });

      setAnalysisResult({
        ...analysis,
        meal_type: mealType,
        image_url: file_url,
        notes: `AI analysis - ${analysis.confidence} confidence`
      });

    } catch (error) {
      console.error("Error analyzing food:", error);
      alert("Error analyzing food. Please try again or enter manually.");
    }
    setIsAnalyzing(false);
  };

  const saveFood = () => {
    onFoodAnalyzed(analysisResult);
    resetForm();
  };

  const resetForm = () => {
    setFile(null);
    setMealType("");
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {!analysisResult ? (
        <>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Upload Food Photo</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Take or upload a photo of your meal for AI-powered nutrition analysis.
            </p>
          </div>

          <div className="space-y-4 max-w-lg mx-auto">
            <div className="space-y-2">
              <Label>1. Select Meal Type</Label>
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
            
            <div className="space-y-2">
              <Label>2. Upload Photo</Label>
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                {file ? (
                  <p className="text-green-600">{file.name}</p>
                ) : (
                  <p className="text-gray-500">Click to upload an image</p>
                )}
              </div>
              <Input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
            </div>
            
            <Button 
              onClick={analyzeFood} 
              disabled={!file || !mealType || isAnalyzing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Analyze My Meal
            </Button>
          </div>
        </>
      ) : (
        <Card className="bg-white/80 dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle>AI Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src={analysisResult.image_url} alt={analysisResult.food_name} className="rounded-lg w-full max-h-60 object-cover" />
            <h3 className="text-lg font-semibold">{analysisResult.food_name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Calories:</strong> {Math.round(analysisResult.calories)} kcal</p>
              <p><strong>Protein:</strong> {Math.round(analysisResult.protein)} g</p>
              <p><strong>Carbs:</strong> {Math.round(analysisResult.carbs)} g</p>
              <p><strong>Fat:</strong> {Math.round(analysisResult.fat)} g</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={resetForm}><X className="w-4 h-4 mr-2" /> Discard</Button>
              <Button onClick={saveFood} className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-2" /> Save Log</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
