import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// ==================== AUTH DTOs ====================

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(["BRAND", "INFLUENCER"])
  role: "BRAND" | "INFLUENCER";
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// ==================== INFLUENCER DTOs ====================

export class UpdateInfluencerDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  rank?: number;
}

export class SocialAccountDto {
  @IsEnum(["INSTAGRAM", "YOUTUBE", "TIKTOK", "TELEGRAM", "TWITTER"])
  platform: "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "TELEGRAM" | "TWITTER";

  @IsString()
  username: string;

  @IsNumber()
  @Min(0)
  followers: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  engagement: number;

  @IsUrl()
  url: string;
}

export class SearchInfluencersDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minFollowers?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  page?: number;
}

export class RankingItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(1)
  rank: number;
}

export class UpdateRankingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RankingItemDto)
  rankings: RankingItemDto[];
}

// ==================== CAMPAIGN DTOs ====================

export class CreateCampaignDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(1)
  budget: number;

  @IsString()
  platform: string;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsString()
  requirements?: string;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  budget?: number;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEnum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export class SubmitBidDto {
  @IsNumber()
  @Min(1)
  price: number;

  @IsString()
  @MinLength(10)
  proposal: string;

  @IsDateString()
  deliveryTime: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ==================== DEAL DTOs ====================

export class UpdateDealStatusDto {
  @IsEnum(["ACTIVE", "CONTENT_SUBMITTED", "APPROVED", "COMPLETED", "CANCELLED"])
  status: "ACTIVE" | "CONTENT_SUBMITTED" | "APPROVED" | "COMPLETED" | "CANCELLED";
}

export class SubmitContentDto {
  @IsUrl()
  contentUrl: string;
}

// ==================== CHAT DTOs ====================

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @Max(5000)
  content: string;
}

// ==================== ADMIN DTOs ====================

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(["BRAND", "INFLUENCER", "ADMIN"])
  role: "BRAND" | "INFLUENCER" | "ADMIN";
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(["BRAND", "INFLUENCER", "ADMIN"])
  role?: "BRAND" | "INFLUENCER" | "ADMIN";
}

export class SwitchRoleDto {
  @IsEnum(["BRAND", "INFLUENCER", "ADMIN"])
  role: "BRAND" | "INFLUENCER" | "ADMIN";
}

export class ActivateSubscriptionDto {
  @IsString()
  tier: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays: number;
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}
