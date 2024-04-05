import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrand } from 'src/interfaces/Brands.interface';
import { CreateModel } from 'src/interfaces/Models.interface';

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Get()
    async getBrands() {
        try {
            return await this.brandsService.get_all_brands();
        } catch (error) {
            return {
                code: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Ocurrió un error al intentar obtener la marca",
            }
        }
    }

    @Get(`/:id/models`)
    async getModelsByBrand(@Param('id') id: number) {
        try {
            return await this.brandsService.get_models_by_brand(id);
        } catch (error) {
            return {
                code: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Ocurrió un error al intentar obtener los modelos",
            }
        }
    }
    
    @Post()
    async createBrand(@Body() data: CreateBrand) {
        try {
            return await this.brandsService.create_brand(data);
        } catch (error) {
            return {
                code: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Ocurrió un error al intentar obtener la marca",
            }
        }
    }
  
    @Post('/:id/models')
    async createModelForBrand(@Param('id') id: number, @Body() data: CreateModel) {
        try {
            return await this.brandsService.create_model(id, data);
        } catch (error) {
            return {
                code: HttpStatus.BAD_REQUEST,
                success: false,
                message: "Ocurrió un error al intentar obtener la marca",
            }
        }
    }
}
