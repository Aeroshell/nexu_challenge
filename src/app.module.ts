import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import environment from 'environment/environment'
import { DataSource } from 'typeorm'
import { BrandsModule } from './modules/brands/brands.module';
import { ModelsModule } from './modules/models/models.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [],
            inject: [],
            useFactory: () => ({
                type: 'mysql',
                host: environment.DATABASE.HOST,
                port: environment.DATABASE.PORT,
                username: environment.DATABASE.USERNAME,
                password: environment.DATABASE.PASSWORD,
                database: environment.DATABASE.DB_NAME,
                ssl: {
                    ca: environment.DATABASE.SSL_CERT,
                },
                logger: 'advanced-console',
                logging: environment.APPLICATION.ENV === 'DEV' ? 'all' : false,
                poolSize: 10,
                maxQueryExecutionTime: 60000, // 1 minuto
                extra: {
                    supportBigNumbers: true,
                }
            }),
            dataSourceFactory: async (options) => {
                const dataSource = await new DataSource(options).initialize()
                return dataSource
            },
        }),
        BrandsModule,
        ModelsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {}
