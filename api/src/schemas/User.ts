import mongoose, { Schema } from "mongoose";

export interface IPermissions {
  [key: string]: boolean;
}

export interface IRole {
  [key: string]: boolean;
}

export interface IUser {
  fullname: string;
  email: string;
  permissions: IPermissions;
  role: IRole;
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
    permissions: { type: Object, required: false },
    role: { type: Object, required: false },
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
