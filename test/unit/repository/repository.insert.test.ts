import { SpannerService } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'

jest.mock('../../../lib/service/spanner.service')
const SpannerServiceMock = SpannerService as jest.Mock

describe('repository insert test', () => {
  test('insert composite key test', async () => {
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
    let spannerService = new SpannerService()
    let target = new CompositeKeyTestRepository(
      spannerService,
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
