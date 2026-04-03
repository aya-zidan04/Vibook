package com.vibook.service;

import com.vibook.entity.enums.BookingType;
import com.vibook.entity.enums.ListingVertical;
import com.vibook.repository.catalog.EventRepository;
import com.vibook.repository.catalog.ExperienceRepository;
import com.vibook.repository.catalog.FlightRepository;
import com.vibook.repository.catalog.HotelRepository;
import com.vibook.repository.catalog.OrganizerRepository;
import com.vibook.repository.catalog.RestaurantRepository;
import com.vibook.repository.catalog.TravelPackageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Ensures catalog foreign keys exist before persisting user-owned references (ratings, favorites, bookings).
 */
@Service
public class CatalogEntityExistsService {

    private final EventRepository eventRepository;
    private final RestaurantRepository restaurantRepository;
    private final ExperienceRepository experienceRepository;
    private final HotelRepository hotelRepository;
    private final OrganizerRepository organizerRepository;
    private final TravelPackageRepository travelPackageRepository;
    private final FlightRepository flightRepository;

    public CatalogEntityExistsService(
            EventRepository eventRepository,
            RestaurantRepository restaurantRepository,
            ExperienceRepository experienceRepository,
            HotelRepository hotelRepository,
            OrganizerRepository organizerRepository,
            TravelPackageRepository travelPackageRepository,
            FlightRepository flightRepository
    ) {
        this.eventRepository = eventRepository;
        this.restaurantRepository = restaurantRepository;
        this.experienceRepository = experienceRepository;
        this.hotelRepository = hotelRepository;
        this.organizerRepository = organizerRepository;
        this.travelPackageRepository = travelPackageRepository;
        this.flightRepository = flightRepository;
    }

    public void assertListingRefExists(ListingVertical vertical, long refId) {
        boolean ok = switch (vertical) {
            case EVENT -> eventRepository.existsById(refId);
            case RESTAURANT -> restaurantRepository.existsById(refId);
            case EXPERIENCE -> experienceRepository.existsById(refId);
            case STAY -> hotelRepository.existsById(refId);
            case ORGANIZER -> organizerRepository.existsById(refId);
            case PACKAGE -> travelPackageRepository.existsById(refId);
            case FLIGHT -> flightRepository.existsById(refId);
        };
        if (!ok) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No " + vertical.getApiKey() + " found with id " + refId
            );
        }
    }

    public void assertBookingRefExists(BookingType type, long refId) {
        boolean ok = switch (type) {
            case EVENT -> eventRepository.existsById(refId);
            case RESTAURANT -> restaurantRepository.existsById(refId);
            case HOTEL -> hotelRepository.existsById(refId);
            case EXPERIENCE -> experienceRepository.existsById(refId);
            case PACKAGE -> travelPackageRepository.existsById(refId);
            case FLIGHT -> flightRepository.existsById(refId);
        };
        if (!ok) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No " + type.getApiKey() + " found with id " + refId
            );
        }
    }
}
