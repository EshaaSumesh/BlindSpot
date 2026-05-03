import React, { useState, useEffect, useRef } from 'react';

interface RadarChartProps {
  scores: {
    liability: number;
    ip: number;
    payment: number;
    termination: number;
    trust: number;
  };
  activeAxes?: Set<string>;
}

export default function RadarChart({ scores, activeAxes = new Set() }: RadarChartProps) {
  const [jitter, setJitter] = useState({ liability: 0, ip: 0, payment: 0, termination: 0, trust: 0 });
  const requestRef = useRef<number>();
  
  useEffect(() => {
    const animate = (time: number) => {
      const newJitter = { liability: 0, ip: 0, payment: 0, termination: 0, trust: 0 };
      
      if (activeAxes.has('liability')) newJitter.liability = Math.sin(time / 100) * 3;
      if (activeAxes.has('ip')) newJitter.ip = Math.sin(time / 120) * 3;
      if (activeAxes.has('payment')) newJitter.payment = Math.sin(time / 140) * 3;
      if (activeAxes.has('termination')) newJitter.termination = Math.sin(time / 160) * 3;
      if (activeAxes.has('trust')) newJitter.trust = Math.sin(time / 180) * 3;
      
      setJitter(newJitter);
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [activeAxes]);

  const size = 200;
  const center = size / 2;
  const radius = size * 0.35;
  
  const labels = ['Liability', 'IP', 'Payment', 'Term', 'Trust'];
  const keys = ['liability', 'ip', 'payment', 'termination', 'trust'] as const;
  const angles = [0, 72, 144, 216, 288];
  
  const getPoint = (key: typeof keys[number], index: number) => {
    const baseScore = scores[key];
    const currentJitter = jitter[key];
    const r = ((baseScore + currentJitter) / 100) * radius;
    const angle = angles[index];
    const x = center + r * Math.cos((angle - 90) * (Math.PI / 180));
    const y = center + r * Math.sin((angle - 90) * (Math.PI / 180));
    return `${x},${y}`;
  };

  const points = keys.map((key, i) => getPoint(key, i)).join(' ');

  const gridPoints = (r: number) => angles.map(a => {
    const x = center + r * Math.cos((a - 90) * (Math.PI / 180));
    const y = center + r * Math.sin((a - 90) * (Math.PI / 180));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '12px', 
      background: 'rgba(255,255,255,0.02)', 
      borderRadius: '8px', 
      border: '0.5px solid var(--border2)',
      boxShadow: activeAxes.size > 0 ? '0 0 15px rgba(201, 168, 76, 0.1)' : 'none',
      transition: 'all 0.3s'
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grids */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((p, i) => (
          <polygon
            key={i}
            points={gridPoints(radius * p)}
            fill="none"
            stroke="var(--border2)"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Axis Lines */}
        {angles.map((a, i) => {
          const x = center + radius * Math.cos((a - 90) * (Math.PI / 180));
          const y = center + radius * Math.sin((a - 90) * (Math.PI / 180));
          const isActive = activeAxes.has(keys[i]);
          return <line 
            key={i} 
            x1={center} y1={center} 
            x2={x} y2={y} 
            stroke={isActive ? 'var(--gold)' : 'var(--border2)'} 
            strokeWidth={isActive ? 1 : 0.5} 
            opacity={isActive ? 0.6 : 0.3}
          />;
        })}

        {/* Data Polygon */}
        <polygon
          points={points}
          fill="rgba(201, 168, 76, 0.3)"
          stroke="var(--gold)"
          strokeWidth="2"
          style={{ transition: activeAxes.size === 0 ? 'all 0.8s ease' : 'none' }}
        />
        
        {/* Glowing Points */}
        {points.split(' ').map((p, i) => {
          const [x, y] = p.split(',');
          const isActive = activeAxes.has(keys[i]);
          return <circle 
            key={i} 
            cx={x} cy={y} 
            r={isActive ? 4 : 3} 
            fill="var(--gold)" 
            style={{ filter: isActive ? 'drop-shadow(0 0 4px var(--gold))' : 'none' }}
          />;
        })}

        {/* Labels */}
        {labels.map((label, i) => {
          const r = radius + 20;
          const x = center + r * Math.cos((angles[i] - 90) * (Math.PI / 180));
          const y = center + r * Math.sin((angles[i] - 90) * (Math.PI / 180));
          const isActive = activeAxes.has(keys[i]);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fill={isActive ? 'var(--gold)' : 'var(--text-dim)'}
              fontSize="9"
              fontWeight={isActive ? 600 : 400}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.3s' }}
            >
              {label}
            </text>
          );
        })}
      </svg>
      <div style={{ 
        marginTop: '8px', 
        color: activeAxes.size > 0 ? 'var(--gold)' : 'var(--text-dim)', 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        letterSpacing: '0.1em',
        animation: activeAxes.size > 0 ? 'pulse 2s infinite' : 'none'
      }}>
        {activeAxes.size > 0 ? 'ANALYSIS IN PROGRESS...' : `HEALTH INDEX: ${Math.round((scores.liability + scores.ip + scores.payment + scores.termination + scores.trust) / 5)}%`}
      </div>
    </div>
  );
}
