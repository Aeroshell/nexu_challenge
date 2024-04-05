export interface CreateModel {
    name: string;
    average_price?: number;
}

export interface UpdateModel {
    average_price: number;
}

export interface FilterModels {
    greater?: number;
    lower?: number;
}
