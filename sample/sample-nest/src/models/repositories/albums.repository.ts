import { Repository } from 'nestjs-spanner'
import { Injectable } from '@nestjs/common'
import { Album } from '../entities/album.entity'

@Injectable()
export class AlbumsRepository extends Repository<Album> {}
