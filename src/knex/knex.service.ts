import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { AddCoefDto } from './dto/addCoef.dto';

@Injectable()
export class KnexService {
    constructor(@InjectKnex() private readonly knex: Knex) {}

    async isDataForDateExists(date: string, table: string): Promise<boolean> {
        const result = await this.knex(table).where('date', date).limit(1);
        return result.length > 0;
    }

    async upsertCoef(table: string, dto: AddCoefDto) {
        const existingData = await this.knex(table)
            .where('date', dto.date)
            .andWhere('warehouse', dto.warehouse)
            .first();

        if (existingData) {
            return this.knex(table)
                .update({ coef: dto.coef })
                .where('date', dto.date)
                .andWhere('warehouse', dto.warehouse);
        } else {
            return this.knex(table).insert(dto);
        }
    }

    async getCoefsByTable(table: string) {
        const coefs = await this.knex(table).select('warehouse', 'coef', 'date');
        return coefs;
    }
}
