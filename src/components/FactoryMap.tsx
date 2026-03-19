// src/components/FactoryMap.tsx

interface FactoryMapProps {
  isCraneOnline: boolean;
  cranePosition: { x: number; y: number }; // Teraz x i y to wartości od 0 do 100 (%)
}

export function FactoryMap({ isCraneOnline, cranePosition }: FactoryMapProps) {
  return (
    <div style={{
      position: 'relative',   // To pozwala nam swobodnie układać elementy wewnątrz
      width: '100%',          // Wypełnia całą dostępną szerokość
      height: '100%',         // Wypełnia całą dostępną wysokość
      backgroundColor: '#f8f9fa',
      // Magiczna sztuczka CSS rysująca gęstą siatkę (kratka co 20px)
      backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      borderRadius: '8px',
      overflow: 'hidden',     // Suwnica nie wyjedzie "na zewnątrz" div'a
      border: '1px solid #ccc'
    }}>
      
      {/* Nasza suwnica - renderujemy ją tylko, jeśli system jest online */}
      {isCraneOnline && (
        <div style={{
          position: 'absolute',
          // Używamy % do pozycjonowania. Odejmujemy 15px, żeby wyśrodkować ikonkę (która ma 30x30px)
          left: `calc(${cranePosition.x}% - 15px)`,
          top: `calc(${cranePosition.y}% - 15px)`,
          width: '30px',
          height: '30px',
          backgroundColor: '#007bff',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          // PŁYNNOŚĆ: Mówimy przeglądarce, żeby każda zmiana pozycji trwała 50ms w sposób jednostajny (linear)
          transition: 'left 50ms linear, top 50ms linear'
        }}>
          🏗️
        </div>
      )}
    </div>
  );
}