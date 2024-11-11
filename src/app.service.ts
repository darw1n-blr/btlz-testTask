import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import { KnexService } from './knex/knex.service';
import { AddCoefDto } from './knex/dto/addCoef.dto';
import { Cron } from '@nestjs/schedule';
import { GoogleSheetsService } from './google-sheets.service';
import axios from 'axios';

@Injectable()
export class AppService {

    constructor(
        private readonly knexService: KnexService,
        private readonly googleSheetsService: GoogleSheetsService,
    ) {}

    async getApiData(date: string): Promise<any[]> {
        try {
            const response = await axios.get(process.env.WB_API_URL, {
                headers: {
                    Authorization: process.env.WB_API_KEY,
                },
                params: { date: date },
            });

            // @ts-ignore
            const data = response.data.response.data.warehouseList.map((warehouse) => ({
                boxDeliveryAndStorageExpr: warehouse.boxDeliveryAndStorageExpr,
                warehouseName: warehouse.warehouseName,
                date: date,
            }));

            return data;
        } catch (error) {
            console.error('Error fetching data from API:', error);
            return [];
        }
    }

    @Cron('0 * * * *')
    async updateData() {
        const date: string = new Date().toISOString().split('T')[0];
        const tables = [
            'overallcoefs',
            'deliverybase',
            'deliveryliter',
            'storagebase',
            'storageliter'
        ];

        for (const table of tables) {
            const isDataExists = await this.knexService.isDataForDateExists(date, table);

            if (!isDataExists) {
                console.log(`No data for date ${date} in ${table}. Fetching new data from API...`);
                await this.fetchAndUpdateData(date);
            } else {
                console.log(`Data for date ${date} already exists in ${table}. Updating existing records...`);
                await this.fetchAndUpdateData(date);
            }
        }
    }

    private async fetchAndUpdateData(date: string) {
        const data = await this.getApiData(date);

        if (data.length === 0) {
            console.log('No data to update.');
            return;
        }

        for (const item of data) {
            const dto: AddCoefDto = {
                warehouse: item.warehouseName,
                date: item.date,
                coef: item.boxDeliveryAndStorageExpr,
            };


            await this.knexService.upsertCoef('overallcoefs', dto);
            await this.knexService.upsertCoef('deliverybase', dto);
            await this.knexService.upsertCoef('deliveryliter', dto);
            await this.knexService.upsertCoef('storagebase', dto);
            await this.knexService.upsertCoef('storageliter', dto);
        }

        console.log('Data successfully updated in the database');
        await this.googleSheetsService.uploadToGoogleSheets();
    }
}
