package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.Registration;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.EventService;
import com.google.zxing.WriterException;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {
    @Autowired
    private EventService eventService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.example.demo.repository.RegistrationRepository registrationRepository;
    
    @PostMapping("/register/{eventId}")
    public ResponseEntity<?> registerForEvent(@PathVariable Long eventId, Principal principal)
        throws WriterException, IOException {
        try {
            // Use Principal to retrieve the currently authenticated user.
            User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            Event event = eventService.getEventById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
            Registration registration = eventService.registerForEvent(event, user);
            return ResponseEntity.ok(registration);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error registering for event: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error registering for event: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/unregister/{eventId}")
    public ResponseEntity<?> unregisterFromEvent(@PathVariable Long eventId, Principal principal) {
        try {
            // Get the authenticated user
            User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
            // Get the event
            Event event = eventService.getEventById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
                
            // Find the registration
            Registration registration = registrationRepository.findByEventAndUser(event, user)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
                
            // Delete the registration
            registrationRepository.delete(registration);
            
            return ResponseEntity.ok().body("Successfully unregistered from event");
        } catch (Exception e) {
            // Log the error
            System.err.println("Error unregistering from event: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error unregistering from event: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-registrations")
    public List<Registration> getMyRegistrations(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return registrationRepository.findByUser(user);
    }
}