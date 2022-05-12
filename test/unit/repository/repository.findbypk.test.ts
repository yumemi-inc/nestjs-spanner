import { TransactionManager } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'

jest.mock('../../../lib/service/transaction-manager')

const TransactionManagerMock = TransactionManager as jest.Mock

describe('repository findByPK test', () => {
  test('findByPK composite key test', async () => {
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
                'SELECT id, idSub, a, b FROM CompositeKeyTests WHERE id=@id AND idSub=@idSub LIMIT 1',
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

    let transactionManager = new TransactionManager(null)
    let target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )
    let actual: CompositeKeyTest | null = await target.findByPK({
      where: {
        id: 123,
        idSub: 'foo',
      },
    })
    const expectResult = new CompositeKeyTest()
    expectResult.id = 123
    expectResult.a = 'abcd'
    expectResult.b = 'efg'
    expect(actual).toEqual(expectResult)

    // pk columns check error test
    transactionManager = new TransactionManager(null)
    target = new CompositeKeyTestRepository(
      transactionManager,
      CompositeKeyTest,
    )
    await expect(target.findByPK({ where: { id: 123 } })).rejects.toThrow(
      'pk column value must set.',
    )
  })
})
