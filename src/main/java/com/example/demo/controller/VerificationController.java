package com.example.demo.controller;

import com.example.demo.model.Event;
import com.example.demo.model.Registration;
import com.example.demo.model.User;
import com.example.demo.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Controller
public class VerificationController {

    @Autowired
    private RegistrationRepository registrationRepository;

    @GetMapping("/verify")
    public String verifyRegistration(@RequestParam String code, Model model) {
        try {
            // Parse the code (it's in format "eventId_userId")
            String[] parts = code.split("_");
            if (parts.length != 2) {
                model.addAttribute("error", "Invalid verification code");
                return "verification-error";
            }

            Long eventId = Long.parseLong(parts[0]);
            Long userId = Long.parseLong(parts[1]);

            // Find the registration
            Optional<Registration> registrationOpt = registrationRepository.findByEventIdAndUserId(eventId, userId);

            if (registrationOpt.isPresent()) {
                Registration registration = registrationOpt.get();
                Event event = registration.getEvent();
                User user = registration.getUser();

                // Add the details to the model
                model.addAttribute("eventTitle", event.getTitle());
                model.addAttribute("eventDate", event.getStartDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
                model.addAttribute("eventLocation", event.getLocation());
                model.addAttribute("attendeeName", user.getUsername());
                model.addAttribute("registrationDate", registration.getRegistrationDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
                model.addAttribute("verified", true);

                return "verification";
            } else {
                model.addAttribute("error", "No registration found for this code");
                return "verification-error";
            }
        } catch (Exception e) {
            model.addAttribute("error", "Error verifying code: " + e.getMessage());
            return "verification-error";
        }
    }
}