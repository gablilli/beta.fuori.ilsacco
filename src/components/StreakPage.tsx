
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Flame, Trophy, Star } from 'lucide-react';
import { format, subDays, isToday, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

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

export const StreakPage = () => {
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
                Ultimo conferimento: {format(parseISO(stats.lastCollection), 'dd/MM/yyyy', { locale: it })}
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
