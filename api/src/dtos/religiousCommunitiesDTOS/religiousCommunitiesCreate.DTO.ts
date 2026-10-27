import { Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

/** Valores aceitos por `communityType` em `ReligiousCommunitySchema`. */
export const COMMUNITY_TYPES = [
  "matriz africana",
  "comunidade de terreiro",
] as const;

/** Valores aceitos por `religiousSpaceNation` em `ReligiousCommunitySchema`. */
export const RELIGIOUS_SPACE_NATIONS = [
  "angola",
  "ekiti efon",
  "jeje",
  "ketu",
  "nagô",
  "quimbanda",
  "tambor de mina",
  "umbanda",
  "outros",
] as const;

const CURRENT_YEAR = new Date().getFullYear();

export class CommunityAddressDTO {
  @IsString()
  @IsNotEmpty()
  fullAddress!: string;

  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  zipcode!: string;
}

/**
 * Payload do cadastro voluntário (`POST /public/create`).
 *
 * Validação strict: apenas os campos abaixo são aceitos e todos são
 * obrigatórios — payload inválido resulta em 400 com erros por campo.
 */
export class ReligiousCommunityCreateDTO {
  @IsString()
  @IsNotEmpty()
  religiousSpaceName!: string;

  @IsString()
  @IsIn(COMMUNITY_TYPES)
  communityType!: string;

  @IsString()
  @IsIn(RELIGIOUS_SPACE_NATIONS)
  religiousSpaceNation!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1500)
  @Max(CURRENT_YEAR)
  religiousSpaceYearFoundation!: number;

  @IsString()
  @IsNotEmpty()
  religiousSpaceLeaderName!: string;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CommunityAddressDTO)
  communityAddress!: CommunityAddressDTO;

  @IsBoolean()
  authorization!: boolean;
}
