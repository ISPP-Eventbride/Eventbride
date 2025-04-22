package com.eventbride.rating;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventbride.dto.RatingDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    public List<Rating> getRatingsByOtherServiceId(Integer serviceId, int page, int size) {
        return ratingRepository.findByOtherService_Id(serviceId, PageRequest.of(page, size));
    }

    public List<Rating> getRatingsByVenueId(Integer serviceId, int page, int size) {
        return ratingRepository.findByVenue_Id(serviceId, PageRequest.of(page, size));
    }

    public double getRoundedAverageRatingByOtherService(Long serviceId) {
        Double avg = ratingRepository.findAverageStarsByOtherServiceId(serviceId);
        if (avg == null)
            return 0.0;

        return Math.round(avg * 2) / 2.0;
    }

    public double getRoundedAverageRatingByVenue(Long serviceId) {
        Double avg = ratingRepository.findAverageStarsByVenueId(serviceId);
        if (avg == null)
            return 0.0;

        return Math.round(avg * 2) / 2.0;
    }

    @Transactional
    public Rating createRating(Rating rating) {
        rating.setCreatedAt(LocalDateTime.now());
        return ratingRepository.save(rating);
    }
}
