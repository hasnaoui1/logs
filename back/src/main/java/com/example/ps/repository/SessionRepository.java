package com.example.ps.repository;

import com.example.ps.entities.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByRobotIdOrderByStartTimeDesc(Long robotId);

    Optional<Session> findByRobotIdAndActiveTrue(Long robotId);

    List<Session> findAllByOrderByStartTimeDesc();

    List<Session> findByActiveTrue();
}
