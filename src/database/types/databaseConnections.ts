export enum dbTypes {
  sqlite = 'sqlite',
  postgres = 'postgres',
  mysql = 'mysql',
}

export type DbConfig = {
  type: dbTypes
  database: string;
  synchronize: boolean;
};
