import {Column, Entity, PrimaryColumn} from "nestjs-spanner"

@Entity('Albums')
export class Album {
    @PrimaryColumn()
    singerId: string

    @PrimaryColumn()
    albumId: string

    @Column()
    albumTitle: string
}
