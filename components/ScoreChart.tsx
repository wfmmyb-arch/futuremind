import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { AnalysisScore } from '../types';

interface ScoreChartProps {
  scores: AnalysisScore[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scores }) => {
  const data = scores.map(s => ({
    subject: s.dimension,
    A: s.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 14, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="评分"
            dataKey="A"
            stroke="#2563eb"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;