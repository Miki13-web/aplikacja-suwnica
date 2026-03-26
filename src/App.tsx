// src/App.tsx
import { useState, useRef } from 'react';
import mqtt from 'mqtt';
import { Header } from './components/Header';
import { CranePanel } from './components/CranePanel';
import { AgvPanel } from './components/AgvPanel';
import { FactoryMap } from './components/FactoryMap';
import './App.css';

function App() {
  const [isCraneOnline, setIsCraneOnline] = useState(false);
  const [isAgvOnline, setIsAgvOnline] = useState(false);
  const [ipAddress, setIpAddress] = useState('192.168.1.100');

  // Pozycja suwnicy: X i Y to mapa (0-100%). Z to hak: 0 = max w górze, 100 = max opuszczony
  const [cranePosition, setCranePosition] = useState({ x: 50, y: 50, z: 0 });

  // Pudełko na aktualny wektor ruchu (żeby setInterval mógł go czytać na żywo)
  const currentDirectionRef = useRef({ dx: 0, dy: 0, dz: 0, speed: 50 });
  
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const moveIntervalRef = useRef<number | null>(null);

  const toggleCraneConnection = () => {
    if (ipAddress.toLowerCase() === 'test') {
      setIsCraneOnline(!isCraneOnline);
      return;
    }

    if (isCraneOnline) {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
        mqttClientRef.current = null;
      }
      setIsCraneOnline(false);
      return;
    }

    const brokerUrl = `ws://${ipAddress}:9001`; 
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => { setIsCraneOnline(true); });
    client.on('error', (err) => {
      console.error('Błąd:', err);
      alert('Nie udało się połączyć!');
      client.end();
      setIsCraneOnline(false);
    });

    mqttClientRef.current = client;
  };

  // --- DYNAMICZNY SILNIK RUCHU ---
  const handleSetMovement = (dx: number, dy: number, dz: number, speed: number) => {
    // 1. Zapisujemy w pamięci aktualny kierunek (np. wciśnięto Prawy i Górę)
    currentDirectionRef.current = { dx, dy, dz, speed };

    // 2. Jeśli wszystkie klawisze puszczone -> Wyłączamy silnik i hamujemy
    if (dx === 0 && dy === 0 && dz === 0) {
      if (moveIntervalRef.current !== null) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
        
        const client = mqttClientRef.current;
        if (client && isCraneOnline && ipAddress.toLowerCase() !== 'test') {
          client.publish('fabryka/suwnica/sterowanie', JSON.stringify({ akcja: 'STOP' }));
        }
      }
      return;
    }

    // 3. Jeśli silnik jest wyłączony, a my chcemy jechać -> Odpalamy zapłon
    if (moveIntervalRef.current === null) {
      moveIntervalRef.current = window.setInterval(() => {
        const dir = currentDirectionRef.current; // Odczytujemy kierunek "na żywo"
        const client = mqttClientRef.current;

        // Strzelamy komendą w sprzęt
        if (client && isCraneOnline && ipAddress.toLowerCase() !== 'test') {
          const payload = JSON.stringify({ kierunekX: dir.dx, kierunekY: dir.dy, kierunekZ: dir.dz, predkosc: dir.speed });
          client.publish('fabryka/suwnica/sterowanie', payload);
        }

        // Animacja UI
        setCranePosition(prev => {
          const moveAmount = (dir.speed / 100) * 1.5;
          const newX = Math.max(0, Math.min(100, prev.x + dir.dx * moveAmount));
          const newY = Math.max(0, Math.min(100, prev.y + dir.dy * moveAmount));
          
          // Oś Z: Jeśli dz=1 (podnosimy), to Z maleje do 0. Jeśli dz=-1 (opuszczamy), to Z rośnie do 100.
          const newZ = Math.max(0, Math.min(100, prev.z - dir.dz * moveAmount));
          
          return { x: newX, y: newY, z: newZ };
        });
      }, 50);
    }
  };

  return (
    <div className="container">
      <Header />

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eef', borderRadius: '8px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Adres IP Fabryki (lub wpisz "test"):</label>
        <input 
          type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}
          placeholder="np. 192.168.1.100"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
        <button onClick={toggleCraneConnection} className={isCraneOnline ? 'btn-danger' : 'btn-success'}>
          {isCraneOnline ? '🔴 Rozłącz Suwnicę' : '🟢 Połącz z Suwnicą'}
        </button>
        <button onClick={() => setIsAgvOnline(!isAgvOnline)} className={isAgvOnline ? 'btn-danger' : 'btn-success'}>
          {isAgvOnline ? '🔴 Rozłącz AGV' : '🟢 Połącz z AGV'}
        </button>
      </div>

      <div className="factory-map-container">
        <h3>📍 Główny Podgląd Hali (Live)</h3>
        
        {/* NOWY LAYOUT: MAPA + HAK OBOK SIEBIE */}
        <div style={{ display: 'flex', gap: '20px', height: '300px' }}>
          
          {/* Lewa strona: Mapa X/Y */}
          <div style={{ flexGrow: 1, height: '100%' }}>
            <FactoryMap isCraneOnline={isCraneOnline} cranePosition={cranePosition} />
          </div>

          {/* Prawa strona: Wskaźnik Haka (Oś Z) */}
          <div style={{ 
            width: '80px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '2px solid #ccc', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '5px', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #ddd', width: '100%', textAlign: 'center', backgroundColor: '#e9ecef', zIndex: 10 }}>HAK</div>
            
            {/* Linka suwnicy */}
            <div style={{ width: '4px', backgroundColor: '#333', position: 'absolute', top: '0', bottom: '0', zIndex: 1 }} />
            
            {/* Animowany hak wędrujący góra/dół */}
            <div style={{
              position: 'absolute',
              // Konwertujemy pozycję Z (0-100) na wysokość w pikselach/procentach
              top: `calc(30px + ${cranePosition.z}% * 0.75)`, 
              transition: 'top 50ms linear',
              fontSize: '28px',
              zIndex: 5,
              backgroundColor: '#f8f9fa' // Zasłania linę "nad" hakiem
            }}>
              🪝
            </div>
          </div>

        </div>
      </div>

      <div className="dashboard-grid">
        {/* Przekazujemy naszą nową, uniwersalną funkcję */}
        <CranePanel 
          isConnected={isCraneOnline} 
          onSetMovement={handleSetMovement} 
        />
        <AgvPanel isConnected={isAgvOnline} />
      </div>
    </div>
  )
}

export default App;