package br.com.gommo.modules.organization.department.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.organization.department.entity.Department;
import org.springframework.stereotype.Repository;


@Repository
public interface DepartmentRepository extends IBaseRepository<Department> {
}
