# BETA
## ♻️ Fuori il sacco: la nuova webapp per tracciare quando devi portare fuori la spazzatura
Una webapp react per tracciare quando devi portare fuori la spazzatura, con reminder via notifica integrato e Out of the box experience, tutto in uno. 

### Completamente free and opensource, così non ti scordi di portare fuori l'immondizia mentre scrivi codice!

## Versione
**Early Beta 1.2**

## Caratteristiche
- ✅ Promemoria personalizzati con notifiche
- ✅ Sincronizzazione calendario
- ✅ Statistiche e gamification con streak tracking
- ✅ Condivisione familiare
- ✅ Completamente offline-first
- ✅ Self-hostable con Docker
- ✅ Tipi di rifiuto personalizzabili con emoji
- ✅ Tracciamento progressi e obiettivi

## Installazione e Sviluppo

### Requisiti
- Node.js 18+ o Bun
- npm o bun

### Installazione locale
```bash
# Clona il repository
git clone https://github.com/gablilli/beta.fuori.ilsacco.git
cd beta.fuori.ilsacco

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build
```

## Self-Hosting con Docker

### Opzione 1: Docker Compose (Raccomandata)
```bash
# Clona il repository
git clone https://github.com/gablilli/beta.fuori.ilsacco.git
cd beta.fuori.ilsacco

# (Opzionale) Configura le variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue impostazioni

# Avvia con Docker Compose
docker-compose up -d

# L'applicazione sarà accessibile su http://localhost:8080
```

### Opzione 2: Docker manuale
```bash
# Build dell'immagine
docker build -t fuori-il-sacco .

# Avvia il container
docker run -d \
  --name fuori-il-sacco \
  -p 8080:80 \
  --restart unless-stopped \
  fuori-il-sacco

# L'applicazione sarà accessibile su http://localhost:8080
```

### Configurazione Porta
Per cambiare la porta predefinita (8080), modifica il file `.env`:
```
PORT=3000
```

Oppure passa la porta direttamente con Docker:
```bash
docker run -d -p 3000:80 --name fuori-il-sacco fuori-il-sacco
```

### Aggiornamento
```bash
# Con Docker Compose
docker-compose down
git pull
docker-compose up -d --build

# Con Docker manuale
docker stop fuori-il-sacco
docker rm fuori-il-sacco
git pull
docker build -t fuori-il-sacco .
docker run -d -p 8080:80 --name fuori-il-sacco fuori-il-sacco
```

## Utilizzo

1. **Primo avvio**: L'onboarding guidato ti aiuterà a configurare i tuoi primi calendari di raccolta
2. **Aggiungi raccolte**: Usa il pulsante "+" per aggiungere nuovi tipi di rifiuto (predefiniti o personalizzati)
3. **Personalizza emoji**: Vai su Impostazioni per personalizzare le emoji di ogni tipo di rifiuto
4. **Traccia progressi**: Segna i conferimenti completati per accumulare punti e mantenere la tua streak
5. **Visualizza statistiche**: Controlla la tua streak, obiettivi e cronologia nella sezione dedicata

## Tecnologie utilizzate
- React 18
- TypeScript
- Vite
- TailwindCSS
- Radix UI
- Supabase (opzionale, per sincronizzazione cloud)
- Service Worker per notifiche e PWA

## Licenza
Free and Open Source

## Contributi
Contributi, issue e feature requests sono benvenuti!
