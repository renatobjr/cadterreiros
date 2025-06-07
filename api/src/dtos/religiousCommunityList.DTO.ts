import { Expose, Transform } from "class-transformer";

export class ReligiousCommunityListDTO {
  @Expose({ name: "id" })
  id!: string;

  @Expose()
  community_type!: string;

  @Expose()
  religious_space_year_foundation!: string;

  @Expose()
  religious_space_nation!: string;

  @Expose()
  religious_space_pratical_languages!: string;

  @Expose()
  religious_space_name!: string;

  @Expose()
  @Transform((value) => value.obj.community_address.neighborhood)
  neighborhood!: string;

  @Expose()
  @Transform((value) => value.obj.community_address.city)
  city!: string;
}
