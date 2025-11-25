'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestStandardsDisplay() {
  const [standards, setStandards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    try {
      console.log('TEST: Loading standards...');
      
      const { data, error } = await supabase
        .from('standards')
        .select('*')
        .eq('subject', 'math')
        .eq('grade', '5')
        .limit(10);

      console.log('TEST: Query result:', { data, error });

      if (error) {
        setError(error.message);
        throw error;
      }

      setStandards(data || []);
    } catch (err) {
      console.error('TEST: Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test: Grade 5 Math Standards</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Found {standards.length} standards</p>
        <div className="space-y-2">
          {standards.map((standard) => (
            <div key={standard.id} className="p-3 border rounded">
              <div className="font-semibold">{standard.code}</div>
              <div className="text-sm text-gray-600">{standard.domain}</div>
              <div className="text-sm">{standard.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
