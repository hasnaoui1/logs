package com.example.ps.service;

import com.example.ps.entities.Log;
import com.example.ps.entities.Robot;
import com.example.ps.repository.LogRepository;
import com.example.ps.repository.RobotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogService {

    private final LogRepository logRepository;
    private final RobotRepository robotRepository;

    @Autowired
    public LogService(LogRepository logRepository, RobotRepository robotRepository) {
        this.logRepository = logRepository;
        this.robotRepository = robotRepository;
    }
    public void deleteLogsByRobotId(Long robotId) {
        logRepository.deleteByRobotId(robotId);
    }


    public Log saveLog(Long robotId, String message, String type, LocalDateTime timestamp) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new RuntimeException("Robot not found"));

        Log log = new Log();
        log.setRobot(robot);
        log.setMessage(message);
        log.setType(type);
        log.setTimestamp(timestamp != null ? timestamp : LocalDateTime.now());

        return logRepository.save(log);
    }

    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }

    public List<Log> getLogsByRobotId(Long robotId) {
        return logRepository.findByRobotId(robotId);
    }
}
