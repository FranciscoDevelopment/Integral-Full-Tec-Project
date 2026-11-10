import { Type } from "class-transformer";
import { IsInt, IsOptional, Min, Max } from 'class-validator';


// Every list endpoint answers { data, meta: { total, page, limit } } (shared contract)
export class PaginationQueryDto {

    @IsOptional()
    @Type( () => Number )
    @IsInt()
    @Min(1)
    page : number = 1

    @IsOptional()
    @Type( () => Number )
    @IsInt()
    @Min(1)
    @Max(100)
    limit : number = 20

}
