import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { KnexService } from './knex/knex.service';
import * as path from 'node:path';
import * as process from 'node:process';

@Injectable()
export class GoogleSheetsService {
    private sheets: any;

    constructor(
        private readonly knexService: KnexService,
    ) {}

    private async getAuth() {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(__dirname, '..', 'google-api-key.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    async uploadToGoogleSheets() {
        await this.getAuth();
        const tables = [
            'overallcoefs',
            'deliverybase',
            'deliveryliter',
            'storagebase',
            'storageliter'
        ];

        for (const table of tables) {
            const coefs = await this.knexService.getCoefsByTable(table);
            coefs.sort((a, b) => {
                // Сравниваем даты
                const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateComparison !== 0) return dateComparison;


                return a.coef - b.coef;
            });

            const rows = coefs.map((item) => [item.warehouse, item.coef, item.date]);

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `${table}!A2`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: rows,
                },
            });

            console.log(`Data uploaded to Google Sheets for ${table}`);
        }
    }
}
