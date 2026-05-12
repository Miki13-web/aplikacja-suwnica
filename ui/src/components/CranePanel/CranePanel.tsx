import { useState, useEffect, useRef } from 'react';
import styles from './CranePanel.module.css';

interface CranePanelProps {
  isConnected: boolean;
  machineStatus: string;
  onSetMovement: (dx: number, dy: number, dz: number, speed: number) => void;
  onHoming: () => void;
  onHomingZ: () => void; 
}

export function CranePanel({ isConnected, machineStatus, onSetMovement, onHoming, onHomingZ }: CranePanelProps) {
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
      if (validKeys.includes(key)) { activeKeys.current.add(key); updateMovement(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isConnected) return;
      const key = e.key.toLowerCase();
      if (activeKeys.current.has(key)) { activeKeys.current.delete(key); updateMovement(); }
    };

    const handleBlur = () => { activeKeys.current.clear(); updateMovement(); };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isConnected, speed, machineStatus]);

  return (
    <div className={styles.panel}>
      <h2>Suwnica</h2>
      <p>Status: {
        isConnected 
        ? (machineStatus === 'HOMING' ? <strong style={{ color: 'orange' }}>⚙️ BAZOWANIE...</strong> : <strong style={{ color: 'green' }}>🟢 Połączono</strong>)
        : <strong style={{ color: 'red' }}>🔴 Rozłączono</strong>
      }</p>
      
      <div className={styles.buttonGroup}>
        <button 
          onClick={onHoming} disabled={!isConnected || machineStatus === 'HOMING'}
          className={`${styles.btn} ${styles.btnWarning} ${(!isConnected || machineStatus === 'HOMING') ? styles.btnDisabled : ''}`}
        >
          {machineStatus === 'HOMING' ? '⚙️ BAZOWANIE TRWA...' : '🔄 Pełne Bazowanie'}
        </button>
        <button 
          onClick={onHomingZ} disabled={!isConnected || machineStatus === 'HOMING'}
          className={`${styles.btn} ${styles.btnInfo} ${(!isConnected || machineStatus === 'HOMING') ? styles.btnDisabled : ''}`}
        >
          🪝 Bazuj Z
        </button>
      </div>

      <div className={styles.instructions}>
        <strong style={{ color: '#fff' }}>Sterowanie:</strong><br/>
        <span style={{ display: 'block', marginTop: '5px' }}>• Jazda (trzymaj): <b>W S A D</b> (Możesz wciskać razem dla skosów!)</span>
        <span style={{ display: 'block', marginTop: '5px' }}>• Wysięgnik haka: <b>X</b> (Podnieś), <b>Z</b> (Opuść)</span>
        <span className={styles.warningText} style={{ display: 'block', marginTop: '5px' }}>• UWAGA: Puszczenie klawisza natychmiast zatrzymuje maszynę.</span>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label>Prędkość robocza: <strong>{speed}%</strong></label>
        <input 
          type="range" min="10" max="100" step="10" value={speed} disabled={!isConnected || machineStatus === 'HOMING'}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className={styles.speedInput}
        />
      </div>
    </div>
  )
}