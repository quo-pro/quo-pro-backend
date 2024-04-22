import { Test, TestingModule } from '@nestjs/testing';
import { FlaggedContentService } from './flagged-content.service';

describe('FlaggedContentService', () => {
  let service: FlaggedContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlaggedContentService],
    }).compile();

    service = module.get<FlaggedContentService>(FlaggedContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
