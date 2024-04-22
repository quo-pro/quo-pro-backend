import { Test, TestingModule } from '@nestjs/testing';
import { FlaggedContentController } from './flagged-content.controller';

describe('FlaggedContentController', () => {
  let controller: FlaggedContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlaggedContentController],
    }).compile();

    controller = module.get<FlaggedContentController>(FlaggedContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
