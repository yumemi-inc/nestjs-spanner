import { SpannerService } from '../../../lib'
import { CompositeKeyTestRepository } from '../../src/CompositeKeyTestRepository'
import { CompositeKeyTest } from '../../src/entity/CompositeKeyTest'

jest.mock('../../../lib/service/spanner.service')

const SpannerServiceMock = SpannerService as jest.Mock

describe('repository composite key test', () => {
  test('findOne composite key test', async () => {
    SpannerServiceMock.mockImplementationOnce(() => {
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

    let spannerService = new SpannerService()
    let target = new CompositeKeyTestRepository(
      spannerService,
      CompositeKeyTest,
    )
    let actual: CompositeKeyTest | null = await target.findOne({
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
    spannerService = new SpannerService()
    target = new CompositeKeyTestRepository(spannerService, CompositeKeyTest)
    await expect(target.findOne({ where: { id: 123 } })).rejects.toThrow(
      'pk column value must set.',
    )
  })
})
