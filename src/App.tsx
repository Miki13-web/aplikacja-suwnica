// src/App.tsx
import { useState, useRef } from 'react' // Zauważ: dodaliśmy useRef!
import { Header } from './components/Header'
import { CranePanel } from './components/CranePanel'
import { AgvPanel } from './components/AgvPanel'
import { FactoryMap } from './components/FactoryMap'
import './App.css'

function App() {
  const [isCraneOnline, setIsCraneOnline] = useState(false);
  const [isAgvOnline, setIsAgvOnline] = useState(false);
  const [ipAddress, setIpAddress] = useState('192.168.1.100');

  // Pozycja suwnicy to teraz wartości od 0 do 100 (%)
  // 50, 50 oznacza idealny środek mapy!
  const [cranePosition, setCranePosition] = useState({ x: 50, y: 50 });

  // Referencja do naszego "silnika" (pętli ruchu)
  const moveIntervalRef = useRef<number | null>(null);

  // Funkcja uruchamiana, GDY WCIŚNIESZ przycisk
  const startCraneMove = (dx: number, dy: number, speed: number) => {
    // Jeśli już jedziemy, nie odpalaj drugiego silnika
    if (moveIntervalRef.current !== null) return;

    // Uruchamiamy pętlę, która co 50 milisekund zmienia pozycję
    moveIntervalRef.current = window.setInterval(() => {
      setCranePosition(prev => {
        // Obliczamy o ile % ma się przesunąć (np. prędkość 100% to skok o 1% co 50ms)
        const moveAmount = (speed / 100) * 1.5; 
        
        // Zabezpieczenie przed wyjechaniem za mapę (trzymamy się w ramach 0-100)
        const newX = Math.max(0, Math.min(100, prev.x + dx * moveAmount));
        const newY = Math.max(0, Math.min(100, prev.y + dy * moveAmount));
        
        return { x: newX, y: newY };
      });
    }, 50); // 50ms = 20 klatek na sekundę
  };

  // Funkcja uruchamiana, GDY PUŚCISZ przycisk
  const stopCraneMove = () => {
    if (moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current); // Zatrzymujemy silnik
      moveIntervalRef.current = null;
    }
  };

  return (
    <div className="container">
      <Header />

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eef', borderRadius: '8px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Adres IP Fabryki (MQTT):</label>
        <input 
          type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}
          placeholder="np. 192.168.1.100"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '150px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
        <button onClick={() => setIsCraneOnline(!isCraneOnline)} className={isCraneOnline ? 'btn-danger' : 'btn-success'}>
          {isCraneOnline ? '🔴 Rozłącz Suwnicę' : '🟢 Połącz z Suwnicą'}
        </button>
        <button onClick={() => setIsAgvOnline(!isAgvOnline)} className={isAgvOnline ? 'btn-danger' : 'btn-success'}>
          {isAgvOnline ? '🔴 Rozłącz AGV' : '🟢 Połącz z AGV'}
        </button>
      </div>

      <div className="factory-map-container">
        <h3>📍 Główny Podgląd Hali (Live)</h3>
        {/* Kontener na mapę - wymuszamy wysokość i szerokość, żeby mapie było wygodnie! */}
        <div style={{ width: '100%', height: '300px' }}>
          <FactoryMap isCraneOnline={isCraneOnline} cranePosition={cranePosition} />
        </div>
      </div>

      <div className="dashboard-grid">
        <CranePanel 
          isConnected={isCraneOnline} 
          onStartMove={startCraneMove} 
          onStopMove={stopCraneMove} 
        />
        <AgvPanel isConnected={isAgvOnline} />
      </div>
    </div>
  )
}

export default App