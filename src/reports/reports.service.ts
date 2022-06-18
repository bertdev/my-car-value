import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { ApproveReportDto, CreateReportDto } from './dtos';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
  ) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.reportsRepository.create({ ...reportDto, user });
    return this.reportsRepository.save(report);
  }

  async changeApproval(id: number, approveReportDto: ApproveReportDto) {
    const report = await this.reportsRepository.findOne(id, {
      relations: ['user'],
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.approved = approveReportDto.approved;
    return this.reportsRepository.save(report);
  }
}
