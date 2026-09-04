import { apiFetch } from "@/shared/lib/api.client";

export type PostalCodeAddress = {
    zipCode: string;
    street?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;
};

class AddressService {
    private readonly basePath = "/api/v1/addresses";

    findByPostalCode(postalCode: string): Promise<PostalCodeAddress> {
        return apiFetch<PostalCodeAddress>(`${this.basePath}/postal-code/${postalCode}`);
    }
}

export const addressService = new AddressService();
