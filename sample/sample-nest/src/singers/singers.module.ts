import { Module } from '@nestjs/common'
import { SingersService } from './singers.service'
import { SingersController } from './singers.controller'
import { SingersRepository } from './singers.repository'
import { SpannerService } from 'nest-spanner'
import { Singer } from './entities/singer.entity'
import { SpannerModule } from 'nest-spanner'

@Module({
  imports: [SpannerModule],
  controllers: [SingersController],
  providers: [
    SingersService,
    {
      provide: SingersRepository,
      useFactory: (spanner: SpannerService) => {
        return new SingersRepository(spanner, Singer)
      },
      inject: [SpannerService],
    },
  ],
})
export class SingersModule {}
