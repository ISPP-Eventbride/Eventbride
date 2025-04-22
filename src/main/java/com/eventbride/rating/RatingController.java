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

import com.eventbride.dto.RatingDTO;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.VenueRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OtherServiceRepository otherServiceRepository;

    public RatingController(RatingService ratingService, UserRepository userRepository,
            VenueRepository venueRepository, OtherServiceRepository otherServiceRepository) {
        this.ratingService = ratingService;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.otherServiceRepository = otherServiceRepository;
    }

    @GetMapping("/other-service/{id}")
    public List<Rating> getRatingsForServiceByOtherService(@PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size) {
        return ratingService.getRatingsByOtherServiceId(id, page, size);
    }

    @GetMapping("/venue/{id}")
    public List<Rating> getRatingsForServiceByVenue(@PathVariable Integer id,
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

    @PostMapping()
    public Rating createRating(@Valid @RequestBody RatingDTO ratingDTO) {
        Rating rating = new Rating();
        rating.setStars(ratingDTO.getStars());
        rating.setComment(ratingDTO.getComment());
        // es recomendable que createdAt se asigne en el servicio (como ya lo haces en RatingService)
    
        // Asigna el usuario
        rating.setUser(
            userRepository.findById(ratingDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User no encontrado"))
        );
        
        // Asigna el venue si se envió su id
        if (ratingDTO.getVenueId() != null) {
            rating.setVenue(
                venueRepository.findById(ratingDTO.getVenueId())
                    .orElse(null)
            );
        }
        
        // Asigna el otherService si se envió su id
        if (ratingDTO.getOtherServiceId() != null) {
            rating.setOtherService(
                otherServiceRepository.findById(ratingDTO.getOtherServiceId())
                    .orElse(null)
            );
        }
        return ratingService.createRating(rating);
    }
}
