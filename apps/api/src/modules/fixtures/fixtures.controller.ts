import { Controller, Get } from '@nestjs/common';
import { FixturesService } from './fixtures.service';

@Controller('fixtures')
export class FixturesController {
  constructor(private readonly fixturesService: FixturesService) {}

  @Get('fdr')
  getFdr() {
    return this.fixturesService.getFdr();
  }
}
