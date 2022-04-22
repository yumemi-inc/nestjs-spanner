"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SpannerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpannerService = void 0;
const spanner_1 = require("@google-cloud/spanner");
const common_1 = require("@nestjs/common");
let SpannerService = SpannerService_1 = class SpannerService {
    constructor() {
        this.logger = new common_1.Logger(SpannerService_1.name);
        const projectId = process.env.SPANNER_PROJECT_ID;
        const instanceId = process.env.SPANNER_INSTANCE_ID;
        const databaseId = process.env.SPANNER_DATABASE_ID;
        this.logger.log('projectId:' + projectId);
        this.logger.log('instanceId:' + instanceId);
        this.logger.log('databaseId:' + databaseId);
        this.logger.log('emulator host:' + process.env.SPANNER_EMULATOR_HOST);
        const spanner = new spanner_1.Spanner({ projectId });
        const instance = spanner.instance(instanceId);
        const poolOption = {
            acquireTimeout: 2000,
            fail: true,
        };
        this.db = instance.database(databaseId, poolOption);
    }
    getDb() {
        return this.db;
    }
};
SpannerService = SpannerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SpannerService);
exports.SpannerService = SpannerService;
//# sourceMappingURL=spanner.service.js.map