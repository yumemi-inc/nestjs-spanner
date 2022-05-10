import { Injectable } from '@nestjs/common'
import { CreateSingerDto } from './dto/create-singer.dto'
import { UpdateSingerDto } from './dto/update-singer.dto'
import { Singer } from '../models/entities/singer.entity'
import { v4 as uuidv4 } from 'uuid'
import { SingersRepository } from '../models/repositories/singers.repository'
import { AlbumsRepository } from '../models/repositories/albums.repository'
import { TransactionManager } from 'nestjs-spanner'
import { Album } from '../models/entities/album.entity'

@Injectable()
export class SingersService {
  constructor(
    private readonly singerRepository: SingersRepository,
    private readonly albumRepository: AlbumsRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async create(createSingerDto: CreateSingerDto): Promise<Singer> {
    const singer = new Singer()
    singer.singerId = uuidv4()
    singer.firstName = createSingerDto.firstName
    singer.lastName = createSingerDto.lastName
    singer.singerInfo = null

    const album = new Album()
    album.singerId = singer.singerId
    album.albumId = uuidv4()
    album.albumTitle = createSingerDto.albumTitle

    await this.transactionManager.runTransactionAsync(async (transaction) => {
      await this.singerRepository.insert(singer, transaction)
      await this.albumRepository.insert(album, transaction)
    })
    return singer
  }

  async findAll(): Promise<Singer[]> {
    return await this.singerRepository.findAll()
  }

  async findOne(singerId: string): Promise<Singer> | null {
    return await this.singerRepository.findOne({
      where: { singerId: singerId },
    })
  }

  async update(
    singerId: string,
    updateSingerDto: UpdateSingerDto,
  ): Promise<number> {
    const singer = new Singer()
    singer.singerId = singerId
    singer.lastName = updateSingerDto.lastName
    singer.firstName = updateSingerDto.firstName
    return await this.singerRepository.updateByPK(singer)
  }

  async remove(singerId: string): Promise<number> {
    return await this.singerRepository.deleteByPK({
      where: { singerId: singerId },
    })
  }
}
