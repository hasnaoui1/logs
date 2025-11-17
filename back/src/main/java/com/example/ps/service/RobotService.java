package com.example.ps.service;

import com.example.ps.entities.Robot;
import com.example.ps.repository.RobotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RobotService {

    private final RobotRepository robotRepository;

    @Autowired
    public RobotService(RobotRepository robotRepository) {
        this.robotRepository = robotRepository;
    }

    public Robot saveRobot(Robot robot) {
        return robotRepository.save(robot);
    }

    public List<Robot> getAllRobots() {
        return robotRepository.findAll();
    }

    public Optional<Robot> getRobotById(Long id) {
        return robotRepository.findById(id);
    }

    public void deleteRobot(Long id) {
        robotRepository.deleteById(id);
    }

    public Robot changeStatus(Long id, Boolean status) {
        Optional<Robot> robotOptional = robotRepository.findById(id);
        if (robotOptional.isPresent()) {
            Robot robot = robotOptional.get();
            robot.setStatus(status);
            robotRepository.save(robot);
        }
        return robotOptional.get();
    }
    public void incrementSessions(Long id) {
        Optional<Robot> robotOptional = robotRepository.findById(id);
        if (robotOptional.isPresent()) {
            Robot robot = robotOptional.get();
            robot.setSessions(robot.getSessions() + 1);
             robotRepository.save(robot);
        }
    }

}
