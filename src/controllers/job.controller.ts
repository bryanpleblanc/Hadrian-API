import { Controller, Param, Body, Get, Post, Delete, HttpCode } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { JobSchema, JobListSchema } from '../interfaces/job.interface';
import JobService from '../services/job.service';

@Controller()
export class JobsController {
  public jobService = new JobService();

  @Get('/jobs')
  @OpenAPI({ summary: 'Return a list of jobs' })
  async getJobs() {
    try {
      const findAllJobsData: JobListSchema[] = await this.jobService.findAllJob();
    return { data: findAllJobsData, message: 'findAll' };
    } catch(e) {
      console.log(e);
    }
    
  }

  // @Get('/jobs/query/:query')
  // @OpenAPI({ summary: 'Return a list of jobs' })
  // async getJobsByQuery(@Param('query') query: string) {
  //   const jobsData: JobList = await this.jobService.findJobByQuery(query);
  //   return { data: jobsData, message: 'findAll' };
  // }

  // @Post('/jobs')
  // @HttpCode(201)
  // @OpenAPI({ summary: 'Create a new job' })
  // async createJob(@Body() jobData: Job) {
  //   await this.jobService.createJob(jobData);
  //   return { message: 'created' };
  // }

  // @Delete('/jobs/:id')
  // @OpenAPI({ summary: 'Delete a job' })
  // async deleteJob(@Param('id') id: string) {
  //   await this.jobService.deleteJob(id);
  //   return { message: 'deleted' };
  // }
}
