package br.com.gommo.modules.payroll.payslip.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.payroll.payslip.entity.Payslip;

@Repository
public interface PayslipRepository extends IBaseRepository<Payslip> {}
