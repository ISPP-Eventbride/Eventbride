package com.eventbride.tests.events;

import com.eventbride.chat.ChatRepository;
import com.eventbride.config.jwt.JWTUtils;
import com.eventbride.event.Event;
import com.eventbride.event.EventRepository;
import com.eventbride.event.Event.EventType;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.notification.NotificationRepository;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.user.User.Plan;
import com.eventbride.venue.VenueRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class EventIntegrationTest {

    // #region Autowired

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private OtherServiceRepository otherServiceRepository;

    @Autowired
    private ChatRepository chatMessageRepository;

    private User adminUser;
    private User clientUser;
    private User clientUserEvent;
    private Event event;

    // #endregion

    // #region Constructor
    @BeforeEach
    void setup() {
        chatMessageRepository.deleteAll();
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        notificationRepository.deleteAll();
        venueRepository.deleteAll();
        otherServiceRepository.deleteAll();
        userRepository.deleteAll();

        // admin user
        adminUser = new User();
        adminUser.setFirstName("Juan");
        adminUser.setLastName("Pérez");
        adminUser.setUsername("juanp");
        adminUser.setEmail("juan@example.com");
        adminUser.setTelephone(623456789);
        adminUser.setPassword("securePassword");
        adminUser.setDni("12345678Z");
        adminUser.setRole("ADMIN");
        adminUser.setPlan(Plan.PREMIUM);
        adminUser.setPaymentPlanDate(LocalDate.now());
        adminUser.setExpirePlanDate(LocalDate.now().plusMonths(1));
        adminUser.setReceivesEmails(true);
        adminUser.setProfilePicture("https://example.com/pic.jpg");
        adminUser = userRepository.saveAndFlush(adminUser);

        // client user
        clientUser = new User();
        clientUser.setFirstName("Ana");
        clientUser.setLastName("García");
        clientUser.setUsername("anag");
        clientUser.setEmail("ana@gmail.com");
        clientUser.setTelephone(987654321);
        clientUser.setPassword("securePassword");
        clientUser.setDni("87654321X");
        clientUser.setRole("CLIENT");
        clientUser.setPlan(Plan.PREMIUM);
        clientUser.setPaymentPlanDate(LocalDate.now());
        clientUser.setExpirePlanDate(LocalDate.now().plusMonths(1));
        clientUser.setReceivesEmails(true);
        clientUser.setProfilePicture("https://example.com/pic.jpg");
        clientUser = userRepository.saveAndFlush(clientUser);

        // client user event
        clientUserEvent = new User();
        clientUserEvent.setFirstName("Pedro");
        clientUserEvent.setLastName("López");
        clientUserEvent.setUsername("pedrol");
        clientUserEvent.setEmail("pedro@gmail.com");
        clientUserEvent.setTelephone(756789123);
        clientUserEvent.setPassword("securePassword");
        clientUserEvent.setDni("45678912S");
        clientUserEvent.setRole("CLIENT");
        clientUserEvent.setPlan(Plan.PREMIUM);
        clientUserEvent.setPaymentPlanDate(LocalDate.now());
        clientUserEvent.setExpirePlanDate(LocalDate.now().plusMonths(1));
        clientUserEvent.setReceivesEmails(true);
        clientUserEvent.setProfilePicture("https://example.com/pic.jpg");
        clientUserEvent = userRepository.saveAndFlush(clientUserEvent);

        // event
        event = new Event();
        event.setEventType(EventType.WEDDING);
        event.setGuests(100);
        event.setEventDate(LocalDate.now().plusMonths(6));
        event.setUser(clientUserEvent);
        event.setConfirmedGuests(66);
        event.setPaid(false);
        event.setName("Boda de Pedro");
        event.setPaymentDate(LocalDate.now().plusMonths(3));
        event = eventRepository.save(event);

        // #endregion

    }

    // #region Tests

    // 1. Get all events (DTO)
    @Test
    @WithMockUser(username = "admin", authorities = { "ADMIN" })
    public void testGetAllEvents() throws Exception {
        mockMvc.perform(get("/api/v1/events/DTO")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].name").value("Boda de Pedro"));
    }

    // 2. Get event by ID
    @Test
    @WithMockUser(username = "pedrol", authorities = { "CLIENT" })
    public void testGetEventById() throws Exception {
        mockMvc.perform(get("/api/v1/events/" + event.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()) // Status OK (200)
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.name").value("Boda de Pedro"));
    }

/*     // 3. Delete an event
    @Test
    @WithMockUser(username = "pedrol", authorities = { "CLIENT" })
    public void testDeleteEvent() throws Exception {
        mockMvc.perform(delete("/api/v1/events/" + event.getId()))
                .andExpect(status().isOk()) // Status OK (200)
                .andExpect(jsonPath("$.message").value("El evento se ha eliminado correctamente"));
    } */

    // 4. Get events by user ID
    @Test
    @WithMockUser(username = "pedrol", authorities = { "CLIENT" })
    public void testFindAllEventsByClient() throws Exception {

        mockMvc.perform(get("/api/v1/events/next/" + clientUserEvent.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()) // Status OK (200)
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].name").value("Boda de Pedro"));
    }

    // 5.Get events by user ID without a service
    @Test
    @WithMockUser(username = "pedrol", authorities = { "CLIENT" })
    public void testGetEventsByUserIdWithoutService() throws Exception {
        mockMvc.perform(get("/api/v1/events/next/" + clientUserEvent.getId() + "/without/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // #endregion

}
