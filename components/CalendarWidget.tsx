
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';
import { Expense } from '../types';

interface CalendarWidgetProps {
  expenses: Expense[];
  onSelectRange: (range: { start: string; end: string } | null) => void;
  selectedRange: { start: string; end: string } | null;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ expenses, onSelectRange, selectedRange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleMouseDown = (dateStr: string) => {
    setIsDragging(true);
    setDragStart(dateStr);
    setDragEnd(dateStr);
    onSelectRange(null); // Clear while dragging
  };

  const handleMouseEnter = (dateStr: string) => {
    if (isDragging) {
      setDragEnd(dateStr);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      const start = dragStart < dragEnd ? dragStart : dragEnd;
      const end = dragStart < dragEnd ? dragEnd : dragStart;
      onSelectRange({ start, end });
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Global mouse up to catch drags ending outside
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        if (dragStart && dragEnd) {
            const start = dragStart < dragEnd ? dragStart : dragEnd;
            const end = dragStart < dragEnd ? dragEnd : dragStart;
            onSelectRange({ start, end });
        }
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd, onSelectRange]);


  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

  const getDayStatus = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Check Expense Intensity
    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const total = dayExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    let intensityClass = '';
    if (total > 100) intensityClass = 'text-y2k-pink font-bold';
    else if (total > 0) intensityClass = 'text-y2k-green font-bold';
    else intensityClass = 'text-y2k-silver/50';

    // Check Selection
    let isSelected = false;
    let isRangeStart = false;
    let isRangeEnd = false;
    let isInRange = false;

    const effectiveStart = isDragging ? (dragStart! < dragEnd! ? dragStart : dragEnd) : selectedRange?.start;
    const effectiveEnd = isDragging ? (dragStart! < dragEnd! ? dragEnd : dragStart) : selectedRange?.end;

    if (effectiveStart && effectiveEnd) {
        if (dateStr === effectiveStart) isRangeStart = true;
        if (dateStr === effectiveEnd) isRangeEnd = true;
        if (dateStr >= effectiveStart! && dateStr <= effectiveEnd!) isInRange = true;
    }

    let bgClass = '';
    if (isRangeStart || isRangeEnd) bgClass = 'bg-y2k-green text-black shadow-[0_0_5px_#39ff14] z-10';
    else if (isInRange) bgClass = 'bg-y2k-green/20 text-white';
    
    return { intensityClass, bgClass, total };
  };

  return (
    <div className="h-full flex flex-col relative select-none">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 border-b border-y2k-green/30 pb-1">
            <button onClick={prevMonth} className="hover:text-y2k-pink transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex items-center gap-2">
                <span className="font-mono font-bold uppercase tracking-widest text-sm text-y2k-cyan">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                {selectedRange && (
                     <button onClick={() => onSelectRange(null)} className="text-y2k-pink hover:text-white" title="Clear Selection">
                        <RefreshCcw className="w-3 h-3" />
                     </button>
                )}
            </div>
            <button onClick={nextMonth} className="hover:text-y2k-pink transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono flex-1 content-start" onMouseLeave={() => isDragging && setDragEnd(dragStart)}>
            {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-y2k-silver opacity-50 font-bold">{d}</div>
            ))}
            
            {days.map((day, i) => {
                if (!day) return <div key={i} className="aspect-square"></div>;
                
                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                const { intensityClass, bgClass, total } = getDayStatus(day);
                const isToday = dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

                return (
                    <div 
                        key={i} 
                        onMouseDown={() => handleMouseDown(dateStr)}
                        onMouseEnter={() => handleMouseEnter(dateStr)}
                        className={`aspect-square flex flex-col items-center justify-center transition-all cursor-pointer group relative rounded-sm
                            ${bgClass}
                            ${!bgClass && 'hover:bg-white/10'}
                        `}
                    >
                        <span className={`${bgClass ? 'text-inherit' : intensityClass} text-xs`}>{day}</span>
                        {total > 0 && !bgClass && (
                             <div className={`w-1 h-1 rounded-full mt-0.5 ${total > 100 ? 'bg-y2k-pink' : 'bg-y2k-green'}`}></div>
                        )}
                        {isToday && !bgClass && <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white animate-pulse"></div>}
                    </div>
                );
            })}
        </div>

        {/* Decorative Scanline */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
    </div>
  );
};

export default CalendarWidget;
