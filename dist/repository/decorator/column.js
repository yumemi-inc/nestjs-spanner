"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = void 0;
const globals_1 = require("../globals");
function Column() {
    return (object, propertyName) => {
        (0, globals_1.getMetadataArgsStorage)().columns.push({
            target: object.constructor,
            propertyName: propertyName,
            primary: false,
            repositoryName: object.constructor.name + 'Repository',
        });
    };
}
exports.Column = Column;
//# sourceMappingURL=column.js.map