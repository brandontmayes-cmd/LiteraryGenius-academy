// File: src/components/StandardsImporter.tsx
// Web-based tool to import Math standards from JSON
// Add this to your admin dashboard temporarily

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const StandardsImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const parseGrade = (gradeStr: string): string | null => {
    if (gradeStr.includes('Kindergarten')) return 'K';
    const match = gradeStr.match(/Grade (\d+)/);
    if (match) return match[1];
    return null;
  };

  const extractMathStandards = (jsonData: any) => {
    const standards: any[] = [];

    Object.keys(jsonData).forEach(gradeKey => {
      const gradeLevel = parseGrade(gradeKey);
      if (!gradeLevel) return;

      const gradeData = jsonData[gradeKey];

      Object.keys(gradeData).forEach(domainKey => {
        const domainData = gradeData[domainKey];
        
        // Standards in clusters
        if (domainData.clusters) {
          Object.keys(domainData.clusters).forEach(clusterKey => {
            const cluster = domainData.clusters[clusterKey];
            
            if (cluster.standards && Array.isArray(cluster.standards)) {
              cluster.standards.forEach((std: any) => {
                if (std.code && std.description) {
                  standards.push({
                    standard_code: std.code,
                    grade_level: gradeLevel,
                    subject: 'Math',
                    domain: domainKey,
                    standard_text: std.description
                  });
                }
              });
            }
          });
        }

        // Direct standards
        if (domainData.standards && Array.isArray(domainData.standards)) {
          domainData.standards.forEach((std: any) => {
            if (std.code && std.description) {
              standards.push({
                standard_code: std.code,
                grade_level: gradeLevel,
                subject: 'Math',
                domain: domainKey,
                standard_text: std.description
              });
            }
          });
        }
      });
    });

    return standards;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      console.log('Parsing standards...');
      const standards = extractMathStandards(jsonData);

      console.log(`Found ${standards.length} standards`);

      // Delete old Math standards
      console.log('Deleting old Math standards...');
      const { error: deleteError } = await supabase
        .from('common_core_standards')
        .delete()
        .eq('subject', 'Math');

      if (deleteError) throw deleteError;

      // Insert in batches
      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < standards.length; i += batchSize) {
        const batch = standards.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('common_core_standards')
          .insert(batch);

        if (insertError) throw insertError;
        
        imported += batch.length;
        console.log(`Imported ${imported}/${standards.length}...`);
      }

      setResult({
        success: true,
        imported,
        message: `Successfully imported ${imported} Math standards!`
      });

    } catch (error: any) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Math Standards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Upload your CC-math.json file to import all Math Common Core standards.
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={importing}
            className="hidden"
            id="file-upload"
          />
          
          <label htmlFor="file-upload">
            <Button asChild disabled={importing}>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Importing...' : 'Upload CC-math.json'}
              </span>
            </Button>
          </label>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${
                result.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {result.message}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
