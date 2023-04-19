import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import { JobsController } from '@/controllers/job.controller';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([IndexController, JobsController]);
app.listen();
