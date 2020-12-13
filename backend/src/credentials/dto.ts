import { ApiProperty } from '@nestjs/swagger';

export class CredentialsDto {
    region: string
    accessKeyId: string
    secretAccessKey: string
}

export class SetCredentialsRequestDto {
    @ApiProperty() region: string
    @ApiProperty() accessKeyId: string
    @ApiProperty() secretAccessKey: string
}

export class SetCredentialsResponseDto {
    statusCode: number
    message?: string
}