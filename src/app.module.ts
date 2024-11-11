import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from "@nestjs/config";
import {knexConfig} from "./knex/knex.config";
import {KnexModule} from "nestjs-knex";
import {KnexService} from "./knex/knex.service";
import {GoogleSheetsService} from "./google-sheets.service";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [
      ScheduleModule.forRoot(),
      KnexModule.forRoot(knexConfig),
      ConfigModule.forRoot({
        envFilePath: '.env',
      }),
  ],
  controllers: [AppController],
  providers: [AppService, KnexService, GoogleSheetsService],
})
export class AppModule {}
