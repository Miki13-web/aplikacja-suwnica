// src/components/CranePanel.tsx
import { useState } from 'react';

interface CranePanelProps {
  isConnected: boolean;
  // Zmieniamy nazwy funkcji, żeby były precyzyjne
  onStartMove: (dx: number, dy: number, speed: number) => void;
  onStopMove: () => void;
}

export function CranePanel({ isConnected, onStartMove, onStopMove }: CranePanelProps) {
  const [speed, setSpeed] = useState(50);

  return (
    <div className="panel">
      <h2>Suwnica (Raspberry Pi)</h2>
      <p>Status: {isConnected ? <strong style={{ color: 'green' }}>Zasilanie włączone</strong> : <strong style={{ color: 'red' }}>Brak zasilania</strong>}</p>

      <div style={{ marginTop: '15px' }}>
        <label>Prędkość robocza: <strong>{speed}%</strong></label>
        <input 
          type="range" min="10" max="100" step="10" value={speed} disabled={!isConnected}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gap: '5px', justifyContent: 'center', marginTop: '20px' }}>
        <div /> 
        <button 
          disabled={!isConnected} 
          onPointerDown={() => onStartMove(0, -1, speed)} 
          onPointerUp={onStopMove} 
          onPointerLeave={onStopMove}
        >↑</button>
        <div />
        <button 
          disabled={!isConnected} 
          onPointerDown={() => onStartMove(-1, 0, speed)} 
          onPointerUp={onStopMove} 
          onPointerLeave={onStopMove}
        >←</button>
        <button 
          disabled={!isConnected} 
          onPointerDown={() => onStartMove(0, 1, speed)} 
          onPointerUp={onStopMove} 
          onPointerLeave={onStopMove}
        >↓</button>
        <button 
          disabled={!isConnected} 
          onPointerDown={() => onStartMove(1, 0, speed)} 
          onPointerUp={onStopMove} 
          onPointerLeave={onStopMove}
        >→</button>
      </div>
    </div>
  )
}