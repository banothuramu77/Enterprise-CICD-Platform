import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('health routes', () => {
  it('returns readiness information for the backend', async () => {
    const app = createApp();

    const response = await request(app).get('/api/health/ready');

    expect(response.status).toBe(200);
    expect(response.body.service).toBe('backend');
  });
});
