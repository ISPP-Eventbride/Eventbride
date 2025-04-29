package com.eventbride.tests.invitations;

import com.eventbride.event.Event;
import com.eventbride.event.EventRepository;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.invitation.Invitation;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.Venue;
import com.eventbride.venue.VenueRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.databind.JsonNode;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/*

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class InvitationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private VenueRepository venueRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private InvitationRepository invitationRepository;

    private Event event;

    @BeforeAll
    void setup() {

        // Usuario
        User user = new User();
        user.setUsername("user1");
        user.setEmail("user1@example.com");
        user.setPassword("1234");
        user.setRole("USER");

        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setDni("A" + UUID.randomUUID().toString().substring(0, 8));
        user.setTelephone(654321123);
        user.setReceivesEmails(true);

        user = userRepository.save(user);

        // Venue
        Venue venue = new Venue();
        venue.setName("Venue Test");
        venue.setPostalCode("12345");
        venue.setAddress("Calle Ejemplo");
        venue.setCoordinates("0,0");
        venue.setMaxGuests(100);
        venue.setSurface(200.0);
        venue.setEarliestTime(LocalTime.of(9, 0));
        venue.setLatestTime(LocalTime.of(22, 0));
        venue.setUser(user);

        venue.setFixedPrice(new BigDecimal("700.00"));
        venue.setServicePricePerGuest(new BigDecimal("25.00"));
        venue.setServicePricePerHour(new BigDecimal("60.00"));
        venue.setLimitedByPricePerGuest(false);
        venue.setLimitedByPricePerHour(false);

        venue.setAvailable(true);
        venue.setPicture("https://example.com/foto.jpg");
        venue.setDescription("Espacio amplio para celebraciones");
        venue.setCityAvailable("Sevilla");

        venue = venueRepository.save(venue);

        EventProperties props = new EventProperties();
        props.setVenue(venue);
        props.setBookDateTime(LocalDateTime.now());
        props.setStartTime(LocalDateTime.now().plusHours(1));
        props.setEndTime(LocalDateTime.now().plusHours(5));
        props.setPricePerService(BigDecimal.valueOf(500));
        props.setDepositAmount(100.0);
        props.setStatus(EventProperties.Status.APPROVED);

        // Evento
        event = new Event();
        event.setUser(user);
        event.setName("Evento Prueba");
        event.setGuests(50);
        event.setEventType(Event.EventType.WEDDING);
        event.setEventDate(LocalDate.now().plusDays(30));
        event.setPaymentDate(LocalDate.now().plusDays(10));
        event.setPaid(false);
        event.setConfirmedGuests(0);
        event.setEventProperties(List.of(props));

        event = eventRepository.save(event);
    }

    
     * @Test
     * 
     * @WithMockUser(username = "user1", authorities = {"USER"})
     * void shouldCreateAndFillInvitationSuccessfully() throws Exception {
     * // Paso 1: Crear invitación vacía
     * MvcResult result = mockMvc.perform(post("/api/invitation/create/" +
     * event.getId())
     * .contentType(MediaType.APPLICATION_JSON)
     * .content("5"))
     * .andExpect(status().isCreated())
     * .andExpect(jsonPath("$.maxGuests").value(5))
     * .andReturn();
     * 
     * 
     * String responseJson = result.getResponse().getContentAsString();
     * ObjectMapper mapper = new ObjectMapper();
     * JsonNode jsonNode = mapper.readTree(responseJson);
     * int invitationId = jsonNode.get("id").asInt();
     * 
     * Invitation invitation = new Invitation();
     * invitation.setId(invitationId);
     * invitation.setFirstName("Lucía");
     * invitation.setLastName("Ruiz Rodríguez");
     * invitation.setNumberOfGuests(2);
     * invitation.setMaxGuests(5);
     * invitation.setTelephone(654000111);
     * invitation.setEmail("lucia.ruiz+" + UUID.randomUUID().toString() +
     * "@example.com");
     * invitation.setInvitationType(Invitation.InvitationType.ACCEPTED);
     * 
     * String filledJson = mapper.writeValueAsString(invitation);
     * 
     * mockMvc.perform(put("/api/invitation")
     * .contentType(MediaType.APPLICATION_JSON)
     * .content(filledJson))
     * .andExpect(status().isCreated())
     * .andExpect(jsonPath("$.firstName").value("Lucía"))
     * .andExpect(jsonPath("$.invitationType").value("ACCEPTED"));
     * }
     

    @Test
    @WithMockUser(username = "user1", authorities = { "USER" })
    void shouldGetInvitationById() throws Exception {
        Invitation invitation = new Invitation();
        invitation.setEmail("ejemplo@correo.com");
        invitation.setMaxGuests(5);
        invitation.setEvent(event);
        invitation.setInvitationType(Invitation.InvitationType.SENT);

        invitation = invitationRepository.save(invitation);

        mockMvc.perform(get("/api/invitation/" + invitation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invitation.getId()))
                .andExpect(jsonPath("$.email").value("ejemplo@correo.com"));
    }

    @Test
    @WithMockUser(username = "user1", authorities = { "USER" })
    void shouldDeleteInvitationSuccessfully() throws Exception {
        Invitation invitation = new Invitation();
        invitation.setEmail("borrar@correo.com");
        invitation.setMaxGuests(3);
        invitation.setEvent(event);
        invitation.setInvitationType(Invitation.InvitationType.SENT);
        invitation = invitationRepository.save(invitation);

        mockMvc.perform(delete("/api/invitation/" + invitation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Se ha eliminado la invitación correctamente"));
    } 

    @Test
    @WithMockUser(username = "user1", authorities = { "USER" })
    void shouldFailIfInvitationDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/invitation/999999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("La invitación no existe"));
    }
}

*/
