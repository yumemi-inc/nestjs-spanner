export type FindOptionsWhereProperty<Property> = Property extends Promise<
  infer I
>
  ? FindOptionsWhereProperty<NonNullable<I>>
  : Property extends Array<infer I>
  ? FindOptionsWhere<Property> | FindOptionsWhere<Property>[]
  : Property

export type FindOptionsWhere<Entity> = {
  [P in keyof Entity]?: FindOptionsWhereProperty<NonNullable<Entity[P]>>
}
