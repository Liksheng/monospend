
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { Expense, CATEGORY_COLORS } from '../types';

interface ChartProps {
  expenses: Expense[];
  totalBudget?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border border-y2k-green p-2 shadow-[4px_4px_0px_rgba(57,255,20,0.3)] z-50">
        <p className="text-y2k-green text-xs font-mono uppercase font-bold border-b border-y2k-green/30 mb-1 pb-1">{label}</p>
        <p className="text-white text-sm font-mono">{`$${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart: React.FC<ChartProps> = ({ expenses }) => {
  const dataMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = (Object.values(dataMap) as number[]).reduce((a: number, b: number) => a + b, 0);
  const safeTotal: number = total || 1;

  const data = Object.entries(dataMap).map(([name, value]) => ({ 
      name, 
      value: value as number,
      percent: (value as number) / safeTotal
  }));
  
  data.sort((a, b) => b.value - a.value);

  const activeExpenses = expenses.length > 0;
  const totalTicks = 40;
  const radius = 50; // Reduced radius to fit
  const center = 80;
  let currentTick = 0;
  
  const renderTicks = () => {
      if (!activeExpenses) {
          return Array.from({ length: totalTicks }).map((_, i) => {
            const angle = (i / totalTicks) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = center + (radius - 5) * Math.cos(rad);
            const y1 = center + (radius - 5) * Math.sin(rad);
            const x2 = center + radius * Math.cos(rad);
            const y2 = center + radius * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a1a" strokeWidth="2" />;
          });
      }

      return data.map((entry) => {
          const ticksForCategory = Math.round(entry.percent * totalTicks);
          const ticks = [];
          const color = CATEGORY_COLORS[entry.name] || '#39ff14';

          for (let i = 0; i < ticksForCategory; i++) {
             if (currentTick >= totalTicks) break;
             
             const angle = (currentTick / totalTicks) * 360 - 90; 
             const rad = (angle * Math.PI) / 180;
             
             const innerR = radius - 10;
             const outerR = radius;

             const x1 = center + innerR * Math.cos(rad);
             const y1 = center + innerR * Math.sin(rad);
             const x2 = center + outerR * Math.cos(rad);
             const y2 = center + outerR * Math.sin(rad);

             ticks.push(
                 <line 
                    key={`${entry.name}-${i}`} 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke={color} 
                    strokeWidth="3"
                    className="hover:opacity-100 opacity-90 transition-opacity"
                 />
             );
             currentTick++;
          }
          return ticks;
      });
  };

  const maxPercentage = activeExpenses 
    ? Math.round((Math.max(...data.map(d => d.value)) / safeTotal) * 100)
    : 0;

  return (
    <div className="h-full w-full relative group flex flex-col items-center justify-center bg-black/40 border border-y2k-green/20 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="xMidYMid meet" className="overflow-visible relative z-10">
            {renderTicks()}
            <circle cx={center} cy={center} r={radius-15} fill="none" stroke="#1a1a1a" strokeWidth="1" />
            <foreignObject x="40" y="40" width="80" height="80">
                <div className="h-full flex flex-col items-center justify-center text-center">
                    {activeExpenses ? (
                        <>
                            <span className="text-3xl font-mono text-y2k-green leading-none text-glow">{maxPercentage}<span className="text-sm">%</span></span>
                        </>
                    ) : (
                        <span className="text-[10px] text-y2k-green/50 font-mono animate-pulse">NO_DATA</span>
                    )}
                </div>
            </foreignObject>
        </svg>
    </div>
  );
};

export const DailyBarChart: React.FC<ChartProps> = ({ expenses }) => {
    const dataMap = expenses.reduce((acc, curr) => {
        const dateKey = curr.date.slice(5); // MM-DD
        acc[dateKey] = (acc[dateKey] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);
    
      const sortedKeys = Object.keys(dataMap).sort();
      const data = sortedKeys.map(key => ({ name: key, amount: dataMap[key] }));

      if (data.length === 0) {
        return (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-y2k-green/30 bg-black/40 relative min-h-[150px]">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(57,255,20,0.03)_25%,transparent_25%,transparent_50%,rgba(57,255,20,0.03)_50%,rgba(57,255,20,0.03)_75%,transparent_75%,transparent)] bg-[size:20px_20px]"></div>
             <span className="text-y2k-green font-mono text-xs animate-pulse z-10">AWAITING_INPUT_STREAM...</span>
          </div>
        );
      }

      return (
        <div className="h-full w-full bg-black/40 p-2 border border-y2k-green/20 relative min-h-[180px]">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
            
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39ff14" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tick={{fill: '#39ff14', fontSize: 9, fontFamily: '"Share Tech Mono", monospace'}} 
                        axisLine={{stroke: '#333'}} 
                        tickLine={false} 
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={40}
                    />
                    <YAxis 
                         tick={{fill: '#1a1a1a', fontSize: 9}} 
                         axisLine={false}
                         tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: '#39ff14', strokeWidth: 1, strokeDasharray: '2 2'}} />
                    <Area 
                        type="stepAfter" 
                        dataKey="amount" 
                        stroke="#39ff14" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorAmt)" 
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      )
}
