package br.com.gommo.modules.payroll.tax.controller;
import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payroll.tax.dto.TaxObligationRequestDto;
import br.com.gommo.modules.payroll.tax.dto.TaxObligationResponseDto;
import br.com.gommo.modules.payroll.tax.service.ITaxObligationService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController @RequestMapping("/api/v1/tax-obligations")
public class TaxObligationController extends BaseController<TaxObligationRequestDto, TaxObligationResponseDto> {
    public TaxObligationController(ITaxObligationService service) { super(service); }
}
