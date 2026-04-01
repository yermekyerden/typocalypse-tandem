import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';
import { CONTRACTS_VERSION } from './response.helper';

/**
 * Factory that produces a named wrapper class Swagger can introspect.
 *
 * Why a factory and not a generic class: TypeScript generics are erased at
 * runtime, so Swagger's reflection layer cannot see the concrete `data` type
 * unless we materialise a real class per data type at module-load time.
 *
 * Usage:
 *   @ApiOkResponse({ type: ApiOkEnvelopeOf(MyResponseDto) })
 */
export function ApiOkEnvelopeOf<T>(DataClass: Type<T>): Type<unknown> {
  class ApiOkEnvelopeClass {
    @ApiProperty({ example: true })
    ok!: true;

    @ApiProperty({ example: CONTRACTS_VERSION })
    contractsVersion!: string;

    @ApiProperty({ example: '2026-03-30T12:00:00.000Z' })
    serverTimeUtc!: string;

    @ApiProperty({ type: DataClass })
    data!: T;
  }

  Object.defineProperty(ApiOkEnvelopeClass, 'name', {
    value: `ApiOkEnvelope_${DataClass.name}`,
  });

  return ApiOkEnvelopeClass;
}
