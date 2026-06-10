package br.com.gommo.modules.person.leave.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.person.leave.entity.LeaveRequest;

@Repository
public interface LeaveRequestRepository extends IBaseRepository<LeaveRequest> {}
