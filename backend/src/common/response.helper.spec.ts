import { buildOkResponse, CONTRACTS_VERSION } from './response.helper';

describe('buildOkResponse', () => {
  it('sets ok: true, contractsVersion, and a valid ISO serverTimeUtc', () => {
    const data = { foo: 'bar' };
    const response = buildOkResponse(data);

    expect(response.ok).toBe(true);
    expect(response.contractsVersion).toBe(CONTRACTS_VERSION);
    expect(typeof response.serverTimeUtc).toBe('string');
    expect(() => new Date(response.serverTimeUtc)).not.toThrow();
    expect(new Date(response.serverTimeUtc).toISOString()).toBe(response.serverTimeUtc);
    expect(response.data).toBe(data);
  });

  it('forwards the data payload without modification', () => {
    const data = { nested: { value: 42 } };
    expect(buildOkResponse(data).data).toBe(data);
  });
});
