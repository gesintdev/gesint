package br.com.gesint.modules.ctb.payroll.tax.repository;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.modules.ctb.payroll.tax.entity.TaxObligation;

@Repository
public interface TaxObligationRepository extends IBaseRepository<TaxObligation> {}
