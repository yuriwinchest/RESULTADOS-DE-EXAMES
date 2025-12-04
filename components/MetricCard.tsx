
import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ExamDataPoint, Trend } from '../types';
import { TrendingDown, TrendingUp, Minus, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  data: ExamDataPoint;
}

const MetricCard: React.FC<MetricCardProps> = ({ data }) => {
  // Check if values are numbers for charting. Strings (like "Positivo") should not be charted.
  const isNumeric1 = typeof data.value1 === 'number';
  const isNumeric2 = typeof data.value2 === 'number';
  
  // Logic: Show chart if AT LEAST one value is numeric and the other is either numeric or null (not a string).
  // If one of them is a string (e.g. "Positivo"), we hide the chart.
  const hasStringValue = (typeof data.value1 === 'string') || (typeof data.value2 === 'string');
  const canShowChart = !hasStringValue && (isNumeric1 || isNumeric2);

  const chartData = [
    { name: 'Set', value: typeof data.value1 === 'number' ? data.value1 : 0, fullDate: data.date1 },
    { name: 'Dez', value: typeof data.value2 === 'number' ? data.value2 : 0, fullDate: data.date2 },
  ];

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('normal') || s.includes('negativo') || s.includes('ausentes')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s.includes('limítrofe') || s.includes('levemente') || s.includes('baixo')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case Trend.IMPROVED:
        return <TrendingDown className="w-5 h-5 text-emerald-500" />;
      case Trend.WORSENED:
        return <TrendingUp className="w-5 h-5 text-rose-500" />;
      case Trend.STABLE:
        return <Minus className="w-5 h-5 text-slate-400" />;
      default:
        return <Minus className="w-5 h-5 text-slate-300" />;
    }
  };

  // Special handling for HDL where "Higher is Better"
  const isHDL = data.id === 'hdl';
  const effectiveTrendIcon = isHDL ? (
     data.trend === Trend.WORSENED ? <TrendingDown className="w-5 h-5 text-rose-500" /> : <TrendingUp className="w-5 h-5 text-emerald-500" />
  ) : getTrendIcon();

  const renderValue = (val: string | number | null, unit: string) => {
    if (val === null) return <span className="text-sm text-slate-400 italic">Não medido</span>;
    return (
        <>
            {val} <span className="text-xs opacity-75">{unit}</span>
        </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg truncate pr-2" title={data.name}>{data.name}</h3>
          <p className="text-xs text-slate-500">Ref: {data.reference} {data.unit}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg shrink-0">
          {effectiveTrendIcon}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 gap-2">
        <div className="flex-1">
            <span className="text-xs text-slate-400 block mb-1">17 Set 2025</span>
            {data.value1 !== null ? (
                 <div className={`px-2 py-1 rounded text-sm font-medium border ${getStatusColor(data.status1)} inline-block`}>
                    {renderValue(data.value1, data.unit)}
                 </div>
            ) : (
                <span className="text-sm text-slate-400 italic">Não medido</span>
            )}
        </div>
        <div className="flex-1 text-right">
            <span className="text-xs text-slate-400 block mb-1">02 Dez 2025</span>
            {data.value2 !== null ? (
                 <div className={`px-2 py-1 rounded text-sm font-medium border ${getStatusColor(data.status2)} inline-block`}>
                     {renderValue(data.value2, data.unit)}
                 </div>
            ) : (
                <span className="text-sm text-slate-400 italic">Não medido</span>
            )}
        </div>
      </div>

      {data.id === 'cpk' && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-pulse">
            <h4 className="font-bold text-red-800 text-sm flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Atenção Médica Necessária
            </h4>
            <p className="text-xs text-red-700 leading-relaxed ml-7">
                Aumento drástico de 42 para 1219 U/L. Este nível sugere possível lesão muscular e requer avaliação médica imediata.
            </p>
        </div>
      )}

      {/* Chart - Only render if we have numeric data suitable for a bar chart */}
      <div className="h-32 mt-auto w-full">
        {canShowChart ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#94a3b8'}}
                />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 1 ? '#3b82f6' : '#cbd5e1'} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">
                    {hasStringValue ? 'Resultado qualitativo' : 'Gráfico indisponível'}
                </p>
            </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-600 italic">"{data.observation}"</p>
      </div>
    </div>
  );
};

export default MetricCard;
