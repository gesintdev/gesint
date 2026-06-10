package br.com.gommo.modules.person.attendance.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.person.attendance.entity.AttendanceRecord;

@Repository
public interface AttendanceRecordRepository extends IBaseRepository<AttendanceRecord> {}
