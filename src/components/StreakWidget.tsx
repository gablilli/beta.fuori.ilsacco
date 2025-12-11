import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, ArrowRight } from 'lucide-react';

interface UserStats {
  totalCollections: number;
  streak: number;
  lastCollection: string;
  achievements: string[];
  level: number;
  points: number;
}

interface StreakWidgetProps {
  onNavigateToStreak?: () => void;
}

export const StreakWidget = ({ onNavigateToStreak }: StreakWidgetProps) => {
  const [stats, setStats] = useState<UserStats>({
    totalCollections: 0,
    streak: 0,
    lastCollection: '',
    achievements: [],
    level: 1,
    points: 0
  });

  useEffect(() => {
    const savedStats = localStorage.getItem('user-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '⭐';
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          🔥 La Tua Streak
        </CardTitle>
        <CardDescription>
          Giorni di fila consecutivi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-orange-600">
            {stats.streak}
          </div>
          <div className="text-2xl">
            {getStreakEmoji(stats.streak)}
          </div>
          <div className="text-sm text-gray-600">
            {stats.streak === 1 ? 'giorno di fila' : 'giorni di fila'}
          </div>
        </div>
        
        <Button 
          onClick={onNavigateToStreak}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          Vedi Dettagli
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
