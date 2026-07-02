import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('swagger docs', () => {
  it('serves the swagger documentation endpoint', async () => {
    const app = createApp();

    const response = await request(app).get('/api/docs');

    expect(response.status).toBe(301); 
  });
});
