import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'
import { TransactionManager } from '../../../lib'

jest.mock('../../../lib/service/transaction-manager')

const TransactionManagerMock = TransactionManager as jest.Mock

describe('repository update test', () => {
  test('update composite key test', async () => {
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
                    'UPDATE CompositeKeyTests SET a=@a , b=@b WHERE id=@id AND idSub=@idSub',
                  )
                  expect(param.params).toEqual({
                    id: 123,
                    idSub: 'foo',
                    a: 'abcd',
                    b: 'efg',
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

    let param = new CompositeKeyTest()
    param.id = 123
    param.idSub = 'foo'
    param.a = 'abcd'
    param.b = 'efg'

    let actual: number = await target.updateByPK(param)
    expect(actual).toBe(1)

    // pk columns check error test
    transactionManager = new TransactionManager(null)
    target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )
    param = new CompositeKeyTest()
    param.id = 123
    param.idSub = ''
    param.a = 'abcd'
    param.b = 'efg'
    await expect(target.updateByPK(param)).rejects.toThrow(
      'must set pk value at idSub',
    )
  })
})
