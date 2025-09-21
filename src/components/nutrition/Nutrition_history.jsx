import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Apple, Utensils, Flame } from "lucide-react";

export default function NutritionHistory({ logs, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Utensils className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <h3 className="font-semibold">No nutrition logs yet</h3>
        <p className="text-sm text-gray-500">Start logging your meals to see your history.</p>
      </div>
    );
  }
  
  const groupedLogs = logs.reduce((acc, log) => {
    const date = format(parseISO(log.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      {Object.entries(groupedLogs).map(([date, dailyLogs]) => (
        <div key={date}>
          <h3 className="font-semibold mb-2">{format(parseISO(date), 'EEEE, MMMM d')}</h3>
          <div className="space-y-3">
            {dailyLogs.map(log => (
              <Card key={log.id} className="bg-gray-50 dark:bg-gray-800">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {log.image_url ? (
                        <img src={log.image_url} alt={log.food_name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 flex items-center justify-center rounded-lg">
                          <Apple className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{log.food_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{log.meal_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold flex items-center gap-1 justify-end">
                        <Flame className="w-3 h-3 text-red-500" />
                        {Math.round(log.calories)} kcal
                      </p>
                      <p className="text-xs text-gray-500">
                        P:{Math.round(log.protein)}g C:{Math.round(log.carbs)}g F:{Math.round(log.fat)}g
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}