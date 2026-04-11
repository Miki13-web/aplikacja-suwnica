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
  const [machineStatus, setMachineStatus] = useState('DISCONNECTED');

  const [cranePosition, setCranePosition] = useState({ x: 0, y: 0, z: 0 });
  const [rawTelemetry, setRawTelemetry] = useState({ x: 0, y: 0, z: 0 });
  
  const [debugMqttPayload, setDebugMqttPayload] = useState('Oczekiwanie na pierwsze dane...');

  const currentDirectionRef = useRef({ dx: 0, dy: 0, dz: 0, speed: 70 });
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const moveIntervalRef = useRef<number | null>(null);

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

    const brokerUrl = `ws://${ipAddress}:9001`; 
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => { 
      setIsCraneOnline(true);
      setMachineStatus('CONNECTED');
      client.subscribe('fabryka/suwnica/telemetria');
    });

    client.on('message', (topic, message) => {
      if (topic === 'fabryka/suwnica/telemetria') {
        const payloadString = message.toString();
        setDebugMqttPayload(payloadString);

        try {
          const data = JSON.parse(payloadString);
          const safeX = typeof data.x === 'number' ? data.x : 0; 
          const safeY = typeof data.y === 'number' ? data.y : 0; 
          
          setRawTelemetry({ x: safeX, y: safeY, z: data.z || 0 });

          // PROCENTY: X to długa oś (1290), Y to krótka (750)
          const pX = (safeX / 1290.0) * 100;
          const pY = (safeY / 750.0) * 100;

          setCranePosition({ x: pX, y: pY, z: data.z || 0 });
        } catch (e) { console.error(e); }
      }
    });

    client.on('error', () => {
      alert('Nie udało się połączyć z MQTT.');
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
      }, 50); 
    }
  };

  const handleHoming = () => {
    if (mqttClientRef.current && isCraneOnline) {
      mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ bazuj: true }));
    }
  };

  // NOWE: Funkcja wysyłająca komendę bazowania TYLKO DLA OSI Z
  const handleHomingZ = () => {
    if (mqttClientRef.current && isCraneOnline) {
      mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ bazuj_z: true }));
    }
  };

  return (
    <div className="container">
      <Header />

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2b2b2b', borderRadius: '8px', border: '1px solid #3a3a3a' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#e0e0e0' }}>Adres IP Fabryki:</label>
        <input 
          type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)}
          placeholder="np. 192.168.1.100"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', width: '200px', backgroundColor: '#1a1a1a', color: '#fff' }}
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

      {/* TERMINAL DIAGNOSTYCZNY RAW MQTT */}
      <div style={{ backgroundColor: '#000', color: '#0f0', padding: '10px', fontFamily: 'monospace', fontSize: '14px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #333', textAlign: 'left' }}>
        <strong>DEBUG MQTT (RAW PAYLOAD):</strong><br/>
        {debugMqttPayload}
      </div>

      <div className="factory-map-container">
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#e0e0e0' }}>📍 Główny Podgląd Hali</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #333', marginBottom: '20px', fontFamily: 'monospace', fontSize: '22px', color: '#00d2ff', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
          <div>X: <span style={{ color: '#fff' }}>{Number(rawTelemetry.x).toFixed(1)}</span> <span style={{ color: '#555', fontSize: '14px' }}>mm</span></div>
          <div>Y: <span style={{ color: '#fff' }}>{Number(rawTelemetry.y).toFixed(1)}</span> <span style={{ color: '#555', fontSize: '14px' }}>mm</span></div>
          <div>Z: <span style={{ color: '#fff' }}>{Number(rawTelemetry.z).toFixed(1)}</span> <span style={{ color: '#555', fontSize: '14px' }}>j</span></div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <FactoryMap isCraneOnline={isCraneOnline} cranePosition={cranePosition} />
          </div>

          <div style={{ width: '80px', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #444', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ padding: '8px 0', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #444', width: '100%', textAlign: 'center', backgroundColor: '#2b2b2b', zIndex: 10 }}>HAK</div>
            <div style={{ width: '2px', backgroundColor: '#444', position: 'absolute', top: '0', bottom: '0', zIndex: 1 }} />
            <div style={{
              position: 'absolute',
              // NOWE LOGIKA Z: Używamy Math.abs, więc dla wartości na minusie (-500) odczyt robi się dodatni (500) 
              // i opuszcza hak proporcjonalnie w dół. Hak nie wyjedzie za kontener dzięki zablokowaniu min na 500j.
              top: `calc(35px + (100% - 65px) * (${Math.min(500, Math.abs(rawTelemetry.z)) / 500}))`, 
              transition: 'top 100ms linear',
              fontSize: '24px',
              zIndex: 5,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))'
            }}>
              🪝
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <CranePanel 
          isConnected={isCraneOnline} 
          machineStatus={machineStatus} 
          onSetMovement={handleSetMovement} 
          onHoming={handleHoming} 
          onHomingZ={handleHomingZ} // Podpięcie nowej funkcji
        />
        <AgvPanel isConnected={isAgvOnline} />
      </div>
    </div>
  );
}

export default App;