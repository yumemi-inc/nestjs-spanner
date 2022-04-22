import { Test } from '../entity/Test'
import { getMetadataArgsStorage } from '../../../lib'

describe('entity, column ', () => {
  it('column name type check', () => {
    const target = getMetadataArgsStorage().filterColumns(Test)
    expect(target).not.toBeNull()
    expect(target.length).toBe(3)
  })
})
