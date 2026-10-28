import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
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

/** Valores aceitos por `religiousSpacePraticalLanguages` no schema. */
export const RELIGIOUS_SPACE_PRATICAL_LANGUAGES = [
  "yoruba",
  "quicongo",
  "umbundo",
  "ewe fon",
  "outros",
] as const;

const CURRENT_YEAR = new Date().getFullYear();

/** Localização obtida via Google API (`IGeoLocation` no schema). */
export class CommunityGeoLocationDTO {
  @IsNumber()
  lat!: number;

  @IsNumber()
  long!: number;
}

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

class LeaderContactsDTO {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;
}

/**
 * Payload do cadastro voluntário (`POST /public/create`).
 *
 * Validação strict: apenas os campos abaixo são aceitos e, exceto
 * `communityGoogleApiLocalization` e `bio`, todos são obrigatórios — payload
 * inválido resulta em 400 com erros por campo. A localização, quando omitida,
 * é obtida por geocoding no servidor.
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

  @IsString()
  @IsIn(RELIGIOUS_SPACE_PRATICAL_LANGUAGES)
  religiousSpacePraticalLanguages!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1500)
  @Max(CURRENT_YEAR)
  religiousSpaceYearFoundation!: number;

  @IsString()
  @IsNotEmpty()
  religiousSpaceLeaderName!: string;

  @IsString()
  @IsNotEmpty()
  religiousSpaceLeaderFoundation!: string;

  @IsString()
  @IsNotEmpty()
  religiousSpacePositionName!: string;

  @IsString()
  @IsNotEmpty()
  religiousSpaceStartedBy!: string;

  @IsDateString()
  religiousSpaceNameDateStartedBy!: string;

  @IsString()
  @IsNotEmpty()
  leaderEthnicity!: string;

  @IsString()
  @IsNotEmpty()
  leaderGender!: string;

  @IsString()
  @IsNotEmpty()
  leaderEducationalLevel!: string;

  @IsBoolean()
  leaderSufferedRacism!: boolean;

  /** E-mail de contato da liderança (usado pela curadoria nas correções). */
  @IsObject()
  @ValidateNested()
  @Type(() => LeaderContactsDTO)
  leaderContacts!: LeaderContactsDTO;

  @IsOptional()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CommunityGeoLocationDTO)
  communityGoogleApiLocalization?: CommunityGeoLocationDTO;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CommunityAddressDTO)
  communityAddress!: CommunityAddressDTO;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsBoolean()
  authorization!: boolean;
}
