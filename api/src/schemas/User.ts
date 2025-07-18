import mongoose, { Schema } from "mongoose";

export interface IPermissions {
  [key: string]: boolean;
}

export enum ERole {
  "ADMIN" = "admin",
  "CENSUS_TAKER" = "census_taker",
}

export interface IUser {
  fullname: string;
  email: string;
  role: string;
  password: string;
  token: string;
  isEnabled: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchemna = new Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: Object, required: true, enum: ERole },
    password: { type: String, required: true },
    token: { type: String, required: false },
    isEnabled: { type: Boolean, default: true },
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

interface IUserModel extends IUser, mongoose.Document {}

export const User = mongoose.model<IUserModel>("User", UserSchemna);
