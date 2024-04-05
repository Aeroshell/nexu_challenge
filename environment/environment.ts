import 'dotenv/config'

export default {
    APPLICATION: {
        HOST: process.env.APP_HOST || '127.0.0.1',
        ENV: process.env.APP_ENV || 'DEV',
        PORT: +process.env.APP_PORT || 3000,
    },
    DATABASE: {
        HOST: process.env.MYSQL_DB_HOST,
        PORT: +process.env.MYSQL_DB_PORT || 3306,
        USERNAME: process.env.MYSQL_DB_USERNAME,
        PASSWORD: process.env.MYSQL_DB_PASSWORD,
        DB_NAME: process.env.MYSQL_DB_NAME,
        SSL_CERT: process.env.MYSQL_SSL_CERT,
    },
}
