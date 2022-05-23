import { TransactionManager } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'

jest.mock('../../../lib/service/transaction-manager')

const TransactionManagerMock = TransactionManager as jest.Mock

describe('repository findMany test', () => {
  test('simple findMany test no order by', async () => {
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
                'SELECT id, idSub, a, b FROM CompositeKeyTests WHERE id=@id AND idSub=@idSub',
              )
              expect(query.json).toBe(false)
              expect(query.params).toEqual({ id: 123, idSub: 'foo' })
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
    })

    const transactionManager = new TransactionManager(null)
    const target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )
    let actual: CompositeKeyTest[] = await target.findMany({
      where: {
        id: 123,
        idSub: 'foo',
      },
    })
    const expectResult = new CompositeKeyTest()
    expectResult.id = 123
    expectResult.a = 'abcd'
    expectResult.b = 'efg'
    expect(actual).toEqual([expectResult])
  })

  test('findMany with order by test', async () => {
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
                'SELECT id, idSub, a, b FROM CompositeKeyTests WHERE id=@id ORDER BY b asc, a DESC, idSub ASC',
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
    })

    const transactionManager = new TransactionManager(null)
    const target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )
    let actual: CompositeKeyTest[] = await target.findMany({
      where: {
        id: 123,
      },
      order: {
        b: 'asc',
        a: 'DESC',
        idSub: 'ASC',
      },
    })
    const expectResult = new CompositeKeyTest()
    expectResult.id = 123
    expectResult.a = 'abcd'
    expectResult.b = 'efg'
    expect(actual).toEqual([expectResult])
  })
})
