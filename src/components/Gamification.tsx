
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Zap, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WasteSchedule } from '@/pages/Index';

interface GamificationProps {
  schedules: WasteSchedule[];
}

interface UserStats {
  totalCollections: number;
  streak: number;
  lastCollection: string;
  achievements: string[];
  level: number;
  points: number;
}

export const Gamification = ({ schedules }: GamificationProps) => {
  const [stats, setStats] = useState<UserStats>({
    totalCollections: 0,
    streak: 0,
    lastCollection: '',
    achievements: [],
    level: 1,
    points: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('user-stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('user-stats', JSON.stringify(stats));
  }, [stats]);

  const markCollectionDone = (collectionType: string) => {
    const today = new Date().toDateString();
    const points = 10;
    
    // Verifica se già fatto oggi
    if (stats.lastCollection === today) {
      toast({
        title: "Già fatto oggi! 🎯",
        description: "Hai già segnato una raccolta per oggi"
      });
      return;
    }

    const newStats = {
      ...stats,
      totalCollections: stats.totalCollections + 1,
      streak: stats.lastCollection === new Date(Date.now() - 86400000).toDateString() 
        ? stats.streak + 1 
        : 1,
      lastCollection: today,
      points: stats.points + points,
      level: Math.floor((stats.points + points) / 100) + 1
    };

    // Verifica achievement
    const newAchievements = [...stats.achievements];
    
    if (newStats.totalCollections === 1 && !newAchievements.includes('first-collection')) {
      newAchievements.push('first-collection');
      toast({
        title: "🏆 Primo Conferimento!",
        description: "Hai segnato la tua prima raccolta!"
      });
    }
    
    if (newStats.streak === 7 && !newAchievements.includes('week-streak')) {
      newAchievements.push('week-streak');
      toast({
        title: "🔥 Una Settimana di Fila!",
        description: "7 giorni consecutivi di raccolta differenziata!"
      });
    }
    
    if (newStats.totalCollections === 50 && !newAchievements.includes('eco-warrior')) {
      newAchievements.push('eco-warrior');
      toast({
        title: "🌱 Guerriero dell'Ambiente!",
        description: "50 raccolte completate!"
      });
    }

    setStats({
      ...newStats,
      achievements: newAchievements
    });

    toast({
      title: `✅ ${collectionType} Conferito!`,
      description: `+${points} punti! Streak: ${newStats.streak} giorni`
    });
  };

  const achievements = [
    {
      id: 'first-collection',
      name: 'Primo Passo',
      description: 'Prima raccolta segnata',
      icon: '🌟',
      unlocked: stats.achievements.includes('first-collection')
    },
    {
      id: 'week-streak',
      name: 'Settimana Verde',
      description: '7 giorni consecutivi',
      icon: '🔥',
      unlocked: stats.achievements.includes('week-streak')
    },
    {
      id: 'eco-warrior',
      name: 'Eco Guerriero', 
      description: '50 raccolte completate',
      icon: '🌱',
      unlocked: stats.achievements.includes('eco-warrior')
    }
  ];

  const levelProgress = (stats.points % 100);
  const nextLevelPoints = 100 - levelProgress;

  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            🎮 Le Tue Statistiche
          </CardTitle>
          <CardDescription>
            Tieni traccia dei tuoi progressi ecologici
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalCollections}</div>
              <div className="text-sm text-gray-600">Raccolte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
              <div className="text-sm text-gray-600">Giorni di fila</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Livello {stats.level}</span>
              <Badge variant="secondary">{stats.points} punti</Badge>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-gray-600">
              {nextLevelPoints} punti al livello successivo
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            🎯 Segna Raccolta
          </CardTitle>
          <CardDescription>
            Guadagna punti segnando le raccolte completate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {schedules.slice(0, 4).map((schedule) => (
              <Button
                key={schedule.id}
                onClick={() => markCollectionDone(schedule.name)}
                variant="outline"
                className="h-12 flex items-center gap-2"
              >
                <span className="text-lg">{schedule.icon}</span>
                <span className="text-xs">{schedule.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            🏆 Obiettivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.name}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <Badge className="bg-yellow-500 text-white">
                    Sbloccato!
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
