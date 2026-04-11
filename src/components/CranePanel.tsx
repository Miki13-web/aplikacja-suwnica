import { useState, useEffect, useRef } from 'react';

interface CranePanelProps {
  isConnected: boolean;
  machineStatus: string;
  onSetMovement: (dx: number, dy: number, dz: number, speed: number) => void;
  onHoming: () => void;
  onHomingZ: () => void; // NOWE: Prop do bazowania samej osi Z
}

export function CranePanel({ isConnected, machineStatus, onSetMovement, onHoming, onHomingZ }: CranePanelProps) {
  const [speed, setSpeed] = useState(50);
  
  // Zbiór aktywnych klawiszy - TO POZWALA NA JAZDĘ PO SKOSIE!
  const activeKeys = useRef(new Set<string>());
  const movementCallback = useRef(onSetMovement);

  useEffect(() => { movementCallback.current = onSetMovement; }, [onSetMovement]);

  useEffect(() => {
    const updateMovement = () => {
      let dx = 0, dy = 0, dz = 0;
      const keys = activeKeys.current;

      // Obliczanie wektora ruchu. Jeśli trzymasz 'W' i 'D', dx=1 oraz dy=-1
      if (keys.has('w') || keys.has('arrowup')) dy -= 1;
      if (keys.has('s') || keys.has('arrowdown')) dy += 1;
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
      if (keys.has('d') || keys.has('arrowright')) dx += 1;
      if (keys.has('x')) dz += 1; // Podnoszenie na X
      if (keys.has('z')) dz -= 1; // Opuszczanie na Z

      // Wysyłanie aktualnego stanu do głównego komponentu
      movementCallback.current(dx, dy, dz, speed);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignoruj wpisywanie w pola tekstowe
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      
      // Zabezpieczenie przed "spamowaniem" klawisza przez system lub jazdą w trakcie bazowania
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
        activeKeys.current.delete(key); // Usuwa tylko ten jeden puszczony klawisz
        updateMovement(); // Jeśli puścisz wszystko, dx=0, dy=0, dz=0 (czyli STOP)
      }
    };

    // ⚠️ DEADMAN'S SWITCH: Zatrzymanie awaryjne przy zgubieniu okna!
    const handleBlur = () => {
      activeKeys.current.clear();
      updateMovement(); // Wysyła wektor zerowy
    };

    // Podpinanie nasłuchiwaczy
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Sprzątanie po odmontowaniu komponentu
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isConnected, speed, machineStatus]);

  return (
    <div className="panel">
      <h2>Suwnica (Dual ESP32)</h2>
      <p>Status: {
        isConnected 
        ? (machineStatus === 'HOMING' ? <strong style={{ color: 'orange' }}>⚙️ BAZOWANIE...</strong> : <strong style={{ color: 'green' }}>🟢 Połączono</strong>)
        : <strong style={{ color: 'red' }}>🔴 Rozłączono</strong>
      }</p>
      
      {/* PRZYCISKI BAZOWANIA (Zgrupowane i wyrównane poziomo) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={onHoming} 
          disabled={!isConnected || machineStatus === 'HOMING'}
          style={{ flex: 2, padding: '10px', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}
        >
          {machineStatus === 'HOMING' ? '⚙️ BAZOWANIE TRWA...' : '🔄 Pełne Bazowanie'}
        </button>
        <button 
          onClick={onHomingZ} 
          disabled={!isConnected || machineStatus === 'HOMING'}
          style={{ flex: 1, padding: '10px', backgroundColor: '#5bc0de', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', color: '#000' }}
        >
          🪝 Bazuj Z
        </button>
      </div>

      <div style={{ fontSize: '13px', color: '#ccc', backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #444' }}>
        <strong style={{ color: '#fff' }}>Sterowanie Klawiaturą (Czuwak):</strong><br/>
        <span style={{ display: 'block', marginTop: '5px' }}>• Jazda (trzymaj): <b>W S A D</b> (Możesz wciskać razem dla skosów!)</span>
        <span style={{ display: 'block', marginTop: '5px' }}>• Wysięgnik haka: <b>X</b> (Podnieś), <b>Z</b> (Opuść)</span>
        <span style={{ display: 'block', marginTop: '5px', color: '#ff6b6b' }}>• UWAGA: Puszczenie klawisza natychmiast zatrzymuje maszynę.</span>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label>Prędkość robocza: <strong>{speed}%</strong></label>
        <input 
          type="range" min="10" max="100" step="10" value={speed} disabled={!isConnected || machineStatus === 'HOMING'}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: '100%', marginTop: '5px', cursor: 'pointer' }}
        />
      </div>

    </div>
  )
}