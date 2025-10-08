import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Heart, ShoppingCart, Gift, Star, Crown, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  xpCost: number;
  rewardPointsCost: number;
  rarity: string;
  imageUrl: string;
  owned: boolean;
  inWishlist: boolean;
}

export const VirtualStore: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [balance, setBalance] = useState({ xp: 0, rewardPoints: 0 });
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStoreData();
    }
  }, [user, activeCategory]);

  const loadStoreData = async () => {
    try {
      const { data } = await supabase.functions.invoke('virtual-store-engine', {
        body: { action: 'get_store_data', data: { studentId: user?.id, category: activeCategory } }
      });
      
      if (data) {
        setItems(data.items || []);
        setBalance(data.studentBalance || { xp: 0, rewardPoints: 0 });
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: StoreItem, useRewardPoints = false) => {
    try {
      const { data } = await supabase.functions.invoke('virtual-store-engine', {
        body: { 
          action: 'purchase_item', 
          data: { studentId: user?.id, itemId: item.id, useRewardPoints }
        }
      });
      
      if (data?.success) {
        setBalance(prev => ({ ...prev, xp: data.newBalance }));
        loadStoreData();
      }
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const toggleWishlist = async (itemId: string) => {
    try {
      await supabase.functions.invoke('virtual-store-engine', {
        body: { action: 'add_to_wishlist', data: { studentId: user?.id, itemId } }
      });
      loadStoreData();
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4" />;
      case 'epic': return <Sparkles className="w-4 h-4" />;
      case 'rare': return <Star className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading store...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Virtual Store</h1>
        <div className="flex gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{balance.xp} XP</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">{balance.rewardPoints} Reward Points</span>
            </div>
          </Card>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="avatar">Avatars</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
          <TabsTrigger value="tool">Tools</TabsTrigger>
          <TabsTrigger value="premium_feature">Premium</TabsTrigger>
          <TabsTrigger value="real_world">Real World</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="relative overflow-hidden">
                <div className={`absolute top-2 right-2 ${getRarityColor(item.rarity)} text-white px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                  {getRarityIcon(item.rarity)}
                  {item.rarity}
                </div>
                
                <CardHeader className="pb-2">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm">
                      {item.xpCost > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {item.xpCost} XP
                        </span>
                      )}
                      {item.rewardPointsCost > 0 && (
                        <span className="flex items-center gap-1">
                          <Gift className="w-4 h-4 text-purple-500" />
                          {item.rewardPointsCost} RP
                        </span>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWishlist(item.id)}
                      className={item.inWishlist ? 'text-red-500' : 'text-gray-400'}
                    >
                      <Heart className={`w-4 h-4 ${item.inWishlist ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  
                  {item.owned ? (
                    <Badge variant="secondary" className="w-full justify-center">
                      Owned
                    </Badge>
                  ) : (
                    <div className="space-y-2">
                      {item.xpCost > 0 && (
                        <Button
                          onClick={() => handlePurchase(item, false)}
                          disabled={balance.xp < item.xpCost}
                          className="w-full"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy with XP
                        </Button>
                      )}
                      {item.rewardPointsCost > 0 && (
                        <Button
                          onClick={() => handlePurchase(item, true)}
                          disabled={balance.rewardPoints < item.rewardPointsCost}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Buy with RP
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};