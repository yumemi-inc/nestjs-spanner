import { ColumnMetaDataArgs } from './column-meta-data-args';
import { TableMetaDataArgs } from './table-meta-data-args';
export declare class MetaDataArgsStorage {
    readonly tables: TableMetaDataArgs[];
    readonly columns: ColumnMetaDataArgs[];
    filterTables(target: (Function | string) | (Function | string)[]): TableMetaDataArgs[];
    filterColumns(target: (Function | string) | (Function | string)[]): ColumnMetaDataArgs[];
    /**
     * Filters given array by a given target or targets.
     */
    protected filterByTarget<T extends {
        target: Function | string;
    }>(array: T[], target: (Function | string) | (Function | string)[]): T[];
    /**
     * Filters given array by a given target or targets and prevents duplicate property names.
     */
    protected filterByTargetAndWithoutDuplicateProperties<T extends {
        target: Function | string;
        propertyName: string;
    }>(array: T[], target: (Function | string) | (Function | string)[]): T[];
}
