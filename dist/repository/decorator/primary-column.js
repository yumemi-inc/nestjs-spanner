"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryColumn = void 0;
const globals_1 = require("../globals");
function PrimaryColumn() {
    return function (object, propertyName) {
        (0, globals_1.getMetadataArgsStorage)().columns.push({
            target: object.constructor,
            propertyName: propertyName,
            primary: true,
            repositoryName: object.constructor.name + 'Repository',
        });
    };
}
exports.PrimaryColumn = PrimaryColumn;
//# sourceMappingURL=primary-column.js.map