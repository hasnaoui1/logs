package com.example.ps.repository;

import com.example.ps.entities.Log;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findByRobotId(Long robotId);

    List<Log> findBySessionIdOrderByTimestampAsc(Long sessionId);

    @Transactional
    @Modifying
    void deleteByRobotId(Long robotId);
}