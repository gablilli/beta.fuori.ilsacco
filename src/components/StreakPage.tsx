
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Flame, Trophy, Star, Target, Award, Zap } from 'lucide-react';
import { format, subDays, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { WasteSchedule } from '@/pages/Index';

interface UserStats {
  totalCollections: number;
  streak: number;
  lastCollection: string;
  achievements: string[];
  level: number;
  points: number;
}

interface CollectionHistory {
  date: string;
  count: number;
  types: string[];
}

interface StreakPageProps {
  schedules?: WasteSchedule[];
}

export const StreakPage = ({ schedules = [] }: StreakPageProps) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    totalCollections: 0,
    streak: 0,
    lastCollection: '',
    achievements: [],
    level: 1,
    points: 0
  });

  const [history, setHistory] = useState<CollectionHistory[]>([]);

  useEffect(() => {
    const savedStats = localStorage.getItem('user-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    const savedHistory = localStorage.getItem('collection-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generate last 30 days for visualization
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayHistory = history.find(h => h.date === dateString);
    
    return {
      date: date,
      dateString: dateString,
      hasCollection: !!dayHistory,
      count: dayHistory?.count || 0,
      isToday: isToday(date)
    };
  });

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '⭐';
  };

  const getBestStreak = (): number => {
    const savedBestStreak = localStorage.getItem('best-streak');
    return savedBestStreak ? parseInt(savedBestStreak, 10) : stats.streak;
  };

  const bestStreak = Math.max(getBestStreak(), stats.streak);

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

    localStorage.setItem('user-stats', JSON.stringify({
      ...newStats,
      achievements: newAchievements
    }));

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
      {/* Current Streak Card */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            🔥 Streak Corrente
          </CardTitle>
          <CardDescription>
            La tua serie di conferimenti consecutivi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-orange-600">
              {stats.streak}
            </div>
            <div className="text-2xl">
              {getStreakEmoji(stats.streak)}
            </div>
            <div className="text-sm text-gray-600">
              {stats.streak === 1 ? 'giorno di fila' : 'giorni di fila'}
            </div>
            {stats.lastCollection && (
              <div className="text-xs text-gray-500 mt-2">
                Ultimo conferimento: {format(new Date(stats.lastCollection), 'dd/MM/yyyy', { locale: it })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{bestStreak}</div>
            <div className="text-xs text-gray-600">giorni di fila</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalCollections}</div>
            <div className="text-xs text-gray-600">conferimenti</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            📅 Ultimi 30 Giorni
          </CardTitle>
          <CardDescription>
            Visualizzazione grafica dei tuoi conferimenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1">
            {last30Days.map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded flex items-center justify-center text-xs ${
                  day.hasCollection
                    ? 'bg-green-500 text-white font-bold'
                    : day.isToday
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-100'
                }`}
                title={`${format(day.date, 'dd/MM/yyyy', { locale: it })}${
                  day.hasCollection ? ` - ${day.count} conferimento/i` : ''
                }`}
              >
                {day.isToday && !day.hasCollection && '●'}
                {day.hasCollection && day.count}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Conferito</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-100 border-2 border-blue-500"></div>
                <span>Oggi</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-100"></div>
                <span>Nessuno</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level and Points Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            🎮 Livello & Punti
          </CardTitle>
          <CardDescription>
            Il tuo progresso nel gioco
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Mark Collection Section */}
      {schedules.length > 0 && (
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
      )}

      {/* Achievements Card */}
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

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            🎯 Prossimi Obiettivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.streak < 7 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium">Una Settimana! 🔥</div>
                  <div className="text-sm text-gray-600">
                    {7 - stats.streak} {7 - stats.streak === 1 ? 'giorno' : 'giorni'} per l'obiettivo
                  </div>
                </div>
                <Badge variant="secondary">{stats.streak}/7</Badge>
              </div>
            )}
            
            {stats.streak >= 7 && stats.streak < 30 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium">Un Mese! 🔥🔥</div>
                  <div className="text-sm text-gray-600">
                    {30 - stats.streak} {30 - stats.streak === 1 ? 'giorno' : 'giorni'} per l'obiettivo
                  </div>
                </div>
                <Badge variant="secondary">{stats.streak}/30</Badge>
              </div>
            )}
            
            {stats.totalCollections < 50 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium">50 Conferimenti! 🌱</div>
                  <div className="text-sm text-gray-600">
                    {50 - stats.totalCollections} per l'obiettivo
                  </div>
                </div>
                <Badge variant="secondary">{stats.totalCollections}/50</Badge>
              </div>
            )}
            
            {stats.totalCollections >= 50 && stats.totalCollections < 100 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium">100 Conferimenti! 🏆</div>
                  <div className="text-sm text-gray-600">
                    {100 - stats.totalCollections} per l'obiettivo
                  </div>
                </div>
                <Badge variant="secondary">{stats.totalCollections}/100</Badge>
              </div>
            )}

            {stats.streak >= 30 && stats.totalCollections >= 100 && (
              <div className="flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="font-bold text-yellow-700">Sei un Campione!</div>
                  <div className="text-sm text-gray-600">
                    Continua così e salva il pianeta!
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
