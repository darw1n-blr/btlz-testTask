import {Body, Controller, Get, Post} from '@nestjs/common';
import { AppService } from './app.service';
import {AddCoefDto} from "./knex/dto/addCoef.dto";
import {KnexService} from "./knex/knex.service";
import {GoogleSheetsService} from "./google-sheets.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly knexService: KnexService,
              private readonly googleSheetsService: GoogleSheetsService) {}


    @Post('update')
    updateData(){
    this.appService.updateData()
    }




}
