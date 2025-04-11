import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@jnscas/cy/src/application/app.module';

describe('HealthCheckController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect('OK');
  });

  describe('Error Handling', () => {
    it('returns 404 for non-existent route', () => {
      return request(app.getHttpServer())
        .get('/non-existent')
        .expect(404);
    });
  });
}); 