import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Transform } from 'class-transformer';

const currentYear = new Date().getUTCFullYear();

export class GetEstimateDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1930)
  @Max(currentYear)
  year: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @Transform(({ value }) => Number(value))
  @IsLongitude()
  lng: number;

  @Transform(({ value }) => Number(value))
  @IsLatitude()
  lat: number;
}
