import { Request, Response } from "express";
import { usersService } from "@/api/services/users.service";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { ERole, IUser, User } from "@/api/schemas/User";
import { plainToInstance } from "class-transformer";
import { UsersListDTO } from "../dtos/usersDTO/usersList.DTO";

const ALLOWED_ROLES = [ERole.ADMIN, ERole.CENSUS_TAKER];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mantém ao menos um administrador ativo no painel. */
async function isLastActiveAdmin(id: string): Promise<boolean> {
  const target = await User.findById(id);
  if (!target || target.role !== ERole.ADMIN) return false;
  const activeAdmins = await User.countDocuments({
    role: ERole.ADMIN,
    isEnabled: true,
  });
  return activeAdmins <= 1;
}

export const usersController = {
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await usersService.list();
      res.apiResponse<IUser[]>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  listAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await usersService.listAll();
      res.apiResponse<IUser[]>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  setUserStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, status } = req.body;

      if (typeof id !== "string" || typeof status !== "boolean") {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "Dados inválidos",
          status: false,
        });
      }

      // Ninguém desativa a própria conta: sem isso, o último admin pode se
      // trancar para fora do painel.
      if (req.user?.id === id && status === false) {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "Você não pode desativar a própria conta",
          status: false,
        });
      }

      if (status === false && (await isLastActiveAdmin(id))) {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "É preciso manter ao menos um administrador ativo",
          status: false,
        });
      }

      const response = await usersService.setUserStatus(id, status);
      res.apiResponse<IUser>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  changeUserRole: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, role } = req.body;

      if (
        typeof id !== "string" ||
        typeof role !== "string" ||
        !ALLOWED_ROLES.includes(role as ERole)
      ) {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "Dados inválidos",
          status: false,
        });
      }

      // Rebaixar a si mesmo removeria o acesso ao painel no próximo request.
      if (req.user?.id === id && role !== ERole.ADMIN) {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "Você não pode alterar o próprio papel",
          status: false,
        });
      }

      if (role !== ERole.ADMIN && (await isLastActiveAdmin(id))) {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "É preciso manter ao menos um administrador ativo",
          status: false,
        });
      }

      const response = await usersService.changeUserRole(id, role);
      res.apiResponse<IUser>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  addUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fullname, email, role } = req.body;

      if (
        typeof email !== "string" ||
        !EMAIL.test(email) ||
        typeof role !== "string" ||
        !ALLOWED_ROLES.includes(role as ERole)
      ) {
        return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
          error: "Dados inválidos",
          status: false,
        });
      }

      const response = await usersService.addUser(
        email,
        role as ERole,
        typeof fullname === "string" ? fullname : undefined
      );
      res.apiResponse<IUser>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },
};
