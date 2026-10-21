package br.com.gesint.admin.modules.clientpayment.repository;

import org.springframework.stereotype.Repository;

import br.com.gesint.admin.core.base.repository.IBaseRepository;
import br.com.gesint.admin.modules.clientpayment.entity.ClientPayment;

@Repository
public interface ClientPaymentRepository extends IBaseRepository<ClientPayment> {}
