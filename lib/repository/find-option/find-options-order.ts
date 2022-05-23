export type FindOptionsOrderProperty<Property> = Property extends Promise<
  infer I
>
  ? FindOptionsOrder<Property>
  : FindOptionsOrderValue

export type FindOptionsOrder<Entity> = {
  [P in keyof Entity]?: FindOptionsOrderProperty<NonNullable<Entity[P]>>
}

export type FindOptionsOrderValue = 'ASC' | 'DESC' | 'asc' | 'desc'
