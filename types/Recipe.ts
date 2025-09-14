export interface Recipe {
    rid?: string;
    title: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    imageId?: number;
    imageUrl?: string;
    category?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
