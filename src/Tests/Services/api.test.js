import { ApiError, api } from '@/Services/api';

const originalFetch = global.fetch;

describe('api', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends JSON requests with defaults, headers, body, and abort signal', async () => {
    const payload = { id: 3 };
    const signal = new AbortController().signal;
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: jest.fn().mockResolvedValue(payload) });

    await api.post('/eventos', payload, { headers: { Authorization: 'Bearer token' }, signal });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify(payload),
      signal,
    });
  });

  it('supports absolute URLs, custom methods, and empty 204 responses', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 204 });

    await expect(api.put('https://api.example.test/item/1', { enabled: true })).resolves.toBeNull();

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/item/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ enabled: true }),
    }));
  });

  it('returns JSON from GET, PATCH, and DELETE requests', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: jest.fn().mockResolvedValue({ ok: true }) });

    await api.get('/items');
    await api.patch('/items/1', { active: true });
    await api.delete('/items/1');

    expect(global.fetch.mock.calls.map(([url, options]) => [url, options.method])).toEqual([
      ['http://localhost:4000/items', 'GET'],
      ['http://localhost:4000/items/1', 'PATCH'],
      ['http://localhost:4000/items/1', 'DELETE'],
    ]);
  });

  it('throws an ApiError with the server message and payload', async () => {
    const payload = { message: 'No autorizado' };
    global.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: jest.fn().mockResolvedValue(payload),
    });

    await expect(api.get('/privado')).rejects.toEqual(expect.objectContaining({
      name: 'ApiError',
      message: 'No autorizado',
      status: 403,
      payload,
    }));
    expect(new ApiError('fallo', 500, null)).toBeInstanceOf(Error);
  });

  it('falls back to the status message when an error response has no JSON body', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: jest.fn().mockRejectedValue(new Error('invalid json')),
    });

    await expect(api.get('/fallo')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Error 502',
      status: 502,
      payload: null,
    });
  });
});