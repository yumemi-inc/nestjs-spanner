import { Test } from '../../src/entity/Test'
import { getMetadataArgsStorage } from '../../../lib'

describe('column test', () => {
  test('column name type check', () => {
    const target = getMetadataArgsStorage().filterColumns(Test)
    expect(target).not.toBeNull()
    expect(target.length).toBe(3)
  })
})
