import { useState } from 'react';
import { Header } from './components/Header/Header';
import { CranePanel } from './components/CranePanel/CranePanel';
import { AgvPanel } from './components/AgvPanel/AgvPanel';
import { FactoryMap } from './components/FactoryMap/FactoryMap';
import { DigitalTwinScene } from './components/DigitalTwin/DigitalTwin';
import { useMqtt } from './hooks/useMqtt';
import styles from './App.module.css';

function App() {
  // Stan adresów IP - zmiana w polu tekstowym od razu aktualizuje adres dla MQTT
  const [craneIp, setCraneIp] = useState('10.10.133.198');
  const [agvIp, setAgvIp] = useState('0.0.0.0');

  const [isAgvOnline, setIsAgvOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');

  // Hook obsługujący całą komunikację MQTT
  const {
    isCraneOnline, machineStatus, rawTelemetry, cranePosition, isRecording, debugMqttPayload,
    toggleCraneConnection, setMovement, triggerHoming, triggerHomingZ, triggerRecording
  } = useMqtt(craneIp);

  // przeliczanie radianów na stopnie i wartość bezwzględna dla wyświetlania w terminalu
  const degX = Math.abs(rawTelemetry.angleX * (180 / Math.PI)).toFixed(1);
  const degY = Math.abs(rawTelemetry.angleY * (180 / Math.PI)).toFixed(1);

  // Funkcja wyzwalająca nagrywanie
  const handleRecordingToggle = () => {
    triggerRecording(!isRecording);
  };

  return (
    <div className={styles.container}>
      {/* Nagłówek jest teraz wyśrodkowany w swoim własnym pliku/stylu */}
      <Header />

      {/* PASEK NARZĘDZIOWY (TOOLBAR) */}
      <div className={styles.controlToolbar}>

        {/* Sekcja Suwnicy */}
        <div className={styles.deviceSection}>
          <span className={styles.ipLabel}>IP suwnica</span>
          <input
            className={styles.ipInput}
            value={craneIp}
            onChange={(e) => setCraneIp(e.target.value)}
            spellCheck="false"
          />
          <button
            onClick={toggleCraneConnection}
            className={`${styles.btnAction} ${isCraneOnline ? styles.btnOffline : styles.btnOnline}`}
          >
            {isCraneOnline ? 'Disconnect' : 'Connect'}
          </button>

          {/* NOWY PRZYCISK: Nagrywanie HDF5 */}
          <button
            onClick={handleRecordingToggle}
            disabled={!isCraneOnline}
            style={{
              marginLeft: '10px',
              padding: '6px 14px',
              backgroundColor: isRecording ? '#ff4444' : '#2b2b2b',
              color: '#fff',
              border: isRecording ? '1px solid #ff0000' : '1px solid #444',
              borderRadius: '4px',
              cursor: isCraneOnline ? 'pointer' : 'not-allowed',
              opacity: isCraneOnline ? 1 : 0.5,
              fontWeight: 'bold',
              transition: 'all 0.2s',
              boxShadow: isRecording ? '0 0 10px rgba(255, 68, 68, 0.4)' : 'none'
            }}
          >
            {isRecording ? '⏹ STOP REC' : '⏺ START REC'}
          </button>
        </div>

        {/* Separator wizualny */}
        <div style={{ width: '1px', height: '35px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* Sekcja AGV */}
        <div className={styles.deviceSection}>
          <span className={styles.ipLabel}>IP AGV</span>
          <input
            className={styles.ipInput}
            value={agvIp}
            onChange={(e) => setAgvIp(e.target.value)}
            spellCheck="false"
          />
          <button
            onClick={() => setIsAgvOnline(!isAgvOnline)}
            className={`${styles.btnAction} ${isAgvOnline ? styles.btnOffline : styles.btnOnline}`}
          >
            {isAgvOnline ? 'Disconnect' : 'Connect'}
          </button>
        </div>

      </div>

      {/* PODGLĄD HALI (MAPA / 3D) */}
      <div className={styles.factoryMapContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#e0e0e0', fontFamily: 'Saira Stencil' }}>Live HALA View</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setViewMode('2D')}
              style={{ padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', border: viewMode === '2D' ? '1px solid #00d2ff' : '1px solid #444', background: viewMode === '2D' ? 'rgba(0, 210, 255, 0.2)' : 'transparent', color: '#fff' }}
            >2D</button>
            <button
              onClick={() => setViewMode('3D')}
              style={{ padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', border: viewMode === '3D' ? '1px solid #00d2ff' : '1px solid #444', background: viewMode === '3D' ? 'rgba(0, 210, 255, 0.2)' : 'transparent', color: '#fff' }}
            >3D</button>
          </div>
        </div>

        <div style={{ backgroundColor: '#111', padding: '12px', borderRadius: '6px', border: '1px solid #333', marginBottom: '20px', fontFamily: 'monospace', color: '#00d2ff', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
          {/* Pozycje XYZ */}
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '20px', borderBottom: '1px dashed #333', paddingBottom: '10px', marginBottom: '10px' }}>
            <div>X: <span style={{ color: '#fff' }}>{Number(rawTelemetry.x).toFixed(1)}</span> <span style={{ color: '#555', fontSize: '14px' }}>mm</span></div>
            <div>Y: <span style={{ color: '#fff' }}>{Number(rawTelemetry.y).toFixed(1)}</span> <span style={{ color: '#555', fontSize: '14px' }}>mm</span></div>
            <div>Z: <span style={{ color: '#fff' }}>{Number(rawTelemetry.z).toFixed(1)}</span> <span style={{ color: '#555', fontSize: '14px' }}>mm</span></div>
          </div>
          {/* Wychylenia w stopniach */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '16px' }}>
            <div>Sway X: <span style={{ color: '#ffeb3b' }}>{degX}°</span> <span style={{ color: '#555', fontSize: '14px' }}>od pionu</span></div>
            <div>Sway Y: <span style={{ color: '#ffeb3b' }}>{degY}°</span> <span style={{ color: '#555', fontSize: '14px' }}>od pionu</span></div>
          </div>
        </div>

        {viewMode === '2D' ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
            {/* Mapa 2D */}
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <FactoryMap isCraneOnline={isCraneOnline} cranePosition={cranePosition} />
            </div>

            {/* Pionowy wskaźnik osi Z */}
            <div style={{ width: '80px', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #444', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
              <div style={{ padding: '8px 0', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #444', width: '100%', textAlign: 'center', backgroundColor: '#2b2b2b', zIndex: 10 }}>HAK Z</div>
              <div style={{ width: '2px', backgroundColor: '#444', position: 'absolute', top: '0', bottom: '0', zIndex: 1 }} />

              <div style={{
                position: 'absolute',
                /* Math.min(850, ...) blokuje ikonkę na 850mm, żeby nie wyszła poza panel */
                top: `calc(35px + (100% - 65px) * (${Math.min(850, Math.max(0, rawTelemetry.z)) / 850}))`,
                transition: 'top 100ms linear',
                fontSize: '24px',
                zIndex: 5,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))'
              }}>
                🪝
              </div>
            </div>
          </div>
        ) : (
          <DigitalTwinScene
            realX={rawTelemetry.x}
            realY={rawTelemetry.y}
            realZ={rawTelemetry.z}
            angleX={rawTelemetry.angleX}
            angleY={rawTelemetry.angleY}
          />
        )}
      </div>

      {/* PANELE STEROWANIA URZĄDZENIAMI */}
      <div className={styles.dashboardGrid}>
        <CranePanel
          isConnected={isCraneOnline}
          machineStatus={machineStatus}
          onSetMovement={setMovement}
          onHoming={triggerHoming}
          onHomingZ={triggerHomingZ}
        />
        <AgvPanel isConnected={isAgvOnline} />
      </div>
    </div>
  );
}

export default App;