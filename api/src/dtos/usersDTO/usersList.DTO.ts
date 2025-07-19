import { Expose, Transform } from "class-transformer";

export class UsersListDTO {
  @Expose()
  @Transform((value) => value.obj._id)
  id!: string;
  @Expose()
  fullname!: string;
  @Expose()
  email!: string;
  @Expose()
  role!: string;
  @Expose()
  isEnabled!: boolean;
  @Expose()
  isFirstLogin!: boolean;
  @Expose()
  lastLogin!: Date;
  @Expose()
  createdAt!: Date;
  @Expose()
  updatedAt!: Date;
}
