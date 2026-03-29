import { useState, useEffect, useRef } from 'react';

interface CranePanelProps {
  isConnected: boolean;
  machineStatus: string;
  onSetMovement: (dx: number, dy: number, dz: number, speed: number) => void;
  onHoming: () => void;
}

export function CranePanel({ isConnected, machineStatus, onSetMovement, onHoming }: CranePanelProps) {
  const [speed, setSpeed] = useState(50);
  const activeKeys = useRef(new Set<string>());
  const movementCallback = useRef(onSetMovement);

  useEffect(() => { movementCallback.current = onSetMovement; }, [onSetMovement]);

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
      if (!isConnected || e.repeat || machineStatus === 'HOMING') return;

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
  }, [isConnected, speed, machineStatus]);

  return (
    <div className="panel">
      <h2>Suwnica (Raspberry Pi)</h2>
      <p>Status: {
        isConnected 
        ? (machineStatus === 'HOMING' ? <strong style={{ color: 'orange' }}>⚙️ BAZOWANIE...</strong> : <strong style={{ color: 'green' }}>🟢 Połączono</strong>)
        : <strong style={{ color: 'red' }}>🔴 Rozłączono</strong>
      }</p>
      
      {/* PRZYCISK BAZOWANIA */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={onHoming} 
          disabled={!isConnected || machineStatus === 'HOMING'}
          style={{ width: '100%', padding: '10px', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          🔄 Uruchom Bazowanie (Krańcówki)
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#555', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
        <strong>Sterowanie Klawiaturą:</strong><br/>
        • Ruch poziomy: <b>W S A D</b> lub <b>Strzałki</b><br/>
        • Wysięgnik haka: <b>X</b> (Podnieś), <b>Z</b> (Opuść)
      </div>

      <div style={{ marginTop: '15px' }}>
        <label>Prędkość robocza: <strong>{speed}%</strong></label>
        <input 
          type="range" min="10" max="100" step="10" value={speed} disabled={!isConnected || machineStatus === 'HOMING'}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: '100%', marginTop: '5px' }}
        />
      </div>

      {/* ... (Twoje przyciski ekranowe WSAD/XZ - zostaw je bez zmian, dopisz tylko disabled={!isConnected || machineStatus === 'HOMING'}) ... */}
    </div>
  )
}