
import React, { useState, useEffect, useRef } from 'react';

interface RotaryKnobProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
}

const RotaryKnob: React.FC<RotaryKnobProps> = ({ value, min = 0, max = 2000, step = 10, label, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const startYRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = internalValue;
    document.body.style.cursor = 'ns-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = startYRef.current - e.clientY; // Up increases value
    const sensitivity = 2; // Pixels per unit
    
    let newValue = startValueRef.current + (deltaY * sensitivity);
    
    // Snap to step
    newValue = Math.round(newValue / step) * step;
    
    // Clamp
    newValue = Math.max(min, Math.min(max, newValue));
    
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent page scroll when hovering the knob
    // Note: Passive event listeners in React might still allow scroll, 
    // but this logic handles the value change.
    const delta = e.deltaY > 0 ? -step : step;
    const newValue = Math.max(min, Math.min(max, internalValue + delta));
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
          const clamped = Math.min(max, num); // Don't clamp min while typing to allow '0' or backspace
          setInternalValue(clamped);
          onChange(clamped);
      } else {
          setInternalValue(0);
          onChange(0);
      }
  };

  // Calculate rotation: Map min-max to -135deg to +135deg
  const range = max - min;
  const percentage = (internalValue - min) / range;
  const angle = -135 + (percentage * 270);

  return (
    <div 
      className="flex flex-col items-center gap-2 select-none group"
      onWheel={handleWheel}
    >
      {/* Knob SVG */}
      <div 
        className="relative w-16 h-16 cursor-ns-resize"
        onMouseDown={handleMouseDown}
        title="Drag up/down or scroll to adjust"
      >
        {/* Indicator Dots Ring */}
        <svg width="64" height="64" viewBox="0 0 100 100" className="absolute inset-0 opacity-30 pointer-events-none">
            {Array.from({ length: 11 }).map((_, i) => {
                const tickAngle = -135 + (i * 27);
                const rad = (tickAngle * Math.PI) / 180;
                const x = 50 + 42 * Math.cos(rad);
                const y = 50 + 42 * Math.sin(rad);
                return <circle key={i} cx={x} cy={y} r="2" fill="#fafafa" />
            })}
        </svg>

        {/* The Potentiometer Body */}
        <div className="w-full h-full rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative group-hover:border-zinc-500 transition-colors">
           {/* Metallic Top Texture */}
           <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 pointer-events-none" />
           
           {/* The Indicator Line */}
           <div 
             className="absolute w-1 h-1/2 bg-cyan-400 rounded-full origin-bottom bottom-1/2 shadow-[0_0_5px_#22d3ee] pointer-events-none"
             style={{ transform: `rotate(${angle}deg)` }}
           />
        </div>
      </div>

      {/* Digital Readout Box (Now Input) */}
      <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">{label}</span>
          <div className="bg-zinc-950 border border-zinc-800 rounded px-1 py-0.5 w-[70px] text-center shadow-inner mt-1 focus-within:border-cyan-500/50 transition-colors">
              <input 
                type="text"
                value={internalValue}
                onChange={handleInputChange}
                className={`w-full bg-transparent font-display text-sm text-center focus:outline-none ${internalValue > 0 ? 'text-cyan-400 text-vfd' : 'text-zinc-600'}`}
                aria-label={`${label} value`}
              />
          </div>
      </div>
    </div>
  );
};

export default RotaryKnob;
