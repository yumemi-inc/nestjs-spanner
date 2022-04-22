"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const globals_1 = require("./globals");
const common_1 = require("@nestjs/common");
class Repository {
    constructor(spanner, ctor) {
        this.logger = new common_1.Logger(Repository.name);
        this.spanner = spanner;
        this.target = new ctor();
    }
    async insert(entity) {
        const meta = this.getMetaData();
        let query = 'INSERT ';
        query = query.concat(meta.metaTable.name);
        query = query.concat(' (');
        const columnNames = meta.metaColumns.map((column) => {
            return column.propertyName;
        });
        const params = {};
        const nullColumns = [];
        const filteredColumns = columnNames.filter((columnName) => {
            const value = entity[columnName];
            if (value === undefined) {
                return false;
            }
            else if (value === null) {
                nullColumns.push(columnName);
                return false;
            }
            else {
                params[columnName] = value;
                return true;
            }
        });
        query = query.concat(filteredColumns.join(', '));
        if (nullColumns.length > 0) {
            query = query.concat(', ').concat(nullColumns.join(', '));
        }
        query = query.concat(' ) VALUES (@');
        query = query.concat(filteredColumns.join(', @'));
        nullColumns.forEach((colum) => {
            query = query.concat(', NULL');
        });
        query = query.concat(')');
        this.logger.log(query);
        this.logger.log(JSON.stringify(params));
        const database = this.spanner.getDb();
        try {
            await database.runTransactionAsync(async (transaction) => {
                const [rowCount] = await transaction.runUpdate({
                    sql: query,
                    params: params,
                });
                this.logger.log('insert row count:' + rowCount.toString());
                await transaction.commit();
            });
        }
        catch (err) {
            throw err;
        }
        return entity;
    }
    async findAll() {
        const columnNames = this.getColumnNames();
        const query = this.baseSelectQuery(columnNames, this.getMetaData());
        this.logger.log(query);
        try {
            const [rows] = await this.spanner.getDb().run(query);
            return rows.map((row) => {
                return this.mapEntity(row.toJSON(), columnNames);
            });
        }
        catch (err) {
            throw err;
        }
    }
    async findOne(options) {
        const columnNames = this.getColumnNames();
        const params = {};
        let sql = this.baseSelectQuery(columnNames, this.getMetaData());
        sql = sql.concat(' WHERE ');
        const wheres = Object.keys(options.where).map((key) => {
            params[key] = options.where[key];
            return key + '=@' + key + ' ';
        });
        sql = sql.concat(wheres.join(' AND '));
        sql = sql.concat(' LIMIT 1');
        this.logger.log(sql);
        this.logger.log(JSON.stringify(params));
        try {
            const [rows] = await this.spanner.getDb().run({
                json: false,
                sql: sql,
                params: params,
            });
            const entities = rows.map((row) => {
                return this.mapEntity(row.toJSON(), columnNames);
            });
            if (entities.length > 0) {
                return entities[0];
            }
            else {
                return null;
            }
        }
        catch (err) {
            throw err;
        }
    }
    async deleteByPK(options) {
        const meta = this.getMetaData();
        // check pk
        const pkColumns = meta.metaColumns
            .filter((metaColumn) => {
            return metaColumn.primary == true;
        })
            .map((column) => {
            return column.propertyName;
        });
        if (pkColumns.length == 0) {
            throw new Error('pk column not found');
        }
        pkColumns.forEach((pkColumn) => {
            if (!(pkColumn in options.where)) {
                throw new Error('pk column must set');
            }
        });
        let sql = 'DELETE FROM '.concat(meta.metaTable.name).concat(' WHERE ');
        const params = {};
        const wheres = Object.keys(options.where).map((key) => {
            params[key] = options.where[key];
            return key + '=@' + key + ' ';
        });
        sql = sql.concat(wheres.join(' AND '));
        this.logger.log(sql);
        this.logger.log(JSON.stringify(params));
        let count = 0;
        const db = await this.spanner.getDb();
        try {
            await db.runTransactionAsync(async (transaction) => {
                const [rowCount] = await transaction.runUpdate({
                    sql: sql,
                    params: params,
                });
                this.logger.log(sql);
                this.logger.log('delete row count:' + rowCount);
                await transaction.commit();
                count = rowCount;
            });
        }
        catch (err) {
            throw err;
        }
        return count;
    }
    async updateByPK(entity) {
        const meta = this.getMetaData();
        // check pk
        const pkColumns = meta.metaColumns
            .filter((metaColumn) => {
            return metaColumn.primary == true;
        })
            .map((column) => {
            return column.propertyName;
        });
        if (pkColumns.length == 0) {
            throw new Error('pk column not found.set pk column in entity');
        }
        pkColumns.forEach((pkColumn) => {
            if (!entity[pkColumn]) {
                throw new Error('pk column value must set.');
            }
        });
        let sql = 'UPDATE '.concat(meta.metaTable.name).concat(' SET ');
        const setters = [];
        const wheres = [];
        const params = {};
        Object.keys(entity).forEach((key) => {
            if (pkColumns.includes(key)) {
                wheres.push(key + '=@' + key);
                params[key] = entity[key];
            }
            else {
                if (entity[key]) {
                    setters.push(key + '=@' + key);
                    params[key] = entity[key];
                }
            }
        });
        sql = sql.concat(setters.join(' , '));
        sql = sql.concat(' WHERE ').concat(wheres.join(' AND '));
        const db = await this.spanner.getDb();
        let count = 0;
        try {
            await db.runTransactionAsync(async (transaction) => {
                const [rowCount] = await transaction.runUpdate({
                    sql: sql,
                    params: params,
                });
                this.logger.log(sql);
                this.logger.log(JSON.stringify(params));
                this.logger.log('update row count:' + rowCount);
                await transaction.commit();
                count = rowCount;
            });
        }
        catch (err) {
            throw err;
        }
        return count;
    }
    getMetaData() {
        const metaTable = (0, globals_1.getMetadataArgsStorage)().filterTables(this.target.constructor)[0];
        const metaColumns = (0, globals_1.getMetadataArgsStorage)().filterColumns(this.target.constructor);
        return { metaTable, metaColumns };
    }
    mapEntity(json, columnNames) {
        const entity = new this.target.constructor();
        columnNames.forEach((columnName) => {
            entity[columnName] = json[columnName];
        });
        return entity;
    }
    getColumnNames() {
        const meta = this.getMetaData();
        return meta.metaColumns.map((column) => {
            return column.propertyName;
        });
    }
    baseSelectQuery(columnNames, meta) {
        let query = 'SELECT ';
        query = query.concat(columnNames.join(', '));
        query = query.concat(' FROM ').concat(meta.metaTable.name);
        return query;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=repository.js.map