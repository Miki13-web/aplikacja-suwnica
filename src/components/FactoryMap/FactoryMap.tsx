import styles from './FactoryMap.module.css';

interface FactoryMapProps {
  isCraneOnline: boolean;
  cranePosition: { x: number; y: number }; 
}

export function FactoryMap({ isCraneOnline, cranePosition }: FactoryMapProps) {
  // Przeliczenie współrzędnych na pozycję w kontenerze (0,0 w prawym dolnym rogu)
  const safeLeft = Math.max(0, Math.min(100, 100 - cranePosition.x)); 
  const safeTop = Math.max(0, Math.min(100, 100 - cranePosition.y));  

  return (
    <div className={styles.mapGrid}>
      <div className={styles.gridOverlay} />
      
      {isCraneOnline && (
        <div 
          className={styles.craneIcon}
          style={{
            left: `${safeLeft}%`,
            top: `${safeTop}%`,
          }}
        >
          🏗️
        </div>
      )}
    </div>
  );
}