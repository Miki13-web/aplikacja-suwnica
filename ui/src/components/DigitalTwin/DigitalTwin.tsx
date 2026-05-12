import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import styles from './DigitalTwin.module.css';

interface DigitalTwinProps {
  realX: number;
  realY: number;
  realZ: number;
  angleX?: number;
  angleY?: number;
}

// Model suwnicy jako wewnętrzny komponent Three.js
function SuwnicaNativeModel({ x, y, z, angleX = 0, angleY = 0 }: { x: number, y: number, z: number, angleX?: number, angleY?: number }) {
  const H = 700;    
  const L = 1290;   
  const W = 750;    

  return (
    <group position={[-L / 2, 0, -W / 2]}>
      
      <mesh position={[L / 2, -2, W / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <group position={[0, H, 0]}>
        {/* Odbojniki mostu */}
        <mesh position={[0, 0, W / 2]}><boxGeometry args={[40, 40, W + 40]} /><meshStandardMaterial color="#444" /></mesh>
        <mesh position={[L, 0, W / 2]}><boxGeometry args={[40, 40, W + 40]} /><meshStandardMaterial color="#444" /></mesh>
        <mesh position={[L / 2, 0, 0]}><boxGeometry args={[L + 40, 40, 40]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[L / 2, 0, W]}><boxGeometry args={[L + 40, 40, 40]} /><meshStandardMaterial color="#333" /></mesh>

        <group position={[0, -20, y]}>
          {/* Most */}
          <mesh position={[L / 2, 0, 0]}>
            <boxGeometry args={[L, 40, 50]} />
            <meshStandardMaterial color="#f1c40f" />
          </mesh>

          <group position={[x, -25, 0]}>
            {/* Wózek */}
            <mesh>
              <boxGeometry args={[80, 50, 80]} />
              <meshStandardMaterial color="#2980b9" />
            </mesh>

            {/* Pivot Rotacji (Sway) i Hak */}
            <group rotation={[angleY, 0, angleX]}>
              <mesh position={[0, -z / 2, 0]}>
                <cylinderGeometry args={[2, 2, Math.abs(z) || 0.1]} />
                <meshStandardMaterial color="#888" />
              </mesh>
              <mesh position={[0, -z, 0]}>
                <cylinderGeometry args={[20, 20, 40]} />
                <meshStandardMaterial color="#e74c3c" />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export function DigitalTwinScene({ realX, realY, realZ, angleX = 0, angleY = 0 }: DigitalTwinProps) {
  // PRZYWRÓCONE STANY DLA TRYBU TESTOWEGO
  const [isTestMode, setIsTestMode] = useState(true); 
  const [testX, setTestX] = useState(645);
  const [testY, setTestY] = useState(375);
  const [testZ, setTestZ] = useState(350);
  const [testSwayX, setTestSwayX] = useState(0);
  const [testSwayY, setTestSwayY] = useState(0);

  // Wybór między danymi z MQTT (real) a suwakami (test)
  const activeX = isTestMode ? testX : realX;
  const activeY = isTestMode ? testY : realY;
  const activeZ = isTestMode ? testZ : realZ;
  const activeAngleX = isTestMode ? testSwayX : angleX;
  const activeAngleY = isTestMode ? testSwayY : angleY;

  return (
    <div className={styles.sceneWrapper}>
      
      {/* PRZYWRÓCONY PANEL KONTROLNY Z SUWAKAMI */}
      <div className={styles.controlOverlay}>
        <label className={styles.testModeToggle}>
          <input 
            type="checkbox" 
            checked={isTestMode} 
            onChange={(e) => setIsTestMode(e.target.checked)} 
            style={{ marginRight: '10px', transform: 'scale(1.3)' }} 
          />
          {isTestMode ? '🛠️ TRYB TESTOWY' : '📡 TRYB LIVE'}
        </label>

        {isTestMode && (
          <div className={styles.sliderGroup}>
            <div className={styles.sliderItem}>
              Oś X (Wózek): {testX} mm 
              <input type="range" min="0" max="1290" value={testX} onChange={e => setTestX(Number(e.target.value))} className={styles.sliderInput} />
            </div>
            <div className={styles.sliderItem}>
              Oś Y (Most): {testY} mm 
              <input type="range" min="0" max="750" value={testY} onChange={e => setTestY(Number(e.target.value))} className={styles.sliderInput} />
            </div>
            <div className={styles.sliderItem}>
              Oś Z (Hak w dół): {testZ} mm 
              <input type="range" min="0" max="700" value={testZ} onChange={e => setTestZ(Number(e.target.value))} className={styles.sliderInput} />
            </div>
            
            <div className={`${styles.sliderItem} ${styles.swaySection}`}>
              Wychylenie X: {testSwayX.toFixed(2)} rad 
              <input type="range" min="-0.5" max="0.5" step="0.01" value={testSwayX} onChange={e => setTestSwayX(Number(e.target.value))} className={styles.sliderInput} />
            </div>
            <div className={styles.sliderItem}>
              Wychylenie Y: {testSwayY.toFixed(2)} rad 
              <input type="range" min="-0.5" max="0.5" step="0.01" value={testSwayY} onChange={e => setTestSwayY(Number(e.target.value))} className={styles.sliderInput} />
            </div>
          </div>
        )}
      </div>

      {/* SCENA 3D */}
      <Canvas camera={{ position: [1800, 1500, 1800], fov: 40, near: 1, far: 10000 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[2000, 3000, 2000]} intensity={1.5} />
        <pointLight position={[-1000, 2000, -1000]} intensity={0.5} />
        
        <SuwnicaNativeModel 
          x={activeX} 
          y={activeY} 
          z={activeZ} 
          angleX={activeAngleX} 
          angleY={activeAngleY} 
        />
        
        <Grid infiniteGrid fadeDistance={5000} cellColor="#333" sectionSize={100} sectionThickness={1.5} />
        <OrbitControls makeDefault enableRotate={false} target={[0, 350, 0]} />
      </Canvas>
    </div>
  );
}