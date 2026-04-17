package com.vibook.backend.config;

import com.vibook.backend.entity.Booking;
import com.vibook.backend.entity.BookingStatus;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.User;
import com.vibook.backend.repository.BookingRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.UserRepository;
import java.util.Optional;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * When {@code vibook.demo.rating-data=true}, ensures at least one CONFIRMED booking exists between
 * an existing user and an existing event so {@code POST /api/v1/events/{id}/rate} can be tested from Postman.
 */
@Configuration
@ConditionalOnProperty(prefix = "vibook.demo", name = "rating-data", havingValue = "true")
public class RatingDemoDataConfigurer {

    @Bean
    ApplicationRunner ratingDemoDataRunner(
        UserRepository userRepository,
        BusinessEventRepository businessEventRepository,
        BookingRepository bookingRepository
    ) {
        return args -> {
            Optional<User> userOpt = userRepository.findAll().stream().findFirst();
            Optional<BusinessEvent> eventOpt = businessEventRepository.findAll().stream().findFirst();
            if (userOpt.isEmpty() || eventOpt.isEmpty()) {
                return;
            }
            User user = userOpt.get();
            BusinessEvent event = businessEventRepository
                .findById(eventOpt.get().getId())
                .orElse(eventOpt.get());
            if (bookingRepository.existsByUserAndBusinessEvent(user, event)) {
                return;
            }
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setBusinessEvent(event);
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        };
    }
}
