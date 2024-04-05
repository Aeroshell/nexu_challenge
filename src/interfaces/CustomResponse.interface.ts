import { HttpStatus } from '@nestjs/common';

export interface CustomResponse {
    code: HttpStatus;
    success: boolean;
    message?: string;
    data?: FunctionResponse;
}

export interface FunctionResponse {
    [key: string]: any;
}