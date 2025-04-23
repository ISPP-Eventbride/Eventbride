package com.eventbride.tests.ratings;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.eventbride.event.Event;
import com.eventbride.event.Event.EventType;
import com.eventbride.event.EventRepository;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventProperties.Status;
import com.eventbride.event_properties.EventPropertiesRepository;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.notification.NotificationRepository;
import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherService.OtherServiceType;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.rating.Rating;
import com.eventbride.rating.RatingRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.Venue;
import com.eventbride.venue.VenueRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "juan", roles = { "CLIENT" })
public class RatingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private VenueRepository venueRepository;
    @Autowired
    private OtherServiceRepository otherServiceRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private EventPropertiesRepository eventPropertiesRepository;
    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User client;
    private Venue venue;
    private OtherService svc;
    private Event event;
    private EventProperties props;
    private Rating rating1, rating2;

    @BeforeEach
    void setup() {
        // 1) Limpiar notificaciones para no violar FK con users
        notificationRepository.deleteAll();
        // 2) Limpiar invitaciones para no violar FK con events
        invitationRepository.deleteAll();
        // 3) Limpiar el resto en orden seguro
        ratingRepository.deleteAll();
        eventPropertiesRepository.deleteAll();
        eventRepository.deleteAll();
        otherServiceRepository.deleteAll();
        venueRepository.deleteAll();
        userRepository.deleteAll();

        // 4) Crear usuario CLIENT
        client = new User();
        client.setUsername("juan");
        client.setPassword("pwd");
        client.setRole("CLIENT");
        client = userRepository.saveAndFlush(client);

        // 5) Crear Venue
        venue = new Venue();
        venue.setName("Sala X");
        venue.setPostalCode("41001");
        venue.setCoordinates("37.38,-5.99");
        venue.setAddress("Calle Falsa 123");
        venue.setMaxGuests(100);
        venue.setSurface(200.0);
        venue.setEarliestTime(LocalTime.of(10, 0));
        venue.setLatestTime(LocalTime.of(22, 0));
        venue.setUser(client);
        venue = venueRepository.saveAndFlush(venue);

        // 6) Crear OtherService
        svc = new OtherService();
        svc.setName("Catering Y");
        svc.setOtherServiceType(OtherServiceType.CATERING);
        svc.setExtraInformation("Info extra");
        svc.setUser(client);
        svc = otherServiceRepository.saveAndFlush(svc);

        // 7) Crear Event
        event = new Event();
        event.setUser(client);
        event.setName("Mis XV");
        event.setEventType(EventType.WEDDING);
        event.setGuests(50);
        event.setEventDate(LocalDate.of(2025, 12, 20));
        event.setPaymentDate(event.getPaymentDate());

        // 8) Crear EventProperties
        props = new EventProperties();
        props.setVenue(venue);
        props.setOtherService(svc);
        props.setStatus(Status.APPROVED);
        props.setBookDateTime(LocalDateTime.now());
        props.setDepositAmount(0.0);
        props.setPricePerService(BigDecimal.valueOf(100.0));

        // 9) Enlazar y guardar con flush
        event.setEventProperties(List.of(props));
        event = eventRepository.save(event);
        props = event.getEventProperties().get(0);

        // 10) Crear Ratings
        rating1 = new Rating();
        rating1.setStars(4.0);
        rating1.setComment("¡Excelente!");
        rating1.setUser(client);
        rating1.setVenue(venue);
        rating1.setCreatedAt(LocalDateTime.now());
        ratingRepository.saveAndFlush(rating1);

        rating2 = new Rating();
        rating2.setStars(2.0);
        rating2.setComment("Podría mejorar");
        rating2.setUser(client);
        rating2.setVenue(venue);
        rating2.setCreatedAt(LocalDateTime.now());
        ratingRepository.saveAndFlush(rating2);
    }

    @Test
    void shouldGetRatingsByVenue() throws Exception {
        mockMvc.perform(get("/api/ratings/venue/{id}", venue.getId())
                .param("page", "0")
                .param("size", "10"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(2)))
            .andExpect(jsonPath("$.content[0].stars", is(4.0)))
            .andExpect(jsonPath("$.content[1].stars", is(2.0)));
    }

    @Test
    void shouldGetRatingsByOtherService() throws Exception {
        mockMvc.perform(get("/api/ratings/other-service/{id}", svc.getId())
                .param("page", "0")
                .param("size", "10"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(2)));
    }

    @Test
    void shouldReturnRoundedAverageForVenue() throws Exception {
        mockMvc.perform(get("/api/ratings/average/venue/{id}", venue.getId()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(content().string("3.0"));
    }

    @Test
    void shouldReturnZeroWhenNoRatingsForService() throws Exception {
        ratingRepository.deleteAll();
        mockMvc.perform(get("/api/ratings/average/other-service/{id}", svc.getId()))
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(content().string("0.0"));
    }

    @Test
    void shouldReportIsVotedByUserVenue() throws Exception {
        mockMvc.perform(get("/api/ratings/service/{serviceId}/isVoted/{userId}", venue.getId(), client.getId())
                .param("isVenue", "true"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(content().string("true"));
    }

    @Test
    void shouldReportCanVoteForVenue() throws Exception {
        mockMvc.perform(get("/api/ratings/service/{serviceId}/canVote/{userId}", venue.getId(), client.getId())
                .param("isVenue", "true"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(content().string("true"));
    }

    @Test
    void shouldCreateRatingThroughRest() throws Exception {
        var dto = new com.eventbride.dto.RatingDTO();
        dto.setStars(5.0);
        dto.setComment("¡Súper!");
        dto.setUserId(client.getId());
        dto.setVenueId(venue.getId());

        mockMvc.perform(post("/api/ratings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.stars", is(5.0)))
            .andExpect(jsonPath("$.comment", is("¡Súper!")))
            .andExpect(jsonPath("$.venue.id", is(venue.getId())));
    }
}
