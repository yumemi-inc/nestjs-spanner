"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const globals_1 = require("../globals");
function Entity(name) {
    return function (target) {
        (0, globals_1.getMetadataArgsStorage)().tables.push({
            target: target,
            name: name,
            repositoryName: target.name + 'Repository',
        });
    };
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map