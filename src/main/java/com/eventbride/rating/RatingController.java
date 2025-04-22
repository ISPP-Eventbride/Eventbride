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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
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

    @PostMapping("/create")
    public Rating createRating(@Valid @RequestBody Rating rating) {
        return ratingService.createRating(rating);
    }
}
