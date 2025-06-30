
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

interface EmojiCustomizerProps {
  schedules: any[];
  onUpdateSchedule: (id: string, updates: { icon: string }) => void;
}

const suggestedEmojis = {
  organic: ['🍌', '🥕', '🥬', '🍎', '🥔', '🌽'],
  plastic: ['🍶', '🥤', '♻️', '🧴', '📦', '🛍️'],
  paper: ['📄', '📰', '📋', '📚', '📦', '🗞️'],
  glass: ['🫙', '🍷', '🍺', '🥃', '🫗', '⚗️'],
  mixed: ['🗑️', '🚮', '♻️', '🏠', '🔄', '⚫']
};

export const EmojiCustomizer = ({ schedules, onUpdateSchedule }: EmojiCustomizerProps) => {
  const [customEmojis, setCustomEmojis] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const handleEmojiChange = (scheduleId: string, emoji: string) => {
    // Valida che sia effettivamente un'emoji
    if (emoji && emoji.length <= 4) {
      onUpdateSchedule(scheduleId, { icon: emoji });
      toast({
        title: "Emoji aggiornata! 🎨",
        description: `Nuova icona: ${emoji}`,
      });
      setCustomEmojis(prev => ({ ...prev, [scheduleId]: '' }));
    }
  };

  const handleCustomEmojiSubmit = (scheduleId: string) => {
    const emoji = customEmojis[scheduleId];
    if (emoji) {
      handleEmojiChange(scheduleId, emoji);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎨 Personalizza Emoji</CardTitle>
          <CardDescription>
            Scegli le emoji per ogni tipo di raccolta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${schedule.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {schedule.icon}
                </div>
                <div>
                  <h4 className="font-medium">{schedule.name}</h4>
                  <p className="text-sm text-gray-500">
                    Giorni: {schedule.days.map((d: number) => 
                      ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][d]
                    ).join(', ')}
                  </p>
                </div>
              </div>

              {/* Emoji suggerite */}
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Emoji suggerite</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedEmojis[schedule.type as keyof typeof suggestedEmojis]?.map((emoji, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-lg"
                      onClick={() => handleEmojiChange(schedule.id, emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Emoji personalizzata */}
              <div className="flex gap-2">
                <Input
                  placeholder="Inserisci emoji personalizzata"
                  value={customEmojis[schedule.id] || ''}
                  onChange={(e) => setCustomEmojis(prev => ({ ...prev, [schedule.id]: e.target.value }))}
                  className="flex-1"
                  maxLength={4}
                />
                <Button
                  onClick={() => handleCustomEmojiSubmit(schedule.id)}
                  disabled={!customEmojis[schedule.id]}
                  size="sm"
                >
                  Applica
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
