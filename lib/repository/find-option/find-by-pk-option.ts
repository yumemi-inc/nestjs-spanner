import { FindOptionsWhere } from './find-option-where'
import { FindOptionsOrder } from './find-options-order'

export interface FindByPKOptions<Entity = any> {
  where?: FindOptionsWhere<Entity>
}
