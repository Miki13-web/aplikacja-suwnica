// src/components/DigitalTwin.tsx
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

interface DigitalTwinProps {
  realX: number;
  realY: number;
  realZ: number;
}

function SuwnicaNativeModel({ x, y, z }: { x: number, y: number, z: number }) {
  const H = 700;    // Wysokość ramy (sufit)
  const L = 1290;   // Długość (X)
  const W = 750;    // Szerokość/Głębokość (Y)

  return (
    // Przesunięcie całej sceny tak, aby środek obszaru był w punkcie [0,0,0] dla kamery
    <group position={[-L / 2, 0, -W / 2]}>
      
      {/* 1. OBSZAR ROBOCZY (Podłoga i obrys) */}
      <mesh position={[L / 2, -2, W / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* 2. RAMA STAŁA NA SUFICIE (Wysokość 700) */}
      <group position={[0, H, 0]}>
        {/* Szyny wzdłużne (750mm) */}
        <mesh position={[0, 0, W / 2]}>
          <boxGeometry args={[40, 40, W + 40]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[L, 0, W / 2]}>
          <boxGeometry args={[40, 40, W + 40]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Belki poprzeczne ramy */}
        <mesh position={[L / 2, 0, 0]}>
          <boxGeometry args={[L + 40, 40, 40]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[L / 2, 0, W]}>
          <boxGeometry args={[L + 40, 40, 40]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* 3. MOST (Porusza się wzdłuż W/Głębokości) */}
        <group position={[0, -20, y]}>
          <mesh position={[L / 2, 0, 0]}>
            <boxGeometry args={[L, 40, 50]} />
            <meshStandardMaterial color="#f1c40f" />
          </mesh>

          {/* 4. WÓZEK (Porusza się wzdłuż Mostu/L) */}
          <group position={[x, -25, 0]}>
            <mesh>
              <boxGeometry args={[80, 50, 80]} />
              <meshStandardMaterial color="#2980b9" />
            </mesh>

            {/* 5. DYNAMICZNA LINKA I HAK */}
            {/* Linka (skaluje się od wózka w dół) */}
            <mesh position={[0, z / 2, 0]}>
              <cylinderGeometry args={[2, 2, Math.abs(z) || 0.1]} />
              <meshStandardMaterial color="#888" />
            </mesh>

            {/* Hak (na samym dole linki) */}
            <mesh position={[0, z, 0]}>
              <cylinderGeometry args={[20, 20, 40]} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export function DigitalTwinScene({ realX, realY, realZ }: DigitalTwinProps) {
  const [isTestMode, setIsTestMode] = useState(true); 
  const [testX, setTestX] = useState(645);
  const [testY, setTestY] = useState(375);
  const [testZ, setTestZ] = useState(-350);

  const activeX = isTestMode ? testX : realX;
  const activeY = isTestMode ? testY : realY;
  const activeZ = isTestMode ? testZ : realZ;

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', backgroundColor: '#050505', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* PANEL STEROWANIA */}
      <div style={{ position: 'absolute', top: 15, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.85)', padding: '15px', borderRadius: '8px', color: 'white', border: '1px solid #333', width: '260px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}>
          <input type="checkbox" checked={isTestMode} onChange={(e) => setIsTestMode(e.target.checked)} style={{ marginRight: '10px', transform: 'scale(1.3)' }} />
          {isTestMode ? '🛠️ TRYB TESTOWY' : '📡 TRYB LIVE'}
        </label>

        {isTestMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '12px' }}>Oś X (Wózek): {testX} mm <input type="range" min="0" max="1290" value={testX} onChange={e => setTestX(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div style={{ fontSize: '12px' }}>Oś Y (Most): {testY} mm <input type="range" min="0" max="750" value={testY} onChange={e => setTestY(Number(e.target.value))} style={{ width: '100%' }} /></div>
            <div style={{ fontSize: '12px' }}>Oś Z (Hak): {testZ} mm <input type="range" min="-700" max="0" value={testZ} onChange={e => setTestZ(Number(e.target.value))} style={{ width: '100%' }} /></div>
          </div>
        )}
      </div>

      <Canvas 
        // Kamera ustawiona pod kątem, patrząca na środek pola
        camera={{ position: [1800, 1500, 1800], fov: 40, near: 1, far: 10000 }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[2000, 3000, 2000]} intensity={1.5} />
        <pointLight position={[-1000, 2000, -1000]} intensity={0.5} />
        
        <SuwnicaNativeModel x={activeX} y={activeY} z={activeZ} />
        
        <Grid infiniteGrid fadeDistance={5000} cellColor="#333" sectionSize={100} sectionThickness={1.5} />
        
        {/* OrbitControls: enableRotate={false} sprawia, że kamera jest nieruchoma (możesz tylko przybliżać) */}
        <OrbitControls makeDefault enableRotate={false} target={[0, 350, 0]} />
      </Canvas>
    </div>
  );
}