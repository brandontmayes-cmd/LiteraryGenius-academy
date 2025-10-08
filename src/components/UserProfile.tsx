import React, { useState, useEffect } from 'react';
import { User, Settings, Camera, Save, X, Shield, Key, Fingerprint, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SessionManagement } from './SessionManagement';
import AccountRecoverySetup from './AccountRecoverySetup';
import { BiometricAuthSetup } from './BiometricAuthSetup';
import { SubscriptionManagement } from './SubscriptionManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';





const avatarOptions = [
  'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758134463253_02fc8ceb.webp',
  'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758134465134_5410f760.webp',
  'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758134466875_e78160e5.webp',
  'https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758134468720_99dcbdc7.webp',
];

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    avatar: user?.avatar || avatarOptions[0],
  });

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Profile & Security</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none px-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="recovery" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Recovery
            </TabsTrigger>
          </TabsList>




          <TabsContent value="profile" className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                />
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {showAvatarPicker && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, avatar }));
                        setShowAvatarPicker(false);
                      }}
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500"
                    >
                      <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 capitalize">{user.role}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Account Info</h4>
                <p className="text-sm text-gray-600">Role: {user.role}</p>
                <p className="text-sm text-gray-600">
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {user.lastLogin && (
                  <p className="text-sm text-gray-600">
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </TabsContent>
          <TabsContent value="subscription" className="p-6">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="security" className="p-6">
            <SessionManagement />
          </TabsContent>

          <TabsContent value="recovery" className="p-6">
            <AccountRecoverySetup />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}
