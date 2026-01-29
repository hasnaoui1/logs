package com.example.ps.controller;

import com.example.ps.entities.Log;
import com.example.ps.entities.Session;
import com.example.ps.service.SessionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@AllArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    // Get all sessions
    @GetMapping
    public ResponseEntity<List<Session>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    // Get a session by ID
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get sessions by robot ID
    @GetMapping("/robot/{robotId}")
    public ResponseEntity<List<Session>> getSessionsByRobot(@PathVariable Long robotId) {
        List<Session> sessions = sessionService.getSessionsByRobot(robotId);
        return ResponseEntity.ok(sessions);
    }

    // Get active session for a robot
    @GetMapping("/robot/{robotId}/active")
    public ResponseEntity<Session> getActiveSession(@PathVariable Long robotId) {
        return sessionService.getActiveSession(robotId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all active sessions
    @GetMapping("/active")
    public ResponseEntity<List<Session>> getActiveSessions() {
        return ResponseEntity.ok(sessionService.getActiveSessions());
    }

    // Start a new session for a robot
    @PostMapping("/start/{robotId}")
    public ResponseEntity<Session> startSession(@PathVariable Long robotId) {
        try {
            Session session = sessionService.startSession(robotId);
            return new ResponseEntity<>(session, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // End the active session for a robot
    @PostMapping("/end/{robotId}")
    public ResponseEntity<Session> endSession(@PathVariable Long robotId) {
        try {
            Session session = sessionService.endSession(robotId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create a new session (manual)
    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody Session session) {
        Session saved = sessionService.saveSession(session);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Delete a session
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        try {
            sessionService.deleteSession(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Add a log to a session
    @PostMapping("/{id}/logs")
    public ResponseEntity<Session> addLog(@PathVariable Long id, @RequestBody Log log) {
        try {
            Session updated = sessionService.addLogToSession(id, log);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
