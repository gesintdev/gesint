package br.com.gommo.admin.modules.productsystem.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.admin.core.base.controller.BaseController;
import br.com.gommo.admin.modules.productsystem.dto.ProductSystemRequestDto;
import br.com.gommo.admin.modules.productsystem.dto.ProductSystemResponseDto;
import br.com.gommo.admin.modules.productsystem.service.IProductSystemService;

@RestController
@RequestMapping("/api/v1/product-systems")
public class ProductSystemController extends BaseController<ProductSystemRequestDto, ProductSystemResponseDto> {

    public ProductSystemController(IProductSystemService service) {
        super(service);
    }
}
