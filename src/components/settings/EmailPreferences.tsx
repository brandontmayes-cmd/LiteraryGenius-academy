import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell, MessageSquare, Award } from 'lucide-react';

export function EmailPreferences() {
  const [prefs, setPrefs] = useState({
    assignments: true,
    grades: true,
    messages: true,
    achievements: true,
    weekly_summary: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPrefs({
        assignments: data.assignments ?? true,
        grades: data.grades ?? true,
        messages: data.messages ?? true,
        achievements: data.achievements ?? true,
        weekly_summary: data.weekly_summary ?? true,
      });
    }
  }

  async function updatePreference(key: string, value: boolean) {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user?.id, ...newPrefs });

    if (error) {
      toast({ title: 'Failed to update preferences', variant: 'destructive' });
    } else {
      toast({ title: 'Preferences updated' });
    }
  }

  const preferences = [
    { key: 'assignments', label: 'Assignment Updates', icon: Bell, description: 'New assignments and due date reminders' },
    { key: 'grades', label: 'Grade Notifications', icon: Award, description: 'When grades are posted' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, description: 'Direct messages from teachers' },
    { key: 'achievements', label: 'Achievements', icon: Award, description: 'Badges and milestones' },
    { key: 'weekly_summary', label: 'Weekly Summary', icon: Mail, description: 'Weekly progress reports' },
  ];

  return (
    <div className="space-y-4">
      {preferences.map(({ key, label, icon: Icon, description }) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              id={key}
              checked={prefs[key as keyof typeof prefs]}
              onCheckedChange={(checked) => updatePreference(key, checked)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
