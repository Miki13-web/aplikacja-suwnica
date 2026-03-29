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
  const [machineStatus, setMachineStatus] = useState('DISCONNECTED'); // Status bazowania

  // Pozycja sterowana przez telemetrię z malinki
  const [cranePosition, setCranePosition] = useState({ x: 0, y: 0, z: 0 });

  const currentDirectionRef = useRef({ dx: 0, dy: 0, dz: 0, speed: 50 });
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const moveIntervalRef = useRef<number | null>(null);

  // --- TWOJE NOWE, APTEKARSKIE KALIBRACJE ---
  const WORKSPACE_WIDTH = 1290.0;
  const WORKSPACE_HEIGHT = 750.0;

  const toggleCraneConnection = () => {
    if (isCraneOnline) {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
        mqttClientRef.current = null;
      }
      setIsCraneOnline(false);
      setMachineStatus('DISCONNECTED');
      return;
    }

    // ŁĄCZENIE PO TWOIM IP Z INPUTA
    const brokerUrl = `ws://${ipAddress}:9001`; 
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => { 
      setIsCraneOnline(true);
      setMachineStatus('CONNECTED');
      client.subscribe('fabryka/suwnica/telemetria');
    });

    client.on('message', (topic, message) => {
      if (topic === 'fabryka/suwnica/telemetria') {
        try {
          const data = JSON.parse(message.toString());
          
          // Aktualizacja statusu (czy maszyna się bazuje, czy jest gotowa)
          if (data.status) setMachineStatus(data.status);

          // Czyste obliczenie procentów na podstawie nowych limitów roboczych
          let percentX = (data.x / WORKSPACE_WIDTH) * 100;
          let percentY = (data.y / WORKSPACE_HEIGHT) * 100;

          // Zabezpieczenie przed wyjechaniem poza UI
          percentX = Math.max(0, Math.min(100, percentX));
          percentY = Math.max(0, Math.min(100, percentY));

          setCranePosition({ x: percentX, y: percentY, z: data.z || 0 });
        } catch (e) {
          console.error("Błąd telemetrii");
        }
      }
    });

    client.on('error', () => {
      alert('Nie udało się połączyć. Sprawdź IP i działanie malinki.');
      client.end();
      setIsCraneOnline(false);
      setMachineStatus('DISCONNECTED');
    });

    mqttClientRef.current = client;
  };

  const handleSetMovement = (dx: number, dy: number, dz: number, speed: number) => {
    currentDirectionRef.current = { dx, dy, dz, speed };

    if (dx === 0 && dy === 0 && dz === 0) {
      if (moveIntervalRef.current !== null) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
        
        if (mqttClientRef.current && isCraneOnline) {
          mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ akcja: 'STOP' }));
        }
      }
      return;
    }

    if (moveIntervalRef.current === null) {
      moveIntervalRef.current = window.setInterval(() => {
        const dir = currentDirectionRef.current;
        if (mqttClientRef.current && isCraneOnline) {
          const payload = JSON.stringify({ kierunekX: dir.dx, kierunekY: dir.dy, kierunekZ: dir.dz, predkosc: dir.speed });
          mqttClientRef.current.publish('fabryka/suwnica/sterowanie', payload);
        }
      }, 50); // Strzelamy komendą ruchu 20 razy na sekundę
    }
  };

  // Komenda wyzwalająca bazowanie
  const handleHoming = () => {
    if (mqttClientRef.current && isCraneOnline) {
      mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ bazuj: true }));
    }
  };

  return (
    <div className="container">
      <Header />

      {/* PRZYWRÓCONE POLE IP */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eef', borderRadius: '8px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Adres IP Fabryki:</label>
        <input 
          type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}
          placeholder="np. 192.168.1.100"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
        />
      </div>

      {/* PRZYWRÓCONE PRZYCISKI POŁĄCZEŃ */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
        <button onClick={toggleCraneConnection} className={isCraneOnline ? 'btn-danger' : 'btn-success'}>
          {isCraneOnline ? '🔴 Rozłącz Suwnicę' : '🟢 Połącz z Suwnicą'}
        </button>
        <button onClick={() => setIsAgvOnline(!isAgvOnline)} className={isAgvOnline ? 'btn-danger' : 'btn-success'}>
          {isAgvOnline ? '🔴 Rozłącz AGV' : '🟢 Połącz z AGV'}
        </button>
      </div>

      {/* MAPA HALI (Digital Twin) */}
      <div className="factory-map-container">
        <h3>📍 Główny Podgląd Hali (Live Digital Twin)</h3>
        <div style={{ display: 'flex', gap: '20px', height: '300px' }}>
          
          <div style={{ flexGrow: 1, height: '100%' }}>
            <FactoryMap isCraneOnline={isCraneOnline} cranePosition={cranePosition} />
          </div>

          <div style={{ width: '80px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '2px solid #ccc', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ padding: '5px', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #ddd', width: '100%', textAlign: 'center', backgroundColor: '#e9ecef', zIndex: 10 }}>HAK</div>
            <div style={{ width: '4px', backgroundColor: '#333', position: 'absolute', top: '0', bottom: '0', zIndex: 1 }} />
            <div style={{
              position: 'absolute',
              top: `calc(30px + ${cranePosition.z}% * 0.75)`, 
              transition: 'top 50ms linear',
              fontSize: '28px',
              zIndex: 5,
              backgroundColor: '#f8f9fa'
            }}>
              🪝
            </div>
          </div>

        </div>
      </div>

      {/* PANELE STEROWANIA */}
      <div className="dashboard-grid">
        <CranePanel 
          isConnected={isCraneOnline} 
          machineStatus={machineStatus}
          onSetMovement={handleSetMovement} 
          onHoming={handleHoming}
        />
        <AgvPanel isConnected={isAgvOnline} />
      </div>
    </div>
  );
}

export default App;