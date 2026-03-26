import { useState, useEffect, useRef } from 'react';

interface CranePanelProps {
  isConnected: boolean;
  onSetMovement: (dx: number, dy: number, dz: number, speed: number) => void;
}

export function CranePanel({ isConnected, onSetMovement }: CranePanelProps) {
  const [speed, setSpeed] = useState(50);
  const activeKeys = useRef(new Set<string>());

  // Sejf na funkcję ruchu - naprawia błąd zacinającej się suwnicy
  const movementCallback = useRef(onSetMovement);
  useEffect(() => {
    movementCallback.current = onSetMovement;
  }, [onSetMovement]);

  useEffect(() => {
    const updateMovement = () => {
      let dx = 0, dy = 0, dz = 0;
      const keys = activeKeys.current;

      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;
      if (keys.has('x')) dz += 1;
      if (keys.has('z')) dz -= 1;

      movementCallback.current(dx, dy, dz, speed);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

      if (!isConnected || e.repeat) return;

      const key = e.key.toLowerCase();
      const validKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'x', 'z'];

      if (validKeys.includes(key)) {
        activeKeys.current.add(key);
        updateMovement();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isConnected) return;
      const key = e.key.toLowerCase();
      if (activeKeys.current.has(key)) {
        activeKeys.current.delete(key);
        updateMovement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isConnected, speed]);

  return (
    <div className="panel">
      <h2>Suwnica (Raspberry Pi)</h2>
      <p>Status: {isConnected ? <strong style={{ color: 'green' }}>🟢 Połączono</strong> : <strong style={{ color: 'red' }}>🔴 Rozłączono</strong>}</p>
      
      <div style={{ fontSize: '12px', color: '#555', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
        <strong>Sterowanie Klawiaturą:</strong><br/>
        • Ruch poziomy: <b>W S A D</b> lub <b>Strzałki</b><br/>
        • Wysięgnik haka: <b>X</b> (Podnieś), <b>Z</b> (Opuść)
      </div>

      <div style={{ marginTop: '15px' }}>
        <label>Prędkość robocza: <strong>{speed}%</strong></label>
        <input 
          type="range" min="10" max="100" step="10" value={speed} disabled={!isConnected}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '5px', justifyContent: 'center' }}>
          <div /> 
          <button disabled={!isConnected} onMouseDown={() => movementCallback.current(0, -1, 0, speed)} onMouseUp={() => movementCallback.current(0,0,0,speed)} onMouseLeave={() => movementCallback.current(0,0,0,speed)}>W</button>
          <div />
          <button disabled={!isConnected} onMouseDown={() => movementCallback.current(-1, 0, 0, speed)} onMouseUp={() => movementCallback.current(0,0,0,speed)} onMouseLeave={() => movementCallback.current(0,0,0,speed)}>A</button>
          <button disabled={!isConnected} onMouseDown={() => movementCallback.current(0, 1, 0, speed)} onMouseUp={() => movementCallback.current(0,0,0,speed)} onMouseLeave={() => movementCallback.current(0,0,0,speed)}>S</button>
          <button disabled={!isConnected} onMouseDown={() => movementCallback.current(1, 0, 0, speed)} onMouseUp={() => movementCallback.current(0,0,0,speed)} onMouseLeave={() => movementCallback.current(0,0,0,speed)}>D</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button disabled={!isConnected} onMouseDown={() => movementCallback.current(0, 0, 1, speed)} onMouseUp={() => movementCallback.current(0,0,0,speed)} onMouseLeave={() => movementCallback.current(0,0,0,speed)}>Podnieś (X)</button>
          <button disabled={!isConnected} onMouseDown={() => movementCallback.current(0, 0, -1, speed)} onMouseUp={() => movementCallback.current(0,0,0,speed)} onMouseLeave={() => movementCallback.current(0,0,0,speed)}>Opuść (Z)</button>
        </div>
      </div>
    </div>
  )
}