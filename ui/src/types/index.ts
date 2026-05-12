// Centralny plik z definicjami typów (jak plik .h w C++)
export interface Telemetry {
  x: number;
  y: number;
  z: number;
  angleX: number;
  angleY: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Direction {
  dx: number;
  dy: number;
  dz: number;
  speed: number;
}