import { FindOptionsWhere } from './find-option-where'
import { FindOptionsOrder } from './find-options-order'

export interface FindOneOptions<Entity = any> {
  where?: FindOptionsWhere<Entity>

  order?: FindOptionsOrder<Entity>
}
