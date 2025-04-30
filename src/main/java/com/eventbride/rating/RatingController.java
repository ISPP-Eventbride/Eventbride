package com.eventbride.rating;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.eventbride.dto.RatingDTO;
import com.eventbride.event.Event;
import com.eventbride.event.EventService;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.user.UserRepository;
import com.eventbride.user.UserService;
import com.eventbride.venue.VenueRepository;
import com.eventbride.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private UserService userService;

    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OtherServiceRepository otherServiceRepository;

    public RatingController(RatingService ratingService, UserService userService, EventService eventService, UserRepository userRepository,
            VenueRepository venueRepository, OtherServiceRepository otherServiceRepository) {
        this.ratingService = ratingService;
        this.userService = userService;
        this.eventService = eventService;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.otherServiceRepository = otherServiceRepository;
    }

    @GetMapping("/other-service/{id}")
    public Page<Rating> getRatingsForServiceByOtherService(@PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size) {
        return ratingService.getRatingsByOtherServiceId(id, page, size);
    }

    @GetMapping("/venue/{id}")
    public Page<Rating> getRatingsForServiceByVenue(@PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size) {
        return ratingService.getRatingsByVenueId(id, page, size);
    }

    @GetMapping("/average/other-service/{id}")
    public double getAverageRating(@PathVariable Long id) {
        return ratingService.getRoundedAverageRatingByOtherService(id);
    }

    @GetMapping("/average/venue/{id}")
    public double getAverageRatingByVenue(@PathVariable Long id) {
        return ratingService.getRoundedAverageRatingByVenue(id);
    }

    @GetMapping("/service/{id}/isVoted/{userId}")
    public Boolean isServiceVotedBy(@PathVariable Integer id, @PathVariable Integer userId, @RequestParam Boolean isVenue) {
        return ratingService.isServiceVotedByUser(id, userId, isVenue);
    }

    @GetMapping("/service/{id}/canVote/{userId}")  
    public Boolean canVote(@PathVariable Integer id, @PathVariable Integer userId, @RequestParam Boolean isVenue) {
        return ratingService.canVote(id, userId, isVenue);
    }

    @PostMapping()
    public Rating createRating(@Valid @RequestBody RatingDTO ratingDTO) {
        User user = userService
            .getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).get();

        if (user == null || !user.getId().equals(ratingDTO.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario no encontrado o no autorizado");
        }

        List<Event> userEvents = eventService.findEventsByUserId(user.getId());

        boolean hasEventPropertiesForService = false;
        if (ratingDTO.getVenueId() != null) {
            hasEventPropertiesForService = userEvents.stream().anyMatch(event ->
                event.getEventProperties().stream()
                    .anyMatch(ep -> ep.getVenue() != null 
                        && ep.getVenue().getId().equals(ratingDTO.getVenueId()))
            );
        }
        if (ratingDTO.getOtherServiceId() != null) {
            hasEventPropertiesForService = userEvents.stream().anyMatch(event ->
                event.getEventProperties().stream()
                    .anyMatch(ep -> ep.getOtherService() != null 
                        && ep.getOtherService().getId().equals(ratingDTO.getOtherServiceId()))
            );
        }

        if (!hasEventPropertiesForService) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene un evento asociado a este servicio para poder calificarlo");
        }

        Rating rating = new Rating();
        rating.setStars(ratingDTO.getStars());
        rating.setComment(ratingDTO.getComment());
        rating.setUser(userRepository.findById(ratingDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User no encontrado")));

        if (ratingDTO.getVenueId() != null) {
            rating.setVenue(
                venueRepository.findById(ratingDTO.getVenueId()).orElse(null)
            );
        }
        if (ratingDTO.getOtherServiceId() != null) {
            rating.setOtherService(
                otherServiceRepository.findById(ratingDTO.getOtherServiceId()).orElse(null)
            );
        }
        return ratingService.createRating(rating);
    }
}
