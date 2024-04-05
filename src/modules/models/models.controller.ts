import { Body, Controller, Get, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { ModelsService } from './models.service';
import { FilterModels, UpdateModel } from 'src/interfaces/Models.interface';

@Controller('models')
export class ModelsController {
    constructor(private readonly modelsService: ModelsService) { }

    @Get()
    async getModels(@Query() filters: FilterModels) {
        try {
            return await this.modelsService.get_all_models(filters);
        } catch (error) {
            return {
                code: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Ocurrió un error al intentar obtener la marca",
            }
        }
    }

    @Put('/:id')
    async updateModel(@Param('id') id: number, @Body() data: UpdateModel) {
        try {
            return await this.modelsService.update_model(id, data);
        } catch (error) {
            return {
                code: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Ocurrió un error al intentar obtener la marca",
            }
        }
    }
  
}
