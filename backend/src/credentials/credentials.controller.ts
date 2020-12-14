import { Body, Controller, Post, Get } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import {
  SetCredentialsResponseDto,
  SetCredentialsRequestDto,
  CredentialsDto,
} from './dto';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post()
  async setCredentials(
    @Body() credentials: SetCredentialsRequestDto,
  ): Promise<SetCredentialsResponseDto> {
    const result = new SetCredentialsResponseDto();
    try {
      this.credentialsService.save(credentials);
      await this.credentialsService.validate();
      result.statusCode = 201;
    } catch (ex) {
      result.statusCode = 401;
      result.message = ex.toString();
    }
    return result;
  }

  @Get()
  getCredentials(): CredentialsDto {
    return this.credentialsService.get();
  }
}
