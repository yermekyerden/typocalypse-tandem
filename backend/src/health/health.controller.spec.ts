import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /health returns status ok', async () => {
    jest.spyOn(healthCheckService, 'check').mockResolvedValueOnce({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    });

    const result = await controller.check();

    expect(result.status).toBe('ok');
  });
});
