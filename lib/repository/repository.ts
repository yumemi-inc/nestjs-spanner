import {
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
} from './find-option'
import { getMetadataArgsStorage } from './globals'
import { ColumnMetaDataArgs, TableMetaDataArgs } from './meta-data'
import { Row } from '@google-cloud/spanner/build/src/partial-result-stream'
import { Logger } from '@nestjs/common'
import { Database } from '@google-cloud/spanner/build/src/database'
import { Json } from '@google-cloud/spanner/build/src/codec'
import { TransactionManager } from '../service/'
import { Transaction } from '@google-cloud/spanner'
import { FindByPKOptions } from './find-option/find-by-pk-option'
import { FindManyOption } from './find-option/find-many-option'

type Meta = {
  metaTable: TableMetaDataArgs
  metaColumns: ColumnMetaDataArgs[]
}

export class Repository<T> {
  readonly transactionManager: TransactionManager
  private readonly logger = new Logger(Repository.name)
  private readonly target

  constructor(transactionManager: TransactionManager, ctor: { new (): T }) {
    this.transactionManager = transactionManager
    this.target = new ctor()
  }

  async insert(entity: T): Promise<T>
  async insert(entity: T, transaction: Transaction): Promise<T>

  async insert(entity: T, transaction?: Transaction): Promise<T> {
    const meta = this.getMetaData()
    let query = 'INSERT '
    query = query.concat(meta.metaTable.name)
    query = query.concat(' (')
    const columnNames: string[] = meta.metaColumns.map((column) => {
      return column.propertyName
    })

    const params = {}
    const nullColumns: string[] = []
    const filteredColumns = columnNames.filter((columnName) => {
      const value = entity[columnName]
      if (value === undefined) {
        return false
      } else if (value === null) {
        nullColumns.push(columnName)
        return false
      } else {
        params[columnName] = value
        return true
      }
    })

    query = query.concat(filteredColumns.join(', '))
    if (nullColumns.length > 0) {
      query = query.concat(', ').concat(nullColumns.join(', '))
    }
    query = query.concat(' ) VALUES (@')
    query = query.concat(filteredColumns.join(', @'))
    nullColumns.forEach((_) => {
      query = query.concat(', NULL')
    })
    query = query.concat(')')

    this.logger.log(query)
    this.logger.log(JSON.stringify(params))

    if (transaction) {
      const [rowCount] = await transaction.runUpdate({
        sql: query,
        params: params,
      })
      this.logger.log('insert row count:' + rowCount.toString())
    } else {
      const database: Database = this.transactionManager.getDb()
      await database.runTransactionAsync(async (tx) => {
        try {
          const [rowCount] = await tx.runUpdate({
            sql: query,
            params: params,
          })
          this.logger.log('insert row count:' + rowCount.toString())
          await tx.commit()
        } catch (err) {
          await tx.rollback()
          throw err
        }
      })
    }
    return entity
  }

  async findAll(): Promise<T[]> {
    const columnNames = this.getColumnNames()
    const query = this.baseSelectQuery(columnNames, this.getMetaData())

    this.logger.log(query)

    try {
      const [rows] = await this.transactionManager.getDb().run(query)
      return rows.map<T>((row: Row | Json) => {
        return this.mapEntity(row.toJSON(), columnNames)
      })
    } catch (err) {
      throw err
    }
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    const columnNames = this.getColumnNames()
    let sql = this.baseSelectQuery(columnNames, this.getMetaData())
    const [whereClause, params] = this.getWhereClause(options.where)
    sql = sql.concat(whereClause)
    sql = sql.concat(this.getOrderByClause(options.order)).concat(' LIMIT 1')
    this.logger.log(sql)
    this.logger.log(JSON.stringify(params))

    try {
      const [rows] = await this.transactionManager.getDb().run({
        json: false,
        sql: sql,
        params: params,
      })
      const entities: T[] = rows.map<T>((row: Row | Json) => {
        return this.mapEntity(row.toJSON(), columnNames)
      })
      if (entities.length > 0) {
        return entities[0]
      } else {
        return null
      }
    } catch (err) {
      throw err
    }
  }

  async findByPK(options: FindByPKOptions<T>): Promise<T | null> {
    const meta: Meta = this.getMetaData()
    const columnNames = this.getColumnNames()
    const params = {}
    let sql = this.baseSelectQuery(columnNames, this.getMetaData())
    sql = sql.concat(' WHERE ')
    const pkColumns = this.getPkColumns(meta, options)
    const wheres: string[] = pkColumns.map((key: string) => {
      params[key] = options.where[key]
      return key + '=@' + key
    })
    sql = sql.concat(wheres.join(' AND '))
    sql = sql.concat(' LIMIT 1')
    this.logger.log(sql)
    this.logger.log(JSON.stringify(params))

    try {
      const [rows] = await this.transactionManager.getDb().run({
        json: false,
        sql: sql,
        params: params,
      })
      const entities: T[] = rows.map<T>((row: Row | Json) => {
        return this.mapEntity(row.toJSON(), columnNames)
      })
      if (entities.length > 0) {
        return entities[0]
      } else {
        return null
      }
    } catch (err) {
      throw err
    }
  }

  async findMany(options: FindManyOption<T>): Promise<T[]> {
    const columnNames = this.getColumnNames()
    let sql = this.baseSelectQuery(columnNames, this.getMetaData())
    const [whereClause, params] = this.getWhereClause(options.where)
    sql = sql.concat(whereClause)
    sql = sql.concat(this.getOrderByClause(options.order))
    this.logger.log(sql)
    this.logger.log(JSON.stringify(params))

    try {
      const [rows] = await this.transactionManager.getDb().run({
        json: false,
        sql: sql,
        params: params,
      })
      const entities: T[] = rows.map<T>((row: Row | Json) => {
        return this.mapEntity(row.toJSON(), columnNames)
      })
      return entities
    } catch (err) {
      throw err
    }
  }

  async deleteByPK(options: FindOneOptions<T>): Promise<number>
  async deleteByPK(
    options: FindOneOptions<T>,
    transaction: Transaction,
  ): Promise<number>

  async deleteByPK(
    options: FindOneOptions<T>,
    transaction?: Transaction,
  ): Promise<number> {
    const meta: Meta = this.getMetaData()
    const pkColumns = this.getPkColumns(meta, options)

    let sql = 'DELETE FROM '.concat(meta.metaTable.name).concat(' WHERE ')
    const params = {}
    const wheres: string[] = pkColumns.map((key: string) => {
      params[key] = options.where[key]
      return key + '=@' + key
    })
    sql = sql.concat(wheres.join(' AND '))

    this.logger.log(sql)
    this.logger.log(JSON.stringify(params))

    let count = 0
    if (transaction) {
      const [rowCount] = await transaction.runUpdate({
        sql: sql,
        params: params,
      })
      count = rowCount
    } else {
      const db = await this.transactionManager.getDb()
      await db.runTransactionAsync(async (tx: Transaction) => {
        try {
          const [rowCount] = await tx.runUpdate({
            sql: sql,
            params: params,
          })
          await tx.commit()
          count = rowCount
        } catch (err) {
          await tx.rollback()
          throw err
        }
      })
    }
    this.logger.log('delete row count:' + count)
    return count
  }

  async updateByPK(entity: T): Promise<number>
  async updateByPK(entity: T, transaction: Transaction): Promise<number>

  async updateByPK(entity: T, transaction?: Transaction): Promise<number> {
    const meta: Meta = this.getMetaData()
    const pkColumns = meta.metaColumns
      .filter((column: ColumnMetaDataArgs) => {
        return column.primary === true
      })
      .map((column: ColumnMetaDataArgs) => {
        return column.propertyName
      })
    if (pkColumns.length === 0) {
      throw new Error(
        'no pk column. must set pk column at least one to entity.',
      )
    }
    pkColumns.forEach((column: string) => {
      if (!entity[column]) {
        throw new Error('must set pk value at ' + column)
      }
    })
    let sql = 'UPDATE '.concat(meta.metaTable.name).concat(' SET ')
    const setters: string[] = []
    const wheres: string[] = []
    const params = {}
    Object.keys(entity).forEach((key: string) => {
      if (pkColumns.includes(key)) {
        wheres.push(key + '=@' + key)
        params[key] = entity[key]
      } else {
        if (entity[key]) {
          setters.push(key + '=@' + key)
          params[key] = entity[key]
        }
      }
    })
    sql = sql.concat(setters.join(' , '))
    sql = sql.concat(' WHERE ').concat(wheres.join(' AND '))

    this.logger.log(sql)
    this.logger.log(JSON.stringify(params))

    let count = 0
    if (transaction) {
      const [rowCount] = await transaction.runUpdate({
        sql: sql,
        params: params,
      })
      count = rowCount
    } else {
      const db = await this.transactionManager.getDb()
      await db.runTransactionAsync(async (tx) => {
        try {
          const [rowCount] = await tx.runUpdate({
            sql: sql,
            params: params,
          })
          await tx.commit()
          count = rowCount
        } catch (err) {
          await tx.rollback()
          throw err
        }
      })
    }
    this.logger.log('update row count:' + count)
    return count
  }

  protected getMetaData(): Meta {
    const metaTable = getMetadataArgsStorage().filterTables(
      this.target.constructor,
    )[0]
    const metaColumns = getMetadataArgsStorage().filterColumns(
      this.target.constructor,
    )
    return { metaTable, metaColumns }
  }

  protected mapEntity(json: Json, columnNames: string[]): T {
    const entity = new this.target.constructor()
    columnNames.forEach((columnName) => {
      entity[columnName] = json[columnName]
    })
    return entity
  }

  protected getColumnNames(): string[] {
    const meta = this.getMetaData()
    return meta.metaColumns.map((column) => {
      return column.propertyName
    })
  }

  protected baseSelectQuery(columnNames: string[], meta: Meta): string {
    let query = 'SELECT '
    query = query.concat(columnNames.join(', '))
    query = query.concat(' FROM ').concat(meta.metaTable.name)
    return query
  }

  protected getPkColumns(meta: Meta, options: FindOneOptions<T>): string[] {
    // check pk
    const pkColumns = meta.metaColumns
      .filter((metaColumn) => {
        return metaColumn.primary == true
      })
      .map((column) => {
        return column.propertyName
      })
    if (pkColumns.length == 0) {
      throw new Error('pk column not found.set pk column in entity')
    }
    pkColumns.forEach((pkColumn) => {
      if (!(pkColumn in options.where)) {
        throw new Error('pk column value must set.')
      }
    })
    return pkColumns
  }

  protected getOrderByClause(order: FindOptionsOrder<T>): string {
    if (!order) {
      return ''
    }
    return ' ORDER BY '.concat(
      Object.keys(order)
        .map((key: string) => {
          return key.concat(' ').concat(order[key])
        })
        .join(', '),
    )
  }

  protected getWhereClause(
    where: FindOptionsWhere<T>,
  ): [string, FindOptionsWhere<T>] {
    const params = {}
    const clause = ' WHERE '
    const wheres: string[] = Object.keys(where).map((key: string) => {
      params[key] = where[key]
      return key + '=@' + key
    })
    return [clause.concat(wheres.join(' AND ')), params]
  }
}
