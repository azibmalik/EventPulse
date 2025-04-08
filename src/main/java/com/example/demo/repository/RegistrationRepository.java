package com.example.demo.repository;

import com.example.demo.model.Registration;
import com.example.demo.model.Event;
import com.example.demo.model.User;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Optional<Registration> findByEventAndUser(Event event, User user);
    List<Registration> findByUser(User user);
    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);
}