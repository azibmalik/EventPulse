package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.User;
import com.example.demo.repository.RegistrationRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.EventService;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    private EventService eventService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RegistrationRepository registrationRepository;
    
    @PostMapping("/create")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> eventData, Principal principal) {
        try {
            // Validate event date
            String startDateStr = (String) eventData.get("startDate");
            LocalDateTime startDate = LocalDateTime.parse(startDateStr);
            
            if (startDate.isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("Event date must be in the future");
            }
            
            // Get the authenticated user
            User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
            Event event = new Event();
            event.setTitle((String) eventData.get("title"));
            event.setDescription((String) eventData.get("description"));
            event.setStartDate(startDate);
            event.setLocation((String) eventData.get("location"));
            event.setImageBase64((String) eventData.get("imageBase64")); // Set the image
            event.setOrganizer(user);
            
            Event createdEvent = eventService.createEvent(event);
            return ResponseEntity.ok(createdEvent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating event: " + e.getMessage());
        }
    }
    
    @GetMapping("/all")
    public List<Map<String, Object>> getAllEvents(Principal principal) {
        List<Event> events = eventService.getAllEvents();
        List<Map<String, Object>> result = new ArrayList<>();
        
        if (principal != null) {
            User user = userRepository.findByUsername(principal.getName())
                .orElse(null);
            
            for (Event event : events) {
                Map<String, Object> eventData = new HashMap<>();
                eventData.put("id", event.getId());
                eventData.put("title", event.getTitle());
                eventData.put("description", event.getDescription());
                eventData.put("startDate", event.getStartDate());
                eventData.put("location", event.getLocation());
                eventData.put("imageBase64", event.getImageBase64());
                eventData.put("organizer", event.getOrganizer());
                
                // Check if user is registered for this event
                boolean isRegistered = false;
                if (user != null) {
                    isRegistered = registrationRepository.findByEventAndUser(event, user).isPresent();
                }
                eventData.put("isRegistered", isRegistered);
                
                result.add(eventData);
            }
        } else {
            for (Event event : events) {
                Map<String, Object> eventData = new HashMap<>();
                eventData.put("id", event.getId());
                eventData.put("title", event.getTitle());
                eventData.put("description", event.getDescription());
                eventData.put("startDate", event.getStartDate());
                eventData.put("location", event.getLocation());
                eventData.put("imageBase64", event.getImageBase64());
                eventData.put("organizer", event.getOrganizer());
                eventData.put("isRegistered", false);
                
                result.add(eventData);
            }
        }
        
        return result;
    }
    
    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventService.getEventById(id).orElse(null);
    }
}