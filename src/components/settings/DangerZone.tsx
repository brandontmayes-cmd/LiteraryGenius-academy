import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DangerZone() {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleDeleteAccount() {
    if (confirmation !== 'DELETE') {
      toast({ title: 'Please type DELETE to confirm', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Delete user data
    await supabase.from('user_profiles').delete().eq('id', user?.id);
    await supabase.from('students').delete().eq('user_id', user?.id);
    await supabase.from('notifications').delete().eq('user_id', user?.id);
    
    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(user?.id || '');

    if (error) {
      toast({ title: 'Failed to delete account', variant: 'destructive' });
      setLoading(false);
    } else {
      toast({ title: 'Account deleted successfully' });
      await supabase.auth.signOut();
      navigate('/');
    }
  }

  return (
    <Card className="border-destructive p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Once you delete your account, there is no going back. Please be certain.
          </p>
        </div>
      </div>
      <Button variant="destructive" onClick={() => setShowDialog(true)}>
        Delete Account
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="confirm">Type DELETE to confirm</Label>
            <Input
              id="confirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmation('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loading || confirmation !== 'DELETE'}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
