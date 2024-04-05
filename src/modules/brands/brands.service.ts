import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CustomResponse } from 'src/interfaces/CustomResponse.interface';
import { CreateBrand } from 'src/interfaces/Brands.interface';
import { isIntegerPositive, isNumber } from 'src/utils/numeric';
import { CreateModel } from 'src/interfaces/Models.interface';
import * as currency from 'currency.js';

@Injectable()
export class BrandsService {
    constructor(private dataSource: DataSource) { }

    async get_all_brands(): Promise<CustomResponse> {
        try {
            const query_brands = `
                SELECT id, nombre, average_price FROM brands
            `;
            const result_brand = await this.dataSource.query(query_brands);
            if (!result_brand || !Array.isArray(result_brand)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "No se encontró ninguna marca" }
            } else {
                return { success: true, code: HttpStatus.OK, data: result_brand }
            }
        } catch (error) {
            Logger.log(error.message, "get_all_brands");
            return { success: false, code: HttpStatus.BAD_REQUEST, message: "Ocurrió un error al obtener las marcas" }
        }
    }

    async get_models_by_brand(id: number): Promise<CustomResponse> {
        try {
            if (!id) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un id de marca válido" }
            }
            const query_brands = `
                SELECT id, name, average_price FROM models WHERE brand_id = ?
            `;
            const result_brand = await this.dataSource.query(query_brands, [id]);
            if (!result_brand || !Array.isArray(result_brand)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "No se encontró ninguna marca" }
            } else {
                return { success: true, code: HttpStatus.OK, data: result_brand }
            }
        } catch (error) {
            Logger.log(error.message, "get_models_by_brand");
            return { success: false, code: HttpStatus.BAD_REQUEST, message: "Ocurrió un error al obtener las marcas" }
        }
    }

    async create_brand({ name }: CreateBrand): Promise<CustomResponse> {
        try {
            if (!name) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un nombre válido" }
            }
            name = `${name}`.trim();
            const query_verify_brands = `
                SELECT id FROM brands WHERE UPPER(nombre) = UPPER(?)
            `;
            const verify_brand = await this.dataSource.query(query_verify_brands, [name]);
            if (verify_brand && Array.isArray(verify_brand) && verify_brand.length > 0) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: `La marca (${name}) ya se encuentra registrada` }
            }
            const query_brands = `
                INSERT INTO brands (nombre, average_price)
                VALUES(?, ?);
            `;
            const result_brand = await this.dataSource.query(query_brands, [name, 0]);
            if (result_brand.insertId) {
                return { success: true, code: HttpStatus.OK, message: "Marca insertada con éxito", data: { insertedId: result_brand.insertId } }
            } else {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "No se pudo insertar la marca" }
            }
        } catch (error) {
            Logger.log(error.message, "create_brand");
            return { success: false, code: HttpStatus.BAD_REQUEST, message: "Ocurrió un error al crear la marca" }
        }
    }

    async create_model(id_brand: number, data: CreateModel): Promise<CustomResponse> {
        const queryRunner = this.dataSource.createQueryRunner();
        try {
            if (!isIntegerPositive(id_brand)) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un id de marca válido" }
            }
            if (!data.name || `${data.name}`.trim() == "") {
                return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un nombre válido" }
            }
            let average_price_included = false;
            if (typeof data.average_price !== "undefined") {
                if (!isNumber(data.average_price)) {
                    return { success: false, code: HttpStatus.NO_CONTENT, message: "Proporcione un precio válido" }
                } else if (currency(data.average_price).value <= 100000) {
                    return { success: false, code: HttpStatus.NO_CONTENT, message: "El promedio debe ser mayor a 100,000" }
                }
                average_price_included = true;
            }
            const aux_id_brand = +id_brand;
            const aux_name = `${data.name}`.trim();
            const aux_average_price = average_price_included ? currency(data.average_price) : currency(0);
            const query_verify_brands = `
                SELECT id FROM brands WHERE id = ?
            `;
            const verify_brand = await this.dataSource.query(query_verify_brands, [aux_id_brand]);
            if (!verify_brand || !Array.isArray(verify_brand) || verify_brand?.length == 0) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: `El id de marca proporcionada no existe` }
            }

            const query_verify_models = `
                SELECT id FROM models WHERE UPPER(name) = UPPER(?) AND brand_id = ?
            `;
            const verify_models = await this.dataSource.query(query_verify_models, [aux_name, aux_id_brand]);
            if (verify_models && Array.isArray(verify_models) && verify_models.length > 0) {
                return { success: false, code: HttpStatus.NO_CONTENT, message: `El modelo (${aux_name}) ya se encuentra registrado en la marca (${aux_id_brand})` }
            }
            const query_all_models = `
                SELECT id, average_price FROM models WHERE brand_id = ?
            `;
            const all_models = await this.dataSource.query(query_all_models, [aux_id_brand]);
            let aux_average_brand = currency(aux_average_price);
            if (all_models && Array.isArray(all_models) && all_models.length > 0) {
                for (const temp_model of all_models) {
                    aux_average_brand = aux_average_brand.add(temp_model.average_price);
                }
                aux_average_brand = aux_average_brand.divide(all_models.length + 1);
            }
            //iniciar una transaccion para evitar inserciones a medias
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const query_insert_model = `
                INSERT INTO models (brand_id, name, average_price)
                VALUES(?, ?, ?);
            `;
            await queryRunner.query(query_insert_model, [aux_id_brand, aux_name, aux_average_price.value]);
            
            const query_update_brand = `
                UPDATE brands SET average_price = ? WHERE id = ?
            `;
            await queryRunner.query(query_update_brand, [aux_average_brand.value, aux_id_brand]);
            //finalizamos la transaccion y liberamos la conexion
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
            Logger.log(error.message, "create_model");
            return { success: false, code: HttpStatus.BAD_REQUEST, message: "Ocurrió un error al crear el modelo" }
        }
    }
}
