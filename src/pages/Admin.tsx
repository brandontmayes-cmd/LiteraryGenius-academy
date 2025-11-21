// File: src/pages/Admin.tsx
// Admin page that shows the Content Generation Dashboard

import React from 'react';
import { ContentGenerationDashboard } from '@/components/ContentGenerationDashboard';

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContentGenerationDashboard />
    </div>
  );
}
