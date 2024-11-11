
import * as dotenv from 'dotenv';
import * as process from "node:process";

dotenv.config();


export const knexConfig = {
    config: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
        },
    }

};

