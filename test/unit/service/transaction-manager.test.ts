import { SpannerService, TransactionManager } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'
import { Transaction } from '@google-cloud/spanner'

jest.mock('../../../lib/service/spanner.service')

const SpannerServiceMock = SpannerService as jest.Mock

describe('transaction manager test', () => {
  test('transaction completely', async () => {
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    SpannerServiceMock.mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            runTransactionAsync: async (fn: Function): Promise<void> => {
              await fn({
                runUpdate: async (): Promise<[number]> => {
                  return Promise.resolve([1])
                },
                commit: commitMock,
                rollback: rollbackMock,
              })
            },
          }
        },
      }
    })
    let target = new TransactionManager(new SpannerServiceMock())

    const repo1 = new CompositeKeyTestRepository(target, CompositeKeyTest)

    const entity1 = new CompositeKeyTest()
    entity1.id = 123
    entity1.idSub = 'foo'
    entity1.a = 'abcd'
    entity1.b = 'efg'

    await target.runTransactionAsync(async (transaction: Transaction) => {
      await repo1.insert(entity1, transaction)
    })
    expect(commitMock.mock.calls.length).toBe(1)
    expect(rollbackMock.mock.calls.length).toBe(0)
  })

  test('transaction rollback', async () => {
    const commitMock = jest.fn()
    const rollbackMock = jest.fn()
    SpannerServiceMock.mockImplementationOnce(() => {
      return {
        getDb: (): any => {
          return {
            runTransactionAsync: async (fn: Function): Promise<void> => {
              await fn({
                runUpdate: async (): Promise<[number]> => {
                  return Promise.resolve([1])
                },
                commit: commitMock,
                rollback: rollbackMock,
              })
            },
          }
        },
      }
    })
    let target = new TransactionManager(new SpannerServiceMock())
    try {
      await target.runTransactionAsync(async (transaction: Transaction) => {
        throw new Error('expected error throw')
      })
    } catch (e) {
      expect(e).toEqual(new Error('expected error throw'))
    }
    expect(commitMock.mock.calls.length).toBe(0)
    expect(rollbackMock.mock.calls.length).toBe(1)
  })
})
