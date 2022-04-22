import { Entity ,PrimaryColumn, Column } from 'nest-spanner'

@Entity('Singers')
export class Singer {
  @PrimaryColumn()
  singerId: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  singerInfo: string
}
