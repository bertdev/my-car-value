import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { CreateReportDto, ReportDto, ApproveReportDto } from './dtos';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReports(@Body() data: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(data, user);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  approveReport(@Param('id') id: string, @Body() data: ApproveReportDto) {
    return this.reportsService.changeApproval(Number(id), data);
  }
}
