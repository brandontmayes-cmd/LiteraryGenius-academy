import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EngagementChartProps {
  data: Array<{
    date: string;
    engagement: number;
    completion: number;
  }>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Student Engagement Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Engagement Score"
            />
            <Line 
              type="monotone" 
              dataKey="completion" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Completion Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
