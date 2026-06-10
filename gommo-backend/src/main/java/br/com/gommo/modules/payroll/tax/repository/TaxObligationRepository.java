package br.com.gommo.modules.payroll.tax.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.payroll.tax.entity.TaxObligation;

@Repository
public interface TaxObligationRepository extends IBaseRepository<TaxObligation> {}
