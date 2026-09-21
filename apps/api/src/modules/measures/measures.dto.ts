import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ControlStatus } from '@prisma/client';

export class CreateMeasureDto {
  @ApiProperty({ example: 'Access Review Process' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ControlStatus, required: false })
  @IsEnum(ControlStatus)
  @IsOptional()
  status?: ControlStatus;
}

export class UpdateMeasureDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ControlStatus, required: false })
  @IsEnum(ControlStatus)
  @IsOptional()
  status?: ControlStatus;
}

export class AssignControlDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  controlId: string;
}

export class AssignEvidenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  evidenceId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
