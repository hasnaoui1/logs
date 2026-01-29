package com.example.ps.service;

import com.example.ps.entities.Log;
import com.example.ps.entities.Robot;
import com.example.ps.entities.Session;
import com.example.ps.repository.LogRepository;
import com.example.ps.repository.RobotRepository;
import com.example.ps.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LogService {

    private final LogRepository logRepository;
    private final RobotRepository robotRepository;
    private final SessionRepository sessionRepository;

    @Autowired
    public LogService(LogRepository logRepository, RobotRepository robotRepository,
            SessionRepository sessionRepository) {
        this.logRepository = logRepository;
        this.robotRepository = robotRepository;
        this.sessionRepository = sessionRepository;
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

        // Associate log with active session if one exists
        Optional<Session> activeSession = sessionRepository.findByRobotIdAndActiveTrue(robotId);
        activeSession.ifPresent(log::setSession);

        return logRepository.save(log);
    }

    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }

    public List<Log> getLogsByRobotId(Long robotId) {
        return logRepository.findByRobotId(robotId);
    }
}
