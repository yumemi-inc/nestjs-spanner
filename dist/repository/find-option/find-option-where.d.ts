/**
 * A single property handler for FindOptionsWere.
 */
export declare type FindOptionsWhereProperty<Property> = Property extends Promise<infer I> ? FindOptionsWhereProperty<NonNullable<I>> : Property extends Array<infer I> ? FindOptionsWhere<Property> | FindOptionsWhere<Property>[] : Property;
/** :
 * Used for find operations.
 */
export declare type FindOptionsWhere<Entity> = {
    [P in keyof Entity]?: FindOptionsWhereProperty<NonNullable<Entity[P]>>;
};
