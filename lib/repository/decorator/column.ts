import { getMetadataArgsStorage } from '../globals'
import { ColumnMetaDataArgs } from '../meta-data/column-meta-data-args'

export function Column(): PropertyDecorator

export function Column(): PropertyDecorator {
  return (object: Object, propertyName: string): void => {
    getMetadataArgsStorage().columns.push({
      target: object.constructor,
      propertyName: propertyName,
      primary: false,
      repositoryName: object.constructor.name + 'Repository',
    } as ColumnMetaDataArgs)
  }
}
