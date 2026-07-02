import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

interface BuildEvent {
  type: string;
  buildId?: string;
  message?: string;
  progress?: number;
  status?: string;
  timestamp: number;
}

const BuildSocketDemo = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<BuildEvent[]>([]);

  useEffect(() => {
    const client = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
    });

    client.on('connect', () => {
      client.emit('join:build', 'demo-build');
      client.emit('join:workers');
    });

    client.on('build:event', (event: BuildEvent) => {
      setEvents((current) => [event, ...current].slice(0, 10));
    });

    client.on('worker:event', (event: BuildEvent) => {
      setEvents((current) => [event, ...current].slice(0, 10));
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, []);

  return (
    <section>
      <h2>Live build events</h2>
      <p>Socket.IO is connected and listening for build and worker updates.</p>
      <ul>
        {events.map((event, index) => (
          <li key={`${event.timestamp}-${index}`}>
            {event.type}: {event.message ?? event.status ?? 'update'}
          </li>
        ))}
      </ul>
      {socket?.connected ? <p>Status: connected</p> : <p>Status: disconnected</p>}
    </section>
  );
};

export default BuildSocketDemo;
