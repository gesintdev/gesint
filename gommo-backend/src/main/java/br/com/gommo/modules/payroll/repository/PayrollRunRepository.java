package br.com.gommo.modules.payroll.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.payroll.entity.PayrollRun;

@Repository
public interface PayrollRunRepository extends IBaseRepository<PayrollRun> {}
