package br.com.gommo.admin.modules.productsystem.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class ProductSystemException {

    private ProductSystemException() {}

    public static BusinessException notFound() {
        return new BusinessException("PRODUCT_SYSTEM_NOT_FOUND", "Sistema não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException keyAlreadyExists() {
        return new BusinessException(
                "PRODUCT_SYSTEM_KEY_EXISTS", "Já existe um sistema com esta chave", HttpStatus.CONFLICT);
    }
}
