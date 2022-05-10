import { Module } from '@nestjs/common'
import { SingersRepository } from './singers.repository'
import { SpannerService } from 'nestjs-spanner'
import { Singer } from '../entities/singer.entity'
import { SpannerModule } from 'nestjs-spanner'
import { TransactionManager } from 'nestjs-spanner'
import { AlbumsRepository } from './albums.repository'
import { Album } from '../entities/album.entity'

@Module({
  imports: [SpannerModule],
  providers: [
    {
      provide: SingersRepository,
      useFactory: (transactionManager: TransactionManager) => {
        return new SingersRepository(transactionManager, Singer)
      },
      inject: [SpannerService],
    },
    {
      provide: AlbumsRepository,
      useFactory: (transactionManager: TransactionManager) => {
        return new AlbumsRepository(transactionManager, Album)
      },
      inject: [SpannerService],
    },
  ],
  exports: [SingersRepository, AlbumsRepository],
})
export class RepositoryModule {}
