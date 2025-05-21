import { config } from 'dotenv';
import { resolve } from 'path';

const env = process.env.NODE_ENV;

/* by default, dotenv will look for a .env file in the root of the project
if you want to use a different file, you can specify the path
*/
config({ path: env ? resolve(process.cwd(), `env/.env.${env}`) : './*.env' });
