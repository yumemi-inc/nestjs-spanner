import { Database } from '@google-cloud/spanner/build/src/database';
export declare class SpannerService {
    private readonly logger;
    private readonly db;
    constructor();
    getDb(): Database;
}
