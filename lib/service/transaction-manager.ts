import { Transaction } from '@google-cloud/spanner'
import { SpannerService } from './index'
import { Injectable } from '@nestjs/common'
import { Database } from '@google-cloud/spanner/build/src/database'

export interface AsyncRunTransactionCallback<T> {
  (transaction: Transaction): Promise<T>
}

@Injectable()
export class TransactionManager {
  readonly spanner: SpannerService
  constructor(spanner: SpannerService) {
    this.spanner = spanner
  }

  async runTransactionAsync<T = {}>(
    runFn: AsyncRunTransactionCallback<T>,
  ): Promise<T> {
    const db = this.spanner.getDb()
    await db.runTransactionAsync(async (transaction) => {
      try {
        await runFn(transaction)
      } catch (err) {
        await transaction.rollback()
      } finally {
        await transaction.commit()
      }
    })
    return null
  }

  getDb(): Database {
    return this.spanner.getDb()
  }
}
