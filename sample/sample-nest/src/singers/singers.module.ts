import { Module } from '@nestjs/common'
import { SingersService } from './singers.service'
import { SingersController } from './singers.controller'
import { RepositoryModule } from '../models/repositories/repository.module'
import { SpannerModule } from 'nestjs-spanner/index'

@Module({
  imports: [RepositoryModule, SpannerModule],
  controllers: [SingersController],
  providers: [SingersService],
})
export class SingersModule {}
