import { IsEmail, IsString } from 'class-validator';

export class CreateJobDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}
