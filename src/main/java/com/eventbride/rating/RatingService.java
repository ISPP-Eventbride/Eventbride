package com.eventbride.rating;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventbride.dto.RatingDTO;
import com.eventbride.event.Event;
import com.eventbride.event.EventService;
import com.eventbride.venue.Venue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.VenueRepository;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OtherServiceRepository otherServiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventService eventService;

    public Page<Rating> getRatingsByOtherServiceId(Integer serviceId, int page, int size) {
        return ratingRepository.findByOtherService_Id(serviceId, PageRequest.of(page, size));
    }

    public Page<Rating> getRatingsByVenueId(Integer serviceId, int page, int size) {
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

    @Transactional(readOnly= true)
    public Boolean isServiceVotedByUser(Integer serviceId, Integer userId, Boolean isVenue) throws IllegalArgumentException {
        if(isVenue==null){
            throw new IllegalArgumentException("Ha ocurrido un error al identificar el servicio");
        }
        User existingUser = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("No se ha encontrado ningún recinto con esa Id"));
        if(isVenue){
            Venue existingVenue = venueRepository.findById(serviceId)
				.orElseThrow(() -> new RuntimeException("No se ha encontrado ningún recinto con esa Id"));
            return ratingRepository.isVotedByUserVenue(serviceId, userId);

        }else{
            OtherService existingOtherService = otherServiceRepository.findById(serviceId)
				.orElseThrow(() -> new RuntimeException("No se ha encontrado ningún servicio con esa Id"));
            return ratingRepository.isVotedByUserOtherService(serviceId, userId);
        }
    }

    @Transactional(readOnly= true)
    public Boolean canVote(Integer serviceId, Integer userId, Boolean isVenue) throws IllegalArgumentException {
        if(isVenue == null){
            throw new IllegalArgumentException("Ha ocurrido un error al identificar el servicio");
        }
        List<Event> userEvents = eventService.findEventsByUserId(userId);
        boolean canVote = false;
        if (isVenue) {
            canVote = userEvents.stream().anyMatch(event ->
                event.getEventProperties().stream().anyMatch(ep ->
                    ep.getVenue() != null && ep.getVenue().getId().equals(serviceId)
                )
            );
        } else {
            canVote = userEvents.stream().anyMatch(event ->
                event.getEventProperties().stream().anyMatch(ep ->
                    ep.getOtherService() != null && ep.getOtherService().getId().equals(serviceId)
                )
            );
        }
        return canVote;
    }


}
