import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  ReferenceLine
} from 'recharts';
import { TrendPoint } from '../types';

interface TrendChartProps {
  data: TrendPoint[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
      <span className="text-slate-400 font-bold">暂无趋势可视化数据</span>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Price Chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          价格走势分析
        </h4>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 13 }} stroke="#e2e8f0" />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 13 }} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '14px' }}
              />
              <Area type="monotone" dataKey="price" fill="#eff6ff" stroke="none" />
              <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} name="价格" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MACD Chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-rose-500 rounded-full"></div>
          MACD 动能指标
        </h4>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 13 }} stroke="#e2e8f0" />
              <YAxis tick={{ fill: '#64748b', fontSize: 13 }} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '14px' }} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey="hist" name="MACD 柱" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <rect key={`cell-${index}`} fill={(entry.hist || 0) > 0 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} name="DIF" />
              <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={2} dot={false} name="DEA" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KDJ Chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
          KDJ 超买超卖指标
        </h4>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 13 }} stroke="#e2e8f0" />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 13 }} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '16px', fontSize: '14px' }} />
              <ReferenceLine y={80} stroke="#fee2e2" strokeDasharray="3 3" label={{ position: 'right', value: '超买', fill: '#f87171', fontSize: 12 }} />
              <ReferenceLine y={20} stroke="#dcfce7" strokeDasharray="3 3" label={{ position: 'right', value: '超卖', fill: '#4ade80', fontSize: 12 }} />
              <Line type="monotone" dataKey="k" stroke="#6366f1" strokeWidth={2} dot={false} name="K线" />
              <Line type="monotone" dataKey="d" stroke="#f59e0b" strokeWidth={2} dot={false} name="D线" />
              <Line type="monotone" dataKey="j" stroke="#ec4899" strokeWidth={2} dot={false} name="J线" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;