import { TestRepository } from '../../src/TestRepository'
import { Test } from '../../src/entity/Test'
import { TransactionManager } from '../../../lib'

jest.mock('../../../lib/service/transaction-manager')

const TransactionManagerMock = TransactionManager as jest.Mock

describe('repository basic test', () => {
  test('findAll test', async () => {
    TransactionManagerMock.mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            run: async (query: string) => {
              expect(query).toBe('SELECT id, a, b FROM Test')
              return Promise.resolve([
                [
                  {
                    toJSON: () => {
                      return { id: 123, a: 'abcd', b: 'efg' }
                    },
                  },
                ],
              ])
            },
          }
        },
      }
    }).mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            run: async (query: string) => {
              expect(query).toBe('SELECT id, a, b FROM Test')
              return Promise.reject(new Error('expected error'))
            },
          }
        },
      }
    })

    let transactionManager = new TransactionManager(null)
    let target = new TestRepository(transactionManager, Test)
    let actual: Test[] = await target.findAll()
    expect(actual.length).toBe(1)
    const expectResult = new Test()
    expectResult.id = 123
    expectResult.a = 'abcd'
    expectResult.b = 'efg'
    expect(actual[0]).toEqual(expectResult)

    transactionManager = new TransactionManager(null)
    target = new TestRepository(transactionManager, Test)
    await expect(target.findAll()).rejects.toThrow('expected error')
  })

  test('findOne test', async () => {
    TransactionManagerMock.mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            run: async (query: {
              json: boolean
              sql: string
              params: { id: number }
            }) => {
              expect(query.sql).toBe(
                'SELECT id, a, b FROM Test WHERE id=@id LIMIT 1',
              )
              expect(query.json).toBe(false)
              expect(query.params).toEqual({ id: 123 })
              return Promise.resolve([
                [
                  {
                    toJSON: () => {
                      return {
                        id: 123,
                        a: 'abcd',
                        b: 'efg',
                      }
                    },
                  },
                ],
              ])
            },
          }
        },
      }
    }).mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            run: async (query: {
              json: boolean
              sql: string
              params: { id: number }
            }) => {
              expect(query.sql).toBe(
                'SELECT id, a, b FROM Test WHERE id=@id LIMIT 1',
              )
              return Promise.reject(new Error('expected error'))
            },
          }
        },
      }
    })

    let transactionManager = new TransactionManager(null)
    let target = new TestRepository(transactionManager, Test)
    let actual: Test | null = await target.findOne({
      where: {
        id: 123,
      },
    })
    const expectResult = new Test()
    expectResult.id = 123
    expectResult.a = 'abcd'
    expectResult.b = 'efg'
    expect(actual).toEqual(expectResult)

    transactionManager = new TransactionManager(null)
    target = new TestRepository(transactionManager, Test)
    await expect(target.findOne({ where: { id: 123 } })).rejects.toThrow(
      'expected error',
    )
  })
})
