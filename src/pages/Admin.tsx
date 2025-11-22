// File: src/pages/Admin.tsx
// Admin page with Standards Importer and Content Generation Dashboard

import React from 'react';
import { StandardsImporter } from '@/components/StandardsImporter';
import { ContentGenerationDashboard } from '@/components/ContentGenerationDashboard';

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Standards Importer - Import Math Standards */}
        <StandardsImporter />
        
        {/* Content Generation Dashboard - Generate Practice Content */}
        <ContentGenerationDashboard />
        
      </div>
    </div>
  );
}
