package com.example.ps.controller;

import com.example.ps.entities.Robot;
import com.example.ps.service.NotificationService;
import com.example.ps.service.RobotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/robots")
class RobotController {

    private final RobotService robotService;

    private final NotificationService notificationService;

    @Autowired
    public RobotController(RobotService robotService , NotificationService notificationService) {
        this.robotService = robotService;
        this.notificationService = notificationService;
    }

    @GetMapping("/all")
    public List<Robot> getRobots() {
        return robotService.getAllRobots();
    }

    @GetMapping("/{id}")
    public Optional<Robot> getRobotById(@PathVariable Long id) {
        return robotService.getRobotById(id);
    }

    @PostMapping("/add")
    public Robot createRobot(@RequestBody Robot robot) {
        return robotService.saveRobot(robot);
    }

    @PutMapping("/{id}")
    public Robot updateRobot(@PathVariable Long id, @RequestBody Robot updatedRobot) {
        return robotService.getRobotById(id)
                .map(robot -> {
                    robot.setName(updatedRobot.getName());
                    robot.setStatus(updatedRobot.getStatus());
                    robot.setSessions(updatedRobot.getSessions());
                    return robotService.saveRobot(robot);
                })
                .orElseGet(() -> {
                    updatedRobot.setId(id);
                    return robotService.saveRobot(updatedRobot);
                });
    }


    @DeleteMapping("/{id}")
    public void deleteRobot(@PathVariable Long id) {
        robotService.deleteRobot(id);
    }

    @PutMapping("/changeStatus/{id}/status")
    public ResponseEntity<Robot> toggleStatus(@PathVariable Long id, @RequestParam boolean status) {
        Robot updatedRobot = robotService.changeStatus(id, status);


        if(!status){
            notificationService.createNotification("robot" + updatedRobot.getName()+ "has been turned off");
        }
        if(status){
            robotService.incrementSessions(id);
        }
        return ResponseEntity.ok(updatedRobot);
    }



}
