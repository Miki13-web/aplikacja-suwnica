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
    isCraneOnline, machineStatus, rawTelemetry, cranePosition, debugMqttPayload,
    toggleCraneConnection, setMovement, triggerHoming, triggerHomingZ
  } = useMqtt(craneIp);

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

      {/* TERMINAL DIAGNOSTYCZNY */}
      <div className={styles.debugTerminal}>
        <code style={{ color: '#0f0' }}>[STATUS]: {machineStatus} | [RAW]: {debugMqttPayload}</code>
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

        {viewMode === '2D' ? (
          <FactoryMap isCraneOnline={isCraneOnline} cranePosition={cranePosition} />
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