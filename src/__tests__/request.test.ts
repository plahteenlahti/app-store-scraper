import { describe, it, expect, vi } from 'vitest';
import { doRequest } from '../lib/common.js';

/**
 * Builds a fetch stub that returns the given queue of responses in order.
 * Each entry is either a Response or a factory that receives the init object
 * (so a test can inspect the signal / headers it was called with).
 */
function fetchQueue(
  responses: Array<Response | ((init: RequestInit) => Response | Promise<Response>)>
) {
  const calls: RequestInit[] = [];
  let i = 0;
  const impl = vi.fn(async (_url: string, init: RequestInit) => {
    calls.push(init);
    const next = responses[Math.min(i, responses.length - 1)];
    i++;
    return typeof next === 'function' ? next(init) : next;
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

describe('doRequest', () => {
  it('returns the body on a 200 response', async () => {
    const { impl } = fetchQueue([new Response('hello', { status: 200 })]);
    const body = await doRequest('https://example.test', { fetch: impl });
    expect(body).toBe('hello');
  });

  it('uses the injected fetch implementation', async () => {
    const { impl, calls } = fetchQueue([new Response('ok')]);
    await doRequest('https://example.test', { fetch: impl });
    expect((impl as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
    expect(calls[0]?.method).toBe('GET');
  });

  it('merges custom headers over the defaults', async () => {
    const { impl, calls } = fetchQueue([new Response('ok')]);
    await doRequest('https://example.test', {
      fetch: impl,
      headers: { 'X-Test': '1', 'User-Agent': 'custom-agent' },
    });
    const headers = calls[0]?.headers as Record<string, string>;
    expect(headers['X-Test']).toBe('1');
    expect(headers['User-Agent']).toBe('custom-agent');
    expect(headers['Accept-Language']).toBe('en-US,en;q=0.9');
  });

  it('does not retry by default', async () => {
    const { impl } = fetchQueue([new Response('nope', { status: 429 })]);
    await expect(doRequest('https://example.test', { fetch: impl })).rejects.toThrow(
      'Request failed with status 429'
    );
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and then succeeds', async () => {
    const { impl } = fetchQueue([
      new Response('slow down', { status: 429 }),
      new Response('recovered', { status: 200 }),
    ]);
    const body = await doRequest('https://example.test', {
      fetch: impl,
      retries: 2,
      retryDelay: 0,
    });
    expect(body).toBe('recovered');
    expect(impl).toHaveBeenCalledTimes(2);
  });

  it('retries on 5xx and then succeeds', async () => {
    const { impl } = fetchQueue([
      new Response('boom', { status: 503 }),
      new Response('boom', { status: 500 }),
      new Response('ok', { status: 200 }),
    ]);
    const body = await doRequest('https://example.test', {
      fetch: impl,
      retries: 3,
      retryDelay: 0,
    });
    expect(body).toBe('ok');
    expect(impl).toHaveBeenCalledTimes(3);
  });

  it('exhausts retries and throws the last status', async () => {
    const { impl } = fetchQueue([new Response('down', { status: 500 })]);
    await expect(
      doRequest('https://example.test', { fetch: impl, retries: 2, retryDelay: 0 })
    ).rejects.toThrow('Request failed with status 500');
    expect(impl).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('does not retry a non-retryable status (404)', async () => {
    const { impl } = fetchQueue([new Response('missing', { status: 404 })]);
    await expect(
      doRequest('https://example.test', { fetch: impl, retries: 3, retryDelay: 0 })
    ).rejects.toThrow('Request failed with status 404');
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('retries on a network/transport error', async () => {
    let call = 0;
    const impl = vi.fn(() => {
      call++;
      if (call === 1) return Promise.reject(new TypeError('network failure'));
      return Promise.resolve(new Response('ok', { status: 200 }));
    }) as unknown as typeof fetch;

    const body = await doRequest('https://example.test', {
      fetch: impl,
      retries: 1,
      retryDelay: 0,
    });
    expect(body).toBe('ok');
    expect(impl).toHaveBeenCalledTimes(2);
  });

  it('honors the Retry-After header (seconds)', async () => {
    const { impl } = fetchQueue([
      new Response('slow down', {
        status: 429,
        headers: { 'Retry-After': '0' },
      }),
      new Response('ok', { status: 200 }),
    ]);
    const body = await doRequest('https://example.test', {
      fetch: impl,
      retries: 1,
      retryDelay: 10_000, // would be slow if Retry-After were ignored
    });
    expect(body).toBe('ok');
    expect(impl).toHaveBeenCalledTimes(2);
  });

  it('passes an abort signal to fetch when a timeout is set', async () => {
    const { impl, calls } = fetchQueue([new Response('ok')]);
    await doRequest('https://example.test', { fetch: impl, timeout: 1000 });
    expect(calls[0]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('aborts the request when the timeout elapses', async () => {
    // A fetch that never resolves until its signal aborts.
    const impl = vi.fn((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init.signal as AbortSignal;
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    }) as unknown as typeof fetch;

    await expect(
      doRequest('https://example.test', { fetch: impl, timeout: 20 })
    ).rejects.toThrow();
  });

  it('does not retry once the caller aborts', async () => {
    const controller = new AbortController();
    const impl = vi.fn((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init.signal as AbortSignal;
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    }) as unknown as typeof fetch;

    const promise = doRequest('https://example.test', {
      fetch: impl,
      signal: controller.signal,
      retries: 3,
      retryDelay: 0,
    });
    controller.abort(new Error('caller cancelled'));

    await expect(promise).rejects.toThrow('caller cancelled');
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('rejects immediately if the signal is already aborted', async () => {
    const impl = vi.fn((_url: string, init: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init.signal as AbortSignal;
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      });
    }) as unknown as typeof fetch;

    await expect(
      doRequest('https://example.test', {
        fetch: impl,
        signal: AbortSignal.abort(new Error('pre-aborted')),
        retries: 3,
        retryDelay: 0,
      })
    ).rejects.toThrow('pre-aborted');
    expect(impl).toHaveBeenCalledTimes(1);
  });
});
