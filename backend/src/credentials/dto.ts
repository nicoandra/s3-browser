import { ApiProperty } from '@nestjs/swagger';
import { CommonDto } from './../common/dto';

export class CredentialsDto extends CommonDto {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export class SetCredentialsRequestDto {
  @ApiProperty() region: string;
  @ApiProperty() accessKeyId: string;
  @ApiProperty() secretAccessKey: string;
}

export class SetCredentialsResponseDto {
  statusCode: number;
  message?: string;
}
