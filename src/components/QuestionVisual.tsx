'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: Array<{ name: string; value: number }>;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

interface TableData {
  type: 'table';
  headers: string[];
  rows: string[][];
  title?: string;
}

interface ImageData {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
}

type VisualData = ChartData | TableData | ImageData;

interface QuestionVisualProps {
  visual: VisualData;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function QuestionVisual({ visual }: QuestionVisualProps) {
  if (!visual) return null;

  // Render Bar Chart
  if (visual.type === 'bar') {
    return (
      <Card className="my-4">
        <CardContent className="pt-6">
          {visual.title && (
            <h4 className="text-center font-semibold mb-4">{visual.title}</h4>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visual.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                label={visual.xLabel ? { value: visual.xLabel, position: 'insideBottom', offset: -5 } : undefined}
              />
              <YAxis 
                label={visual.yLabel ? { value: visual.yLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6">
                {visual.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // Render Line Chart
  if (visual.type === 'line') {
    return (
      <Card className="my-4">
        <CardContent className="pt-6">
          {visual.title && (
            <h4 className="text-center font-semibold mb-4">{visual.title}</h4>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visual.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                label={visual.xLabel ? { value: visual.xLabel, position: 'insideBottom', offset: -5 } : undefined}
              />
              <YAxis 
                label={visual.yLabel ? { value: visual.yLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // Render Pie Chart
  if (visual.type === 'pie') {
    return (
      <Card className="my-4">
        <CardContent className="pt-6">
          {visual.title && (
            <h4 className="text-center font-semibold mb-4">{visual.title}</h4>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visual.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {visual.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // Render Table
  if (visual.type === 'table') {
    return (
      <Card className="my-4">
        <CardContent className="pt-6">
          {visual.title && (
            <h4 className="text-center font-semibold mb-4">{visual.title}</h4>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {visual.headers.map((header, i) => (
                    <th key={i} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visual.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-gray-300 px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Image
  if (visual.type === 'image') {
    return (
      <Card className="my-4">
        <CardContent className="pt-6">
          <img 
            src={visual.url} 
            alt={visual.alt}
            className="max-w-full h-auto mx-auto rounded-lg"
          />
          {visual.caption && (
            <p className="text-sm text-gray-600 text-center mt-2">{visual.caption}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
