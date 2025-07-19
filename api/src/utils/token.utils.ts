import jwt, { JwtPayload } from "jsonwebtoken";

type DecodedToken = {
  id: string;
  iat?: number;
  exp?: number;
};

const tokenUtils = {
  generate: (data: any, options?: any): string => {
    return jwt.sign(data, process.env.JWT_SECRET as string, options);
  },
  verify: (token: string): DecodedToken | null => {
    if (token !== undefined) {
      try {
        return jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as DecodedToken;
      } catch (error) {
        return null;
      }
    }
    return null;
  },
};

export default tokenUtils;
