process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'nexora_test_suite_jwt_secret_minimum_32_characters_long';
process.env.FRONTEND_ORIGIN = 'http://localhost:5173';

const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');
const { connectDatabase } = require('../src/config/db');
const { User, UserRepository } = require('../src/models/User');

function extractCookieValue(setCookieHeaders = [], cookieName) {
  for (const header of setCookieHeaders) {
    const [pair] = header.split(';');
    const [name, value] = pair.split('=');
    if (name.trim() === cookieName) {
      return value ? value.trim() : '';
    }
  }
  return null;
}

describe('Nexora Backend API — Security, Authentication & Protected Routes', () => {
  let app;

  before(async () => {
    await connectDatabase();
    app = createApp();
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({
        email: {
          $in: [
            'elena.vance@nexora.io',
            'marcus@nexora.io',
            'aria@nexora.io',
            'devon@nexora.io',
            'sora@nexora.io',
          ],
        },
      });
    }
  });

  it('GET /api/health returns service health status and security headers', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.service, 'nexora-api');
    assert.equal(res.body.database.connected, true);
    assert.ok(res.headers['x-content-type-options']);
  });

  it('POST /api/auth/register creates a new user, normalizes email, hashes password, and sets HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '  Elena   Vance ',
        email: '  Elena.Vance@Nexora.io ',
        password: 'QuantumTrade#2026',
        confirmPassword: 'QuantumTrade#2026',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, 'Elena Vance');
    assert.equal(res.body.user.email, 'elena.vance@nexora.io');
    assert.equal(res.body.user.passwordHash, undefined);
    assert.equal(res.body.user.tokenVersion, undefined);

    const setCookies = res.headers['set-cookie'] || [];
    const authCookieHeader = setCookies.find((c) => c.startsWith('nexora_access_token='));
    assert.ok(authCookieHeader, 'Expected nexora_access_token cookie to be set');
    assert.ok(
      authCookieHeader.toLowerCase().includes('httponly'),
      'Expected auth cookie to include HttpOnly flag'
    );

    // Verify stored password in repository is bcrypt-hashed, never plaintext
    const storedUser = await UserRepository.findByEmail('elena.vance@nexora.io', {
      includeSecrets: true,
    });
    assert.ok(storedUser);
    assert.notEqual(storedUser.passwordHash, 'QuantumTrade#2026');
    assert.ok(storedUser.passwordHash.startsWith('$2'));
  });

  it('POST /api/auth/register rejects duplicate email registration safely (case-insensitive)', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Marcus Sterling',
      email: 'marcus@nexora.io',
      password: 'SecurePassword!99',
      confirmPassword: 'SecurePassword!99',
    });

    const duplicateRes = await request(app).post('/api/auth/register').send({
      name: 'Marcus Duplicate',
      email: 'MARCUS@NEXORA.IO',
      password: 'AnotherPassword!88',
      confirmPassword: 'AnotherPassword!88',
    });

    assert.equal(duplicateRes.status, 409);
    assert.equal(duplicateRes.body.success, false);
    assert.ok(duplicateRes.body.errors.email);
  });

  it('POST /api/auth/register rejects invalid inputs (weak password, invalid email, mismatched confirmation)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: 'weak',
      confirmPassword: 'different_password',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.name);
    assert.ok(res.body.errors.email);
    assert.ok(res.body.errors.password);
    assert.ok(res.body.errors.confirmPassword);
  });

  it('POST /api/auth/login authenticates valid credentials and rejects wrong passwords', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Aria Chen',
      email: 'aria@nexora.io',
      password: 'AlphaVector$2026',
      confirmPassword: 'AlphaVector$2026',
    });

    // Wrong password attempt
    const wrongPassRes = await request(app).post('/api/auth/login').send({
      email: 'aria@nexora.io',
      password: 'WrongPassword$2026',
    });
    assert.equal(wrongPassRes.status, 401);
    assert.equal(wrongPassRes.body.success, false);

    // Non-existent account attempt
    const unknownUserRes = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@nexora.io',
      password: 'AlphaVector$2026',
    });
    assert.equal(unknownUserRes.status, 401);
    assert.equal(unknownUserRes.body.success, false);

    // Correct credentials attempt
    const validLoginRes = await request(app).post('/api/auth/login').send({
      email: '  ARIA@nexora.io ',
      password: 'AlphaVector$2026',
    });
    assert.equal(validLoginRes.status, 200);
    assert.equal(validLoginRes.body.success, true);
    assert.equal(validLoginRes.body.user.email, 'aria@nexora.io');
    assert.equal(validLoginRes.body.user.passwordHash, undefined);
  });

  it('Protects /api/auth/me and /api/dashboard/overview against unauthenticated access and persists session via cookie', async () => {
    // 1. Unauthenticated requests must return 401
    const unauthMe = await request(app).get('/api/auth/me');
    assert.equal(unauthMe.status, 401);

    const unauthDash = await request(app).get('/api/dashboard/overview');
    assert.equal(unauthDash.status, 401);

    // 2. Register and capture cookies using supertest agent
    const agent = request.agent(app);
    const regRes = await agent.post('/api/auth/register').send({
      name: 'Devon Brooks',
      email: 'devon@nexora.io',
      password: 'MarketStructure#10',
      confirmPassword: 'MarketStructure#10',
    });
    assert.equal(regRes.status, 201);

    // 3. Authenticated /api/auth/me (simulates browser page refresh check)
    const meRes = await agent.get('/api/auth/me');
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.user.email, 'devon@nexora.io');

    // 4. Authenticated /api/dashboard/overview
    const dashRes = await agent.get('/api/dashboard/overview');
    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.workspace.tradingEngineActive, false);
    assert.equal(dashRes.body.workspace.chartingIntegrated, false);
    assert.equal(Array.isArray(dashRes.body.workspace.upcomingModules), true);
    assert.equal(dashRes.body.workspace.upcomingModules.length, 4);
  });

  it('Enforces CSRF token check on authenticated state-changing requests and invalidates session on logout', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Sora Takahashi',
      email: 'sora@nexora.io',
      password: 'OrderFlow#2026',
      confirmPassword: 'OrderFlow#2026',
    });

    const setCookies = regRes.headers['set-cookie'];
    const authToken = extractCookieValue(setCookies, 'nexora_access_token');
    const csrfToken = extractCookieValue(setCookies, 'nexora_csrf_token');
    assert.ok(authToken);
    assert.ok(csrfToken);

    const cookieHeader = `nexora_access_token=${authToken}; nexora_csrf_token=${csrfToken}`;

    // Attempt logout WITHOUT X-CSRF-Token header -> should fail with 403
    const missingCsrfLogout = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader)
      .send({});
    assert.equal(missingCsrfLogout.status, 403);

    // Attempt logout WITH valid X-CSRF-Token header -> should succeed with 200
    const validLogout = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader)
      .set('X-CSRF-Token', csrfToken)
      .send({});
    assert.equal(validLogout.status, 200);
    assert.equal(validLogout.body.success, true);

    // Attempt to replay the old auth cookie after logout -> must be rejected with 401
    const replayRes = await request(app)
      .get('/api/dashboard/overview')
      .set('Cookie', cookieHeader);
    assert.equal(replayRes.status, 401);
  });

  it('Enforces narrow CORS policy for allowed frontend origin and blocks unauthorized origins', async () => {
    const allowedRes = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    assert.equal(allowedRes.status, 200);
    assert.equal(allowedRes.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(allowedRes.headers['access-control-allow-credentials'], 'true');

    const blockedRes = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.example');
    assert.equal(blockedRes.status, 403);
  });

  it('Returns consistent 404 JSON response for unknown API endpoints', async () => {
    const res = await request(app).get('/api/unknown-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
