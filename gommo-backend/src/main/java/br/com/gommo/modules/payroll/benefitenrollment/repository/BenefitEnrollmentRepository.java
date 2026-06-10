package br.com.gommo.modules.payroll.benefitenrollment.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.payroll.benefitenrollment.entity.BenefitEnrollment;

@Repository
public interface BenefitEnrollmentRepository extends IBaseRepository<BenefitEnrollment> {}
