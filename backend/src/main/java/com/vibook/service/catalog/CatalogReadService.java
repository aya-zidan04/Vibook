package com.vibook.service.catalog;

import com.vibook.entity.catalog.Event;
import com.vibook.entity.catalog.Experience;
import com.vibook.entity.catalog.Flight;
import com.vibook.entity.catalog.Hotel;
import com.vibook.entity.catalog.Offer;
import com.vibook.entity.catalog.Restaurant;
import com.vibook.entity.catalog.TravelPackage;
import com.vibook.repository.catalog.EventRepository;
import com.vibook.repository.catalog.ExperienceRepository;
import com.vibook.repository.catalog.FlightRepository;
import com.vibook.repository.catalog.HotelRepository;
import com.vibook.repository.catalog.OfferRepository;
import com.vibook.repository.catalog.OrganizerRepository;
import com.vibook.repository.catalog.RestaurantRepository;
import com.vibook.repository.catalog.TicketTierRepository;
import com.vibook.repository.catalog.TravelPackageRepository;
import com.vibook.web.dto.catalog.EventResponse;
import com.vibook.web.dto.catalog.ExperienceResponse;
import com.vibook.web.dto.catalog.FlightResponse;
import com.vibook.web.dto.catalog.HotelResponse;
import com.vibook.web.dto.catalog.OfferResponse;
import com.vibook.web.dto.catalog.OrganizerResponse;
import com.vibook.web.dto.catalog.PackageResponse;
import com.vibook.web.dto.catalog.RestaurantResponse;
import com.vibook.web.dto.catalog.TicketTierResponse;
import com.vibook.web.dto.common.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogReadService {

    private final OrganizerRepository organizerRepository;
    private final EventRepository eventRepository;
    private final TicketTierRepository ticketTierRepository;
    private final RestaurantRepository restaurantRepository;
    private final ExperienceRepository experienceRepository;
    private final HotelRepository hotelRepository;
    private final FlightRepository flightRepository;
    private final TravelPackageRepository travelPackageRepository;
    private final OfferRepository offerRepository;

    public CatalogReadService(
            OrganizerRepository organizerRepository,
            EventRepository eventRepository,
            TicketTierRepository ticketTierRepository,
            RestaurantRepository restaurantRepository,
            ExperienceRepository experienceRepository,
            HotelRepository hotelRepository,
            FlightRepository flightRepository,
            TravelPackageRepository travelPackageRepository,
            OfferRepository offerRepository
    ) {
        this.organizerRepository = organizerRepository;
        this.eventRepository = eventRepository;
        this.ticketTierRepository = ticketTierRepository;
        this.restaurantRepository = restaurantRepository;
        this.experienceRepository = experienceRepository;
        this.hotelRepository = hotelRepository;
        this.flightRepository = flightRepository;
        this.travelPackageRepository = travelPackageRepository;
        this.offerRepository = offerRepository;
    }

    public OrganizerResponse getOrganizer(long id) {
        return organizerRepository.findById(id)
                .map(OrganizerResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizer not found"));
    }

    public PageResponse<EventResponse> listEvents(
            Long cityId,
            Long categoryId,
            Long organizerId,
            String q,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.events(sort));
        Specification<Event> spec = CatalogSpecs.events(cityId, categoryId, organizerId, q);
        Page<Event> idPage = eventRepository.findAll(spec, pageable);
        List<Long> ids = idPage.getContent().stream().map(Event::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.of(List.of(), idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
        }
        List<Event> loaded = eventRepository.findListedByIds(ids);
        List<Event> ordered = CatalogListHelper.orderByIds(ids, loaded, Event::getId);
        List<EventResponse> dto = ordered.stream().map(EventResponse::fromEntity).toList();
        return PageResponse.of(dto, idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
    }

    public EventResponse getEvent(long id) {
        return eventRepository.findDetailById(id)
                .map(EventResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    }

    public List<TicketTierResponse> listTiersForEvent(long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }
        return ticketTierRepository.findByEvent_IdOrderByPriceAsc(eventId).stream()
                .map(TicketTierResponse::fromEntity)
                .toList();
    }

    public PageResponse<RestaurantResponse> listRestaurants(Long cityId, Long cuisineId, String q, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.restaurants(sort));
        Specification<Restaurant> spec = CatalogSpecs.restaurants(cityId, cuisineId, q);
        Page<Restaurant> idPage = restaurantRepository.findAll(spec, pageable);
        List<Long> ids = idPage.getContent().stream().map(Restaurant::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.of(List.of(), idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
        }
        List<Restaurant> loaded = restaurantRepository.findListedByIds(ids);
        List<Restaurant> ordered = CatalogListHelper.orderByIds(ids, loaded, Restaurant::getId);
        List<RestaurantResponse> dto = ordered.stream().map(RestaurantResponse::fromEntity).toList();
        return PageResponse.of(dto, idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
    }

    public RestaurantResponse getRestaurant(long id) {
        return restaurantRepository.findDetailById(id)
                .map(RestaurantResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
    }

    public PageResponse<ExperienceResponse> listExperiences(Long cityId, Long categoryId, String q, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.experiences(sort));
        Specification<Experience> spec = CatalogSpecs.experiences(cityId, categoryId, q);
        Page<Experience> idPage = experienceRepository.findAll(spec, pageable);
        List<Long> ids = idPage.getContent().stream().map(Experience::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.of(List.of(), idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
        }
        List<Experience> loaded = experienceRepository.findListedByIds(ids);
        List<Experience> ordered = CatalogListHelper.orderByIds(ids, loaded, Experience::getId);
        List<ExperienceResponse> dto = ordered.stream().map(ExperienceResponse::fromEntity).toList();
        return PageResponse.of(dto, idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
    }

    public ExperienceResponse getExperience(long id) {
        return experienceRepository.findDetailById(id)
                .map(ExperienceResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Experience not found"));
    }

    public PageResponse<HotelResponse> listHotels(Long cityId, String q, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.hotels(sort));
        Specification<Hotel> spec = CatalogSpecs.hotels(cityId, q);
        Page<Hotel> idPage = hotelRepository.findAll(spec, pageable);
        List<Long> ids = idPage.getContent().stream().map(Hotel::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.of(List.of(), idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
        }
        List<Hotel> loaded = hotelRepository.findListedByIds(ids);
        List<Hotel> ordered = CatalogListHelper.orderByIds(ids, loaded, Hotel::getId);
        List<HotelResponse> dto = ordered.stream().map(HotelResponse::fromEntity).toList();
        return PageResponse.of(dto, idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
    }

    public HotelResponse getHotel(long id) {
        return hotelRepository.findDetailById(id)
                .map(HotelResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel not found"));
    }

    public PageResponse<FlightResponse> listFlights(String q, String fromCode, String toCode, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.flights(sort));
        Specification<Flight> spec = CatalogSpecs.flights(q, fromCode, toCode);
        Page<Flight> pageResult = flightRepository.findAll(spec, pageable);
        return PageResponse.from(pageResult.map(FlightResponse::fromEntity));
    }

    public FlightResponse getFlight(long id) {
        return flightRepository.findById(id)
                .map(FlightResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Flight not found"));
    }

    public PageResponse<PackageResponse> listPackages(Long cityId, String q, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.packagesSort(sort));
        Specification<TravelPackage> spec = CatalogSpecs.packages(cityId, q);
        Page<TravelPackage> idPage = travelPackageRepository.findAll(spec, pageable);
        List<Long> ids = idPage.getContent().stream().map(TravelPackage::getId).toList();
        if (ids.isEmpty()) {
            return PageResponse.of(List.of(), idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
        }
        List<TravelPackage> loaded = travelPackageRepository.findListedByIds(ids);
        List<TravelPackage> ordered = CatalogListHelper.orderByIds(ids, loaded, TravelPackage::getId);
        List<PackageResponse> dto = ordered.stream().map(PackageResponse::fromEntity).toList();
        return PageResponse.of(dto, idPage.getNumber(), idPage.getSize(), idPage.getTotalElements(), idPage.getTotalPages());
    }

    public PackageResponse getPackage(long id) {
        return travelPackageRepository.findDetailById(id)
                .map(PackageResponse::fromEntity)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found"));
    }

    public PageResponse<OfferResponse> listOffers(String q, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, CatalogSort.offers(sort));
        Specification<Offer> spec = CatalogSpecs.offers(q);
        Page<Offer> pageResult = offerRepository.findAll(spec, pageable);
        return PageResponse.from(pageResult.map(OfferResponse::fromEntity));
    }
}
