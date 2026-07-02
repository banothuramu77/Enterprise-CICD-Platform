export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  database: 'connected' | 'disconnected';
}
