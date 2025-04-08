package com.example.demo.service;

import com.example.demo.model.Event;
import com.example.demo.model.Registration;
import com.example.demo.model.User;
import com.example.demo.repository.EventRepository;
import com.example.demo.repository.RegistrationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.google.zxing.WriterException;
import java.io.IOException;
@Service
public class EventService {

  @Autowired
  private EventRepository eventRepository;
  
  @Autowired
  private RegistrationRepository registrationRepository;
  
  @Autowired
  private QRCodeService qrCodeService;
  
  @Autowired
  private EmailService emailService;
  
  // Create an event
  public Event createEvent(Event event) {
    return eventRepository.save(event);
  }
  
  // Retrieve all events
  public List<Event> getAllEvents() {
    return eventRepository.findAll();
  }
  
  // Register a user for an event
  public Registration registerForEvent(Event event, User user) throws WriterException, IOException {
    Optional<Registration> existing = registrationRepository.findByEventAndUser(event, user);
    if(existing.isPresent()){
        return existing.get();
    }
    
    Registration registration = new Registration();
    registration.setEvent(event);
    registration.setUser(user);
    registration.setRegistrationDate(LocalDateTime.now());
    
    // Create a verification URL for the QR code
    // This URL will point to our verification page
    String verificationCode = event.getId() + "_" + user.getId();
    String verificationUrl = "http://localhost:8080/verify?code=" + verificationCode;
    
    String qrCodeBase64 = qrCodeService.generateQRCodeImage(verificationUrl, 300, 300);
    registration.setQrCodeBase64(qrCodeBase64);
    
    Registration savedRegistration = registrationRepository.save(registration);
    
    // Send confirmation email
    try {
        emailService.sendEmail(user.getEmail(), "Event Registration Confirmation", 
            "You have successfully registered for the event: " + event.getTitle() + 
            "\n\nScan the QR code or visit:\n" + verificationUrl);
    } catch (Exception e) {
        // Log email error but don't fail the registration
        System.err.println("Failed to send email: " + e.getMessage());
    }
    
    return savedRegistration;
}
  
  public Optional<Event> getEventById(Long id) {
    return eventRepository.findById(id);
  }
}
