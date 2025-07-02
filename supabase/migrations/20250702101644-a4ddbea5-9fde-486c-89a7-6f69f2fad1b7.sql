
-- Tabella per i calendari condivisi
CREATE TABLE public.shared_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per i singoli schedule condivisi
CREATE TABLE public.shared_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES public.shared_calendars(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  days INTEGER[] NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per i dati meteo cached
CREATE TABLE public.weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  temperature INTEGER NOT NULL,
  condition TEXT NOT NULL,
  description TEXT NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes')
);

-- Tabella profili utente (opzionale)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  skip_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.shared_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy per shared_calendars
CREATE POLICY "Users can view and create shared calendars" ON public.shared_calendars
  FOR ALL USING (auth.uid() = owner_id OR auth.uid() IS NULL);

-- Policy per shared_schedules  
CREATE POLICY "Anyone can view shared schedules" ON public.shared_schedules
  FOR SELECT USING (true);

CREATE POLICY "Calendar owners can manage schedules" ON public.shared_schedules
  FOR ALL USING (
    calendar_id IN (
      SELECT id FROM public.shared_calendars 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy per weather_cache
CREATE POLICY "Anyone can access weather cache" ON public.weather_cache
  FOR ALL USING (true);

-- Policy per profiles
CREATE POLICY "Users can view and update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Function per creare profilo automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, skip_onboarding)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare profilo automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index per performance
CREATE INDEX idx_shared_calendars_share_code ON public.shared_calendars(share_code);
CREATE INDEX idx_weather_cache_city ON public.weather_cache(city);
CREATE INDEX idx_weather_cache_expires ON public.weather_cache(expires_at);
