package com.example.demo.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "events")
public class Event {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column(nullable = false)
  private String title;
  
  @Column(length = 2048)
  private String description;
  
  @Column(nullable = false)
  private LocalDateTime startDate;
  
  @Column(nullable = false)
  private String location;
  
  @Column(length = 1000000) // Long enough for base64 encoded image
  private String imageBase64;
  
  // Many events can be created by one organizer
  @ManyToOne
  @JoinColumn(name = "organizer_id")
  private User organizer;
  
  // Explicit getters and setters
  public Long getId() {
    return id;
  }
  
  public void setId(Long id) {
    this.id = id;
  }
  
  public String getTitle() {
    return title;
  }
  
  public void setTitle(String title) {
    this.title = title;
  }
  
  public String getDescription() {
    return description;
  }
  
  public void setDescription(String description) {
    this.description = description;
  }
  
  public LocalDateTime getStartDate() {
    return startDate;
  }
  
  public void setStartDate(LocalDateTime startDate) {
    this.startDate = startDate;
  }
  
  public String getLocation() {
    return location;
  }
  
  public void setLocation(String location) {
    this.location = location;
  }
  
  public String getImageBase64() {
    return imageBase64;
  }
  
  public void setImageBase64(String imageBase64) {
    this.imageBase64 = imageBase64;
  }
  
  public User getOrganizer() {
    return organizer;
  }
  
  public void setOrganizer(User organizer) {
    this.organizer = organizer;
  }
}