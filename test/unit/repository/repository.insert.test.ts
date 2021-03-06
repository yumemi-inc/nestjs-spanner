import { TransactionManager } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'

jest.mock('../../../lib/service/transaction-manager')

const TransactionManagerMock = TransactionManager as jest.Mock

describe('repository insert test', () => {
  test('insert composite key test', async () => {
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
                    'INSERT CompositeKeyTests (id, idSub, a, b ) VALUES (@id, @idSub, @a, @b)',
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

    let entity = new CompositeKeyTest()
    entity.id = 123
    entity.idSub = 'foo'
    entity.a = 'abcd'
    entity.b = 'efg'

    let actual: CompositeKeyTest = await target.insert(entity)
    expect(actual).toEqual(entity)
  })
})
