package br.com.gommo.admin.modules.clientpayment.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.modules.clientpayment.entity.ClientPayment;

@Repository
public interface ClientPaymentRepository extends IBaseRepository<ClientPayment> {}
