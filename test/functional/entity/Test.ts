import { Column, Entity, PrimaryColumn } from '../../../lib'

@Entity('Test')
export class Test {
  @PrimaryColumn()
  id: number

  @Column()
  a: string

  @Column()
  b: string
}
