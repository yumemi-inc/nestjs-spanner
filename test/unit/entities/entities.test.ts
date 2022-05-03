import { Test } from '../../src/entity/Test'
import { getMetadataArgsStorage } from '../../../lib'

describe('entity test', () => {
  test('entity name type test', () => {
    const target = getMetadataArgsStorage().filterTables(Test)
    expect(target).not.toBeNull()
    expect(target.length).toBe(1)
    expect(target[0].name).toBe('Test')
  })
})
