package com.example.ps.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Robot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Boolean status;

    private Long sessionCount;

    @OneToMany(mappedBy = "robot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({ "robot", "logs" })
    private List<Session> sessions = new ArrayList<>();

    // Transient field to get the active session ID
    @Transient
    public Long getActiveSessionId() {
        if (sessions == null)
            return null;
        return sessions.stream()
                .filter(Session::isActive)
                .findFirst()
                .map(Session::getId)
                .orElse(null);
    }
}
