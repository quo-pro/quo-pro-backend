import { Module } from '@nestjs/common';
import { FlaggedContentService } from './services/flagged-content.service';
import { FlaggedContentController } from './controllers/flagged-content.controller';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [FlaggedContentController],
  providers: [FlaggedContentService],
})
export class FlaggedContentModule { }
