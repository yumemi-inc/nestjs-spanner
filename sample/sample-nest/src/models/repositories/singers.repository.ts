import { Repository } from 'nestjs-spanner'
import { Singer } from '../entities/singer.entity'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SingersRepository extends Repository<Singer> {}
