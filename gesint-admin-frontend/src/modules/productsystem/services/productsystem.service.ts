import type { ProductSystem, ProductSystemCreateDto } from "@/modules/productsystem/dto/productsystem.dto";
import { BaseService } from "@/modules/root/services/base.service";

class ProductSystemService extends BaseService<ProductSystem, ProductSystemCreateDto, ProductSystemCreateDto> {
    constructor() {
        super("/api/v1/product-systems");
    }
}

export const productSystemService = new ProductSystemService();
