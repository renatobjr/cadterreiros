import { Expose, Transform, Type } from "class-transformer";

class UserDTO {
  @Expose({ name: "_id" })
  id!: string;

  @Expose({ name: "fullname" })
  fullname!: string;

  @Expose({ name: "email" })
  email!: string;
}

export class AuthLoginDTO {
  @Expose({ name: "user" })
  @Type(() => UserDTO)
  @Transform((value) => {
    return {
      id: value.obj._id,
      fullname: value.obj.fullname,
      email: value.obj.email,
    };
  })
  user!: UserDTO;

  @Expose({ name: "token" })
  token!: string;
}
