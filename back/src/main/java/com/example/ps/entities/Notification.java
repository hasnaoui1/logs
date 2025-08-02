package com.example.ps.entities;

import com.example.ps.entities.Robot;
import com.example.ps.entities.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private LocalDateTime timestamp;

    @Column(name = "is_read") // <- renamed to avoid SQL conflict
    private boolean read = false;

    @ManyToOne
    @JoinColumn(name = "robot_id")
    private Robot robot;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
