import { SpannerService } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'

jest.mock('../../../lib/service/spanner.service')
const SpannerServiceMock = SpannerService as jest.Mock

describe('repository update test', () => {
  test('update composite key test', async () => {
    SpannerServiceMock.mockImplementationOnce(() => {
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
    let spannerService = new SpannerService()
    let target = new CompositeKeyTestRepository(
      spannerService,
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
    spannerService = new SpannerService()
    target = new CompositeKeyTestRepository(spannerService, CompositeKeyTest)
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
