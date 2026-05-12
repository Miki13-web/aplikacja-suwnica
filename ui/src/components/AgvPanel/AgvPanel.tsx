import styles from './AgvPanel.module.css';

interface AgvPanelProps {
  isConnected: boolean;
}

export function AgvPanel({ isConnected }: AgvPanelProps) {
  return (
    <div className={styles.panel}>
      <h2>Pojazd AGV (Platforma)</h2>
      
      <p>
        Status:{' '}
        {isConnected ? (
          <strong style={{ color: 'green' }}>W gotowości</strong>
        ) : (
          <strong style={{ color: 'red' }}>Brak zasilania</strong>
        )}
      </p>

      <div className={`${styles.mapPlaceholder} ${isConnected ? styles.online : styles.offline}`}>
        {isConnected ? '📍 Mapa systemu (Wkrótce)' : 'Oczekiwanie na system...'}
      </div>
      
      <div style={{ marginTop: '15px' }}>
        <button disabled={!isConnected} className={styles.btnAction}>
          Wyznacz nową trasę
        </button>
      </div>
    </div>
  )
}