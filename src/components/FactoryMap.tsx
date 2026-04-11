// src/components/FactoryMap.tsx
interface FactoryMapProps {
  isCraneOnline: boolean;
  cranePosition: { x: number; y: number }; 
}

export function FactoryMap({ isCraneOnline, cranePosition }: FactoryMapProps) {
  // 0,0 w Prawym Dolnym Rogu:
  // Poziomo (Left): 100% to Lewa, 0% to Prawa (100 - x)
  // Pionowo (Top): 100% to Góra, 0% to Dół (100 - y)
  const safeLeft = Math.max(0, Math.min(100, 100 - cranePosition.x)); 
  const safeTop = Math.max(0, Math.min(100, 100 - cranePosition.y));  

  return (
    <div className="map-grid">
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      
      {isCraneOnline && (
        <div style={{
          position: 'absolute',
          left: `${safeLeft}%`,
          top: `${safeTop}%`,
          transform: 'translate(-50%, -50%)',
          fontSize: '3.5rem', /* WIĘKSZA IKONA */
          transition: 'all 100ms linear',
          zIndex: 10,
          filter: 'drop-shadow(0 0 10px rgba(0,210,255,0.5))'
        }}>
          🏗️
        </div>
      )}
    </div>
  );
}