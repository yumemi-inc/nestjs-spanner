import { Column, Entity, PrimaryColumn } from '../../../lib'

@Entity('CompositeKeyTests')
export class CompositeKeyTest {
  @PrimaryColumn()
  id: number

  @PrimaryColumn()
  idSub: string

  @Column()
  a

  @Column()
  b
}
