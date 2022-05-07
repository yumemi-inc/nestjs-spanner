import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'
import { TransactionManager } from '../../../lib'

jest.mock('../../../lib/service/transaction-manager')

const TransactionManagerMock = TransactionManager as jest.Mock

describe('repository delete test', () => {
  test('delete composite key test', async () => {
    TransactionManagerMock.mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            runTransactionAsync: async (fn: Function): Promise<void> => {
              await fn({
                runUpdate: async (param: {
                  sql: string
                  params: any
                }): Promise<[number]> => {
                  expect(param.sql).toBe(
                    'DELETE FROM CompositeKeyTests WHERE id=@id AND idSub=@idSub',
                  )
                  expect(param.params).toEqual({
                    id: 123,
                    idSub: 'abc',
                  })
                  return Promise.resolve([1])
                },
                commit: async (): Promise<void> => {},
              })
            },
          }
        },
      }
    })
    let transactionManager = new TransactionManager(null)
    let target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )

    let actual: number = await target.deleteByPK({
      where: {
        id: 123,
        idSub: 'abc',
      },
    })
    expect(actual).toBe(1)

    // pk columns check error test
    transactionManager = new TransactionManager(null)
    target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )
    await expect(
      target.deleteByPK({
        where: {
          id: 123,
        },
      }),
    ).rejects.toThrow('pk column value must set.')
  })
})
