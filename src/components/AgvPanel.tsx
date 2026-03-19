// src/components/AgvPanel.tsx

interface AgvPanelProps {
  isConnected: boolean;
}

export function AgvPanel({ isConnected }: AgvPanelProps) {
  return (
    <div className="panel">
      <h2>Pojazd AGV (Platforma)</h2>
      
      <p>
        Status:{' '}
        {isConnected ? (
          <strong style={{ color: 'green' }}>W gotowości</strong>
        ) : (
          <strong style={{ color: 'red' }}>Brak zasilania</strong>
        )}
      </p>

      {/* Tutaj w przyszłości wstawimy naszą mapę 2D magazynu */}
      <div style={{ 
        marginTop: '20px', 
        height: '150px', 
        backgroundColor: isConnected ? '#e8f4f8' : '#eeeeee',
        border: '2px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'background-color 0.3s'
      }}>
        {isConnected ? '📍 Mapa systemu (Wkrótce)' : 'Oczekiwanie na system...'}
      </div>
      
      <div style={{ marginTop: '15px' }}>
        <button disabled={!isConnected} style={{ width: '100%' }}>
          Wyznacz nową trasę
        </button>
      </div>
    </div>
  )
}