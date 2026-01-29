package com.example.ps.service;

import com.example.ps.entities.Log;
import com.example.ps.entities.Robot;
import com.example.ps.entities.Session;
import com.example.ps.repository.RobotRepository;
import com.example.ps.repository.SessionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final RobotRepository robotRepository;

    /**
     * Start a new session for a robot when it's turned on
     */
    @Transactional
    public Session startSession(Long robotId) {
        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new IllegalArgumentException("Robot not found with id: " + robotId));

        // End any existing active session for this robot
        sessionRepository.findByRobotIdAndActiveTrue(robotId)
                .ifPresent(existingSession -> {
                    existingSession.setActive(false);
                    existingSession.setEndTime(LocalDateTime.now());
                    sessionRepository.save(existingSession);
                });

        // Create new session
        Session session = new Session();
        session.setRobot(robot);
        session.setStartTime(LocalDateTime.now());
        session.setActive(true);

        Session savedSession = sessionRepository.save(session);

        // Increment robot's session count
        Long currentCount = robot.getSessionCount();
        robot.setSessionCount(currentCount != null ? currentCount + 1 : 1L);
        robotRepository.save(robot);

        return savedSession;
    }

    /**
     * End the active session for a robot when it's turned off
     */
    @Transactional
    public Session endSession(Long robotId) {
        Session session = sessionRepository.findByRobotIdAndActiveTrue(robotId)
                .orElseThrow(() -> new IllegalArgumentException("No active session found for robot: " + robotId));

        session.setActive(false);
        session.setEndTime(LocalDateTime.now());

        return sessionRepository.save(session);
    }

    /**
     * Get the active session for a robot (if any)
     */
    public Optional<Session> getActiveSession(Long robotId) {
        return sessionRepository.findByRobotIdAndActiveTrue(robotId);
    }

    /**
     * Get all sessions for a specific robot
     */
    public List<Session> getSessionsByRobot(Long robotId) {
        return sessionRepository.findByRobotIdOrderByStartTimeDesc(robotId);
    }

    public Session saveSession(Session session) {
        return sessionRepository.save(session);
    }

    public Optional<Session> getSessionById(Long id) {
        return sessionRepository.findById(id);
    }

    public List<Session> getAllSessions() {
        return sessionRepository.findAllByOrderByStartTimeDesc();
    }

    public void deleteSession(Long id) {
        if (sessionRepository.existsById(id)) {
            sessionRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Session with id " + id + " does not exist");
        }
    }

    @Transactional
    public Session addLogToSession(Long sessionId, Log log) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found with id: " + sessionId));
        session.getLogs().add(log);
        log.setSession(session);
        return sessionRepository.save(session);
    }

    public List<Session> getActiveSessions() {
        return sessionRepository.findByActiveTrue();
    }
}
