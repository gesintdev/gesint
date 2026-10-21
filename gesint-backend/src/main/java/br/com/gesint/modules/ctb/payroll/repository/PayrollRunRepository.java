package br.com.gesint.modules.ctb.payroll.repository;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.modules.ctb.payroll.entity.PayrollRun;

@Repository
public interface PayrollRunRepository extends IBaseRepository<PayrollRun> {}
