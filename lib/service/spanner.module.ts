import { Module } from '@nestjs/common'
import { SpannerService } from './spanner.service'
import { TransactionManager } from './transaction-manager'

@Module({
  providers: [SpannerService, TransactionManager],
  exports: [SpannerService, TransactionManager],
})
export class SpannerModule {}
