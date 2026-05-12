// src/hooks/useMqtt.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import mqtt from 'mqtt';

export function useMqtt(ipAddress: string) {
  const [isCraneOnline, setIsCraneOnline] = useState(false);
  const [machineStatus, setMachineStatus] = useState('DISCONNECTED');
  const [rawTelemetry, setRawTelemetry] = useState({ x: 0, y: 0, z: 0, angleX: 0, angleY: 0 });
  const [cranePosition, setCranePosition] = useState({ x: 0, y: 0, z: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [debugMqttPayload, setDebugMqttPayload] = useState('Oczekiwanie na pierwsze dane...');

  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  const moveIntervalRef = useRef<number | null>(null);
  const currentDirectionRef = useRef({ dx: 0, dy: 0, dz: 0, speed: 10 });

  // Sprzątanie przy zamykaniu aplikacji/komponentu
  useEffect(() => {
    return () => {
      if (mqttClientRef.current) mqttClientRef.current.end();
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, []);

  const toggleCraneConnection = useCallback(() => {
    if (isCraneOnline) {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
        mqttClientRef.current = null;
      }
      setIsCraneOnline(false);
      setMachineStatus('DISCONNECTED');
      setIsRecording(false);
      return;
    }

    const brokerUrl = `ws://${ipAddress}:9001`;
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
      setIsCraneOnline(true);
      setMachineStatus('CONNECTED');
      client.subscribe('fabryka/suwnica/telemetria');
    });

    client.on('message', (topic, message) => {
      if (topic === 'fabryka/suwnica/telemetria') {
        const payloadString = message.toString();
        setDebugMqttPayload(payloadString);

        try {
          const data = JSON.parse(payloadString);
          const safeX = typeof data.x === 'number' ? data.x : 0;
          const safeY = typeof data.y === 'number' ? data.y : 0;
          const safeZ = Math.abs(data.z || 0);

          setRawTelemetry({
            x: safeX, y: safeY, z: safeZ,
            angleX: data.angleX || 0, angleY: data.angleY || 0
          });

          setCranePosition({
            x: (safeX / 1290.0) * 100,
            y: (safeY / 750.0) * 100,
            z: safeZ
          });

          const safeIsRecording = typeof data.isRecording === 'boolean' ? data.isRecording : false;
          setIsRecording(safeIsRecording);
        } catch (e) { console.error(e); }
      }
    });

    client.on('error', () => {
      alert('Nie udało się połączyć z MQTT.');
      client.end();
      setIsCraneOnline(false);
      setMachineStatus('DISCONNECTED');
    });

    mqttClientRef.current = client;
  }, [ipAddress, isCraneOnline]);

  const setMovement = useCallback((dx: number, dy: number, dz: number, uiSpeed: number) => {
    currentDirectionRef.current = { dx, dy, dz, speed: uiSpeed };

    if (dx === 0 && dy === 0 && dz === 0) {
      if (moveIntervalRef.current !== null) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
        if (mqttClientRef.current && isCraneOnline) {
          mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ akcja: 'STOP' }));
        }
      }
      return;
    }

    if (moveIntervalRef.current === null) {
      moveIntervalRef.current = window.setInterval(() => {
        const dir = currentDirectionRef.current;
        if (mqttClientRef.current && isCraneOnline) {

          let finalSpeed = 0;

          // LOGIKA MAPOWANIA PRĘDKOŚCI
          if (dir.dx !== 0 || dir.dy !== 0) {
            // Jeśli poruszamy się w osi X lub Y:
            // Mapujemy suwak (10-100) na realny prąd silników (60-100)
            finalSpeed = Math.round(60 + (dir.speed - 10) * (40 / 90));
          } else {
            // Jeśli poruszamy TYLKO hakiem (dz !== 0, a dx i dy są 0):
            // Wysyłamy stałą prędkość (np. 70), ignorując suwak
            finalSpeed = 70;
          }

          const payload = JSON.stringify({
            kierunekX: dir.dx,
            kierunekY: dir.dy,
            kierunekZ: dir.dz,
            predkosc: finalSpeed
          });

          mqttClientRef.current.publish('fabryka/suwnica/sterowanie', payload);
        }
      }, 50);
    }
  }, [isCraneOnline]);

  const triggerHoming = useCallback(() => {
    if (mqttClientRef.current && isCraneOnline) {
      mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ bazuj: true }));
    }
  }, [isCraneOnline]);

  const triggerHomingZ = useCallback(() => {
    if (mqttClientRef.current && isCraneOnline) {
      mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ bazuj_z: true }));
    }
  }, [isCraneOnline]);

  // --- NOWA FUNKCJA DO NAGRYWANIA ---
  const triggerRecording = useCallback((start: boolean) => {
    if (mqttClientRef.current && isCraneOnline) {
      const akcja = start ? 'START_REC' : 'STOP_REC';
      mqttClientRef.current.publish('fabryka/suwnica/sterowanie', JSON.stringify({ akcja }));
    }
  }, [isCraneOnline]);

  return {
    isCraneOnline,
    machineStatus,
    rawTelemetry,
    cranePosition,
    isRecording,
    debugMqttPayload,
    toggleCraneConnection,
    setMovement,
    triggerHoming,
    triggerHomingZ,
    triggerRecording // Eksportujemy nową funkcję
  };
}