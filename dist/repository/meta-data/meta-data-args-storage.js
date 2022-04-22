"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaDataArgsStorage = void 0;
class MetaDataArgsStorage {
    constructor() {
        this.tables = [];
        this.columns = [];
    }
    filterTables(target) {
        return this.filterByTarget(this.tables, target);
    }
    filterColumns(target) {
        return this.filterByTargetAndWithoutDuplicateProperties(this.columns, target);
    }
    /**
     * Filters given array by a given target or targets.
     */
    filterByTarget(array, target) {
        return array.filter((table) => {
            return Array.isArray(target)
                ? target.indexOf(table.target) !== -1
                : table.target === target;
        });
    }
    /**
     * Filters given array by a given target or targets and prevents duplicate property names.
     */
    filterByTargetAndWithoutDuplicateProperties(array, target) {
        const newArray = [];
        array.forEach((item) => {
            const sameTarget = Array.isArray(target)
                ? target.indexOf(item.target) !== -1
                : item.target === target;
            if (sameTarget) {
                if (!newArray.find((newItem) => newItem.propertyName === item.propertyName))
                    newArray.push(item);
            }
        });
        return newArray;
    }
}
exports.MetaDataArgsStorage = MetaDataArgsStorage;
//# sourceMappingURL=meta-data-args-storage.js.map