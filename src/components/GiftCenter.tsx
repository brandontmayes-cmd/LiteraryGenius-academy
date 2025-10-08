import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Send, Users, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GiftTransaction {
  id: string;
  senderName: string;
  recipientName: string;
  itemName: string;
  message: string;
  sentAt: string;
  isClaimed: boolean;
}

interface Classmate {
  id: string;
  name: string;
  avatar: string;
  level: number;
}

export const GiftCenter: React.FC = () => {
  const { user } = useAuth();
  const [sentGifts, setSentGifts] = useState<GiftTransaction[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftTransaction[]>([]);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGiftData();
      loadClassmates();
    }
  }, [user]);

  const loadGiftData = async () => {
    try {
      // Mock data - in real implementation would fetch from Supabase
      setSentGifts([
        {
          id: '1',
          senderName: 'You',
          recipientName: 'Alice Johnson',
          itemName: 'Wizard Avatar',
          message: 'Great job on your math test!',
          sentAt: '2024-01-15',
          isClaimed: true
        },
        {
          id: '2',
          senderName: 'You',
          recipientName: 'Bob Smith',
          itemName: 'Focus Timer Pro',
          message: 'This will help with your studies!',
          sentAt: '2024-01-14',
          isClaimed: false
        }
      ]);

      setReceivedGifts([
        {
          id: '3',
          senderName: 'Emma Wilson',
          recipientName: 'You',
          itemName: 'Dark Mode Theme',
          message: 'Thanks for helping me with chemistry!',
          sentAt: '2024-01-13',
          isClaimed: false
        },
        {
          id: '4',
          senderName: 'Mike Davis',
          recipientName: 'You',
          itemName: 'Double XP Boost',
          message: 'You earned this!',
          sentAt: '2024-01-12',
          isClaimed: true
        }
      ]);
    } catch (error) {
      console.error('Error loading gift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassmates = async () => {
    try {
      // Mock classmates data
      setClassmates([
        { id: '1', name: 'Alice Johnson', avatar: '👩‍🎓', level: 12 },
        { id: '2', name: 'Bob Smith', avatar: '👨‍🎓', level: 8 },
        { id: '3', name: 'Emma Wilson', avatar: '👩‍🔬', level: 15 },
        { id: '4', name: 'Mike Davis', avatar: '👨‍💻', level: 10 },
        { id: '5', name: 'Sarah Chen', avatar: '👩‍🎨', level: 14 }
      ]);
    } catch (error) {
      console.error('Error loading classmates:', error);
    }
  };

  const sendGift = async (itemId: string) => {
    if (!selectedRecipient) return;

    try {
      const { data } = await supabase.functions.invoke('virtual-store-engine', {
        body: {
          action: 'send_gift',
          data: {
            senderId: user?.id,
            recipientId: selectedRecipient,
            itemId,
            message: giftMessage
          }
        }
      });

      if (data?.success) {
        setGiftMessage('');
        setSelectedRecipient('');
        loadGiftData();
      }
    } catch (error) {
      console.error('Error sending gift:', error);
    }
  };

  const claimGift = async (giftId: string) => {
    try {
      const { data } = await supabase.functions.invoke('virtual-store-engine', {
        body: {
          action: 'claim_gift',
          data: { giftId, studentId: user?.id }
        }
      });

      if (data?.success) {
        loadGiftData();
      }
    } catch (error) {
      console.error('Error claiming gift:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading gifts...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Gift className="w-8 h-8 text-purple-500" />
          Gift Center
        </h1>
        <p className="text-gray-600">Share rewards with your classmates and celebrate achievements together!</p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received">Received Gifts</TabsTrigger>
          <TabsTrigger value="sent">Sent Gifts</TabsTrigger>
          <TabsTrigger value="send">Send Gift</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          <div className="space-y-4">
            {receivedGifts.map((gift) => (
              <Card key={gift.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold">{gift.itemName}</span>
                        <Badge variant={gift.isClaimed ? 'secondary' : 'default'}>
                          {gift.isClaimed ? 'Claimed' : 'New'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">From: {gift.senderName}</p>
                      <p className="text-sm mb-2">"{gift.message}"</p>
                      <p className="text-xs text-gray-500">Sent: {gift.sentAt}</p>
                    </div>
                    {!gift.isClaimed && (
                      <Button onClick={() => claimGift(gift.id)} className="ml-4">
                        Claim Gift
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <div className="space-y-4">
            {sentGifts.map((gift) => (
              <Card key={gift.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="w-5 h-5 text-blue-500" />
                        <span className="font-semibold">{gift.itemName}</span>
                        <Badge variant={gift.isClaimed ? 'secondary' : 'outline'}>
                          {gift.isClaimed ? 'Claimed' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">To: {gift.recipientName}</p>
                      <p className="text-sm mb-2">"{gift.message}"</p>
                      <p className="text-xs text-gray-500">Sent: {gift.sentAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Send a Gift</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Classmate</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {classmates.map((classmate) => (
                    <Card
                      key={classmate.id}
                      className={`cursor-pointer transition-colors ${
                        selectedRecipient === classmate.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRecipient(classmate.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl mb-1">{classmate.avatar}</div>
                        <p className="text-sm font-medium">{classmate.name}</p>
                        <p className="text-xs text-gray-500">Level {classmate.level}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Personal Message</label>
                <Textarea
                  placeholder="Add a personal message to your gift..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Select an item from your inventory to gift, or choose from the store.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => sendGift('sample-item')}
                    disabled={!selectedRecipient}
                    className="flex-1"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Send Gift
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};