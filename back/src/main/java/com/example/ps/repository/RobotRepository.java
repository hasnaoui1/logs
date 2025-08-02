package com.example.ps.repository;

import com.example.ps.entities.Robot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RobotRepository extends JpaRepository<Robot, Long> {
    Optional<Robot> findByName(String name);

}
