import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from './settings/ProfileSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { EmailPreferences } from './settings/EmailPreferences';
import { LoginHistory } from './settings/LoginHistory';
import { DangerZone } from './settings/DangerZone';
import { EmailNotificationManager } from './EmailNotificationManager';
import { User, Shield, Mail, History, AlertTriangle, Inbox } from 'lucide-react';


export function AccountSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Danger</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <ProfileSettings />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div>
            <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
            <SecuritySettings />
          </div>
        </TabsContent>

        <TabsContent value="email">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Email Preferences</h2>
            <EmailPreferences />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <EmailNotificationManager />
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Login History</h2>
            <LoginHistory />
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}

