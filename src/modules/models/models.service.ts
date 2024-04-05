import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomResponse } from 'src/interfaces/CustomResponse.interface';
import { FilterModels, UpdateModel } from 'src/interfaces/Models.interface';
import { isIntegerPositive, isNumber } from 'src/utils/numeric';
import * as currency from 'currency.js';

@Injectable()
export class ModelsService {
    constructor(private dataSource: DataSource) { }

    async get_all_models(filters: FilterModels): Promise<CustomResponse> {
        try {
            if (filters.greater && !isNumber(filters.greater)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un valor en el parámetro greater válido" }
            }
            if (filters.lower && !isNumber(filters.lower)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un valor en el parámetro lower válido" }
            }
            let query_models = `
                SELECT id, brand_id, name, average_price FROM models
            `;
            const params = [];
            if (typeof filters.greater !== "undefined" && typeof filters.lower !== "undefined") {
                const aux_greater = currency(filters.greater).value;
                const aux_lower = currency(filters.lower).value;
                query_models += ` WHERE average_price > ? OR average_price < ?`
                params.push(aux_greater, aux_lower);
            } else if (typeof filters.greater !== "undefined") {
                const aux_greater = currency(filters.greater).value;
                query_models += ` WHERE average_price > ?`
                params.push(aux_greater);
            } else if (typeof filters.lower !== "undefined") {
                const aux_lower = currency(filters.lower).value;
                query_models += ` WHERE average_price < ?`
                params.push(aux_lower);
            }
            const result_models = await this.dataSource.query(query_models, params);
            if (!result_models || !Array.isArray(result_models)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "No se encontró ningun modelo" }
            } else {
                return { success: true, code: HttpStatus.OK, data: result_models }
            }
        } catch (error) {
            Logger.log(error.message, "get_all_models");
            return { success: false, code: HttpStatus.BAD_REQUEST, message: "Ocurrió un error al obtener las marcas" }
        }
    }

    async update_model(id_model: number, data: UpdateModel): Promise<CustomResponse> {
        
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            if (!isIntegerPositive(id_model)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un id de modelo válido" }
            }
            if (!isNumber(data.average_price)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un precio válido" }
            } else if (currency(data.average_price).value <= 100000) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "El promedio debe ser mayor a 100,000" }
            }
            const aux_id_model = +id_model;
            const aux_average_price = currency(data.average_price);
            const query_verify_model = `
                SELECT id, brand_id FROM models WHERE id = ?
            `;
            const verify_model = await this.dataSource.query(query_verify_model, [aux_id_model]);
            if (!verify_model || !Array.isArray(verify_model) || verify_model?.length == 0) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: `El id de modelo proporcionado no existe` }
            }
            const individual_model = verify_model[0];

            const query_all_models = `
                SELECT id, brand_id, average_price FROM models WHERE brand_id = ?
            `;
            const all_models = await this.dataSource.query(query_all_models, [individual_model.brand_id]);
            let aux_average_brand = currency(aux_average_price);
            if (all_models && Array.isArray(all_models) && all_models.length > 0) {
                for (const temp_model of all_models) {
                    if (+temp_model.id !== aux_id_model) {
                        aux_average_brand = aux_average_brand.add(temp_model.average_price);
                    }
                }
                aux_average_brand = aux_average_brand.divide(all_models.length);
            }
            
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const query_update_model = `
                UPDATE models SET average_price = ? WHERE id = ?
            `;
            await queryRunner.query(query_update_model, [aux_average_price.value, aux_id_model]);
            
            const query_update_brand = `
                UPDATE brands SET average_price = ? WHERE id = ?
            `;
            await queryRunner.query(query_update_brand, [aux_average_brand.value, individual_model.brand_id]);

            await queryRunner.commitTransaction();
            await queryRunner.release();

            return { success: true, code: HttpStatus.OK, message: "Modelo insertado correctamente" }
        } catch (error) {
            // Deshace la transacción en caso de error
            if (queryRunner !== null) {
                try {
                    if (queryRunner.isTransactionActive) {
                        await queryRunner.rollbackTransaction();
                    }
                    await queryRunner.release();
                } catch (rollbackError) {
                    // Manejar el error de rollback
                    Logger.error(rollbackError.message, 'Error en el rollback de la transacción');
                }
            }
            Logger.log(error.message, "update_model");
            return { success: false, code: HttpStatus.BAD_REQUEST, message: "Ocurrió un error al crear el modelo" }
        }
    }
}
