import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cloud, CloudRain, Sun, Wind, Thermometer, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  city: string;
}

export const ImprovedWeatherWidget = () => {
  const [weatherTip, setWeatherTip] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const { toast } = useToast();

  const generateWeatherTip = (condition: string, temperature: number) => {
    let tip = '';
    switch (condition.toLowerCase()) {
      case 'rain':
        tip = '🌧️ Piove! Meglio rimandare la carta per evitare che si bagni.';
        break;
      case 'wind':
        tip = '💨 Vento forte! Assicurati che i sacchi siano ben chiusi.';
        break;
      case 'clear':
        if (temperature > 25) {
          tip = '☀️ Giornata calda! L\'umido si rovina velocemente, portalo fuori all\'ultimo.';
        } else {
          tip = '☀️ Bella giornata! Perfetta per portare fuori tutto.';
        }
        break;
      case 'clouds':
        tip = '⛅ Giornata nuvolosa, condizioni perfette per la spazzatura.';
        break;
      default:
        tip = '🌡️ Controlla sempre il meteo prima di uscire con i sacchi!';
    }
    return tip;
  };

  const checkWeatherCache = async (city: string) => {
    try {
      const { data, error } = await supabase
        .from('weather_cache')
        .select('*')
        .eq('city', city.toLowerCase())
        .gt('expires_at', new Date().toISOString())
        .order('cached_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Errore cache meteo:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Errore controllo cache:', error);
      return null;
    }
  };

  const saveWeatherCache = async (weatherData: WeatherData) => {
    try {
      const { error } = await supabase
        .from('weather_cache')
        .insert({
          city: weatherData.city.toLowerCase(),
          temperature: weatherData.temperature,
          condition: weatherData.condition,
          description: weatherData.description
        });

      if (error) {
        console.error('Errore salvataggio cache:', error);
      }
    } catch (error) {
      console.error('Errore salvataggio cache:', error);
    }
  };

  const fetchWeatherFromAPI = async (city?: string) => {
    const API_KEY = '6983dc39d9fb1dae0e3acb394c03f8d9';
    let url = '';
    
    try {
      if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=it`;
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });
        
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${API_KEY}&units=metric&lang=it`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
        city: data.name || city || 'La tua posizione'
      };

      return weatherData;
    } catch (error) {
      console.error('Errore API meteo:', error);
      throw error;
    }
  };

  const fetchWeather = async (city?: string) => {
    setLoading(true);
    try {
      const cityToCheck = city || 'auto-location';
      
      // Prima controlla la cache
      const cachedWeather = await checkWeatherCache(cityToCheck);
      
      if (cachedWeather) {
        const weatherData: WeatherData = {
          temperature: cachedWeather.temperature,
          condition: cachedWeather.condition,
          description: cachedWeather.description,
          city: cachedWeather.city
        };
        
        setWeatherData(weatherData);
        setWeatherTip(generateWeatherTip(weatherData.condition, weatherData.temperature));
        
        toast({
          title: "🌤️ Meteo Aggiornato",
          description: `Dati per ${weatherData.city} (dalla cache)`
        });
        
        setLoading(false);
        return;
      }

      // Se non c'è cache, chiama l'API
      const weatherData = await fetchWeatherFromAPI(city);
      
      // Salva in cache
      await saveWeatherCache(weatherData);
      
      setWeatherData(weatherData);
      setWeatherTip(generateWeatherTip(weatherData.condition, weatherData.temperature));
      
      toast({
        title: "🌤️ Meteo Aggiornato",
        description: `Dati aggiornati per ${weatherData.city}`
      });
      
    } catch (error) {
      console.error('Errore meteo:', error);
      
      // Fallback con dati di esempio
      const mockData: WeatherData = {
        temperature: 20,
        condition: 'clear',
        description: 'Sereno (dati di esempio)',
        city: 'Milano'
      };
      
      setWeatherData(mockData);
      setWeatherTip(generateWeatherTip(mockData.condition, mockData.temperature));
      
      toast({
        title: "⚠️ Meteo Non Disponibile",
        description: "Usando dati di esempio. Controlla la connessione.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'clouds': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'wind': return <Wind className="h-6 w-6 text-green-500" />;
      default: return <Thermometer className="h-6 w-6 text-orange-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return 'Soleggiato';
      case 'rain': return 'Piovoso';
      case 'clouds': return 'Nuvoloso';
      case 'wind': return 'Ventoso';
      default: return 'Variabile';
    }
  };

  const getWeatherAdvice = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
        return 'Non portare fuori la carta oggi!';
      case 'wind':
        return 'Usa sacchi pesanti per il vento';
      case 'clear':
        return 'Perfetto per ogni tipo di spazzatura';
      default:
        return 'Controlla prima di uscire';
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {weatherData ? getWeatherIcon(weatherData.condition) : <Thermometer className="h-6 w-6" />}
          🌤️ Meteo & Consigli
        </CardTitle>
        <CardDescription>
          Consigli per portare fuori la spazzatura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {weatherData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getConditionText(weatherData.condition)}
              </Badge>
              <Badge variant="outline">
                {weatherData.temperature}°C
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <MapPin className="h-3 w-3" />
              {weatherData.city}
            </div>
          </div>
        )}
        
        {weatherTip && (
          <div className="bg-white/80 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-medium">
              {weatherTip}
            </p>
          </div>
        )}

        {weatherData && (
          <div className="bg-blue-100/50 p-2 rounded text-center">
            <p className="text-xs font-semibold text-blue-700">
              💡 {getWeatherAdvice(weatherData.condition)}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs">Cambia città:</Label>
          <div className="flex gap-2">
            <Input
              id="city"
              placeholder="Milano, Roma, Napoli..."
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="text-sm"
            />
            <Button 
              onClick={() => customCity ? fetchWeather(customCity) : fetchWeather()}
              disabled={loading}
              size="sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-blue-600 italic">
          💾 I dati meteo vengono salvati per 30 minuti
        </div>
      </CardContent>
    </Card>
  );
};