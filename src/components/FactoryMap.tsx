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
        <div 
        style={{
          position: 'absolute',
          left: `${cranePosition.x}%`,
          top: `${cranePosition.y}%`,
          transform: 'translate(-50%, -50%)', // <--- TO ZAPEWNIA DOJAZD DO SAMEJ KRAWĘDZI EKRANU
          // reszta Twoich stylów (np. obrazek suwnicy, tło itp.)
        }}
      >
        🏗️
      </div>
      )}
    </div>
  );
}