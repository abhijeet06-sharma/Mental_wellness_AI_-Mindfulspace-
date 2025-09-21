import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function ManualFoodEntry({ onFoodAdded }) {
  const [formData, setFormData] = useState({
    meal_type: "",
    food_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onFoodAdded({
      ...formData,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
    });
    setFormData({
      meal_type: "",
      food_name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Add Manual Food Log</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the nutritional information for your meal manually.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={formData.meal_type} onValueChange={(value) => handleInputChange('meal_type', value)}>
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
          <div className="space-y-2">
            <Label htmlFor="food_name">Food Name</Label>
            <Input id="food_name" value={formData.food_name} onChange={(e) => handleInputChange('food_name', e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Calories (kcal)</Label>
            <Input id="calories" type="number" value={formData.calories} onChange={(e) => handleInputChange('calories', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input id="protein" type="number" value={formData.protein} onChange={(e) => handleInputChange('protein', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input id="carbs" type="number" value={formData.carbs} onChange={(e) => handleInputChange('carbs', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input id="fat" type="number" value={formData.fat} onChange={(e) => handleInputChange('fat', e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600">
          <Plus className="w-4 h-4 mr-2" /> Add Food Log
        </Button>
      </form>
    </div>
  );
}