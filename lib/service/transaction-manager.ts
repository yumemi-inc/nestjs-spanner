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

  async runTransactionAsync<T = {}>(runFn: AsyncRunTransactionCallback<T>) {
    const db = this.spanner.getDb()
    await db.runTransactionAsync(async (transaction) => {
      try {
        await runFn(transaction)
        await transaction.commit()
      } catch (err) {
        await transaction.rollback()
        throw err
      }
    })
  }

  getDb(): Database {
    return this.spanner.getDb()
  }
}
