import { SpannerService } from '../service/spanner.service';
import { FindOneOptions } from './find-option/find-one-option';
import { ColumnMetaDataArgs } from './meta-data/column-meta-data-args';
import { TableMetaDataArgs } from './meta-data/table-meta-data-args';
import { Json } from '@google-cloud/spanner/build/src/codec';
declare type Meta = {
    metaTable: TableMetaDataArgs;
    metaColumns: ColumnMetaDataArgs[];
};
export declare class Repository<T> {
    readonly spanner: SpannerService;
    private readonly logger;
    private readonly target;
    constructor(spanner: SpannerService, ctor: {
        new (): T;
    });
    insert(entity: T): Promise<T>;
    findAll(): Promise<T[]>;
    findOne(options: FindOneOptions<T>): Promise<T | null>;
    deleteByPK(options: FindOneOptions<T>): Promise<number>;
    updateByPK(entity: T): Promise<number>;
    protected getMetaData(): Meta;
    protected mapEntity(json: Json, columnNames: string[]): T;
    protected getColumnNames(): string[];
    protected baseSelectQuery(columnNames: string[], meta: Meta): string;
}
export {};
