export const CONTRACTS_VERSION = '0.2.0' as const;
export type ContractsVersion = typeof CONTRACTS_VERSION;

export type ApiOkResponse<T> = {
  ok: true;
  contractsVersion: ContractsVersion;
  serverTimeUtc: string;
  data: T;
};

export function buildOkResponse<T>(data: T): ApiOkResponse<T> {
  return {
    ok: true,
    contractsVersion: CONTRACTS_VERSION,
    serverTimeUtc: new Date().toISOString(),
    data,
  };
}
