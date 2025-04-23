package com.eventbride.tests.ratings;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.eventbride.event.Event;
import com.eventbride.event.EventService;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.venue.Venue;
import com.eventbride.rating.Rating;
import com.eventbride.rating.RatingRepository;
import com.eventbride.rating.RatingService;
import com.eventbride.otherService.OtherService;
import com.eventbride.venue.VenueRepository;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

@ExtendWith(MockitoExtension.class)
public class RatingServiceUnitTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private OtherServiceRepository otherServiceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventService eventService;

    @InjectMocks
    private RatingService ratingService;

    private User user;
    private Venue venue;
    private OtherService otherService;
    private EventProperties ep;
    private Event event;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);

        venue = new Venue();
        venue.setId(10);

        otherService = new OtherService();
        otherService.setId(20);

        ep = new EventProperties();
        ep.setId(100);
        ep.setVenue(venue);
        ep.setOtherService(otherService);

        event = new Event();
        event.setUser(user);
        event.setEventProperties(List.of(ep));
    }

    @Test
    void shouldReturnPageOfRatingsForOtherService() {
        List<Rating> list = List.of(new Rating(), new Rating());
        Page<Rating> page = new PageImpl<>(list);
        when(ratingRepository.findByOtherService_Id(20, PageRequest.of(0, 2))).thenReturn(page);

        Page<Rating> result = ratingService.getRatingsByOtherServiceId(20, 0, 2);
        assertEquals(2, result.getContent().size());
    }

    @Test
    void shouldReturnPageOfRatingsForVenue() {
        List<Rating> list = List.of(new Rating());
        Page<Rating> page = new PageImpl<>(list);
        when(ratingRepository.findByVenue_Id(10, PageRequest.of(1, 1))).thenReturn(page);

        Page<Rating> result = ratingService.getRatingsByVenueId(10, 1, 1);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void shouldReturnZeroWhenAverageStarsNull_OtherService() {
        when(ratingRepository.findAverageStarsByOtherServiceId(20L)).thenReturn(null);
        double avg = ratingService.getRoundedAverageRatingByOtherService(20L);
        assertEquals(0.0, avg);
    }

    @Test
    void shouldRoundAverageStars_OtherService() {
        when(ratingRepository.findAverageStarsByOtherServiceId(20L)).thenReturn(3.7);
        double avg = ratingService.getRoundedAverageRatingByOtherService(20L);
        assertEquals(3.5, avg);
    }

    @Test
    void shouldReturnZeroWhenAverageStarsNull_Venue() {
        when(ratingRepository.findAverageStarsByVenueId(10L)).thenReturn(null);
        double avg = ratingService.getRoundedAverageRatingByVenue(10L);
        assertEquals(0.0, avg);
    }

    @Test
    void shouldRoundAverageStars_Venue() {
        when(ratingRepository.findAverageStarsByVenueId(10L)).thenReturn(4.2);
        double avg = ratingService.getRoundedAverageRatingByVenue(10L);
        assertEquals(4.0, avg);
    }

    @Test
    void createRatingShouldSetCreatedAtAndSave() {
        Rating toSave = new Rating();
        toSave.setStars(5.0);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(inv -> inv.getArgument(0));

        Rating saved = ratingService.createRating(toSave);
        assertNotNull(saved.getCreatedAt());
        assertEquals(5.0, saved.getStars());
    }

    @Test
    void isServiceVotedByUser_ShouldReturnTrue_ForVenue() {
        when(userRepository.findById(1)).thenReturn(java.util.Optional.of(user));
        when(venueRepository.findById(10)).thenReturn(java.util.Optional.of(venue));
        when(ratingRepository.isVotedByUserVenue(10, 1)).thenReturn(true);

        Boolean voted = ratingService.isServiceVotedByUser(10, 1, true);
        assertTrue(voted);
    }

    @Test
    void isServiceVotedByUser_ShouldReturnTrue_ForOtherService() {
        when(userRepository.findById(1)).thenReturn(java.util.Optional.of(user));
        when(otherServiceRepository.findById(20)).thenReturn(java.util.Optional.of(otherService));
        when(ratingRepository.isVotedByUserOtherService(20, 1)).thenReturn(true);

        Boolean voted = ratingService.isServiceVotedByUser(20, 1, false);
        assertTrue(voted);
    }

    @Test
    void isServiceVotedByUser_ShouldThrow_OnNullIsVenue() {
        assertThrows(IllegalArgumentException.class, () -> {
            ratingService.isServiceVotedByUser(10, 1, null);
        });
    }

    @Test
    void isServiceVotedByUser_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findById(1)).thenReturn(java.util.Optional.empty());
        assertThrows(RuntimeException.class, () -> {
            ratingService.isServiceVotedByUser(10, 1, true);
        });
    }

    @Test
    void canVote_ShouldThrow_OnNullIsVenue() {
        assertThrows(IllegalArgumentException.class, () -> {
            ratingService.canVote(10, 1, null);
        });
    }

    @Test
    void canVote_ShouldReturnTrue_WhenVenueMatches() {
        when(eventService.findEventsByUserId(1)).thenReturn(List.of(event));
        boolean can = ratingService.canVote(10, 1, true);
        assertTrue(can);
    }

    @Test
    void canVote_ShouldReturnFalse_WhenNoMatch() {
        EventProperties other = new EventProperties();
        Venue v = new Venue();
        v.setId(200);
        other.setVenue(v);
    
        event.setEventProperties(List.of(other));
        when(eventService.findEventsByUserId(1)).thenReturn(List.of(event));
    
        boolean can = ratingService.canVote(10, 1, true);
        assertFalse(can);
    }
    

    @Test
    void canVote_ShouldReturnTrue_WhenOtherServiceMatches() {
        when(eventService.findEventsByUserId(1)).thenReturn(List.of(event));
        boolean can = ratingService.canVote(20, 1, false);
        assertTrue(can);
    }

}
