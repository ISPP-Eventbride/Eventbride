package com.eventbride.tests.payments;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;

import com.eventbride.rating.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.eventbride.payment.PaymentRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.VenueRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
public class PaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private OtherServiceRepository otherServiceRepository;

    @Autowired
    private EventPropertiesRepository eventPropertiesRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User user;
    private User user2;
    private EventProperties eventProperties;
    private OtherService otherService;

    @BeforeEach
    void setup() {
        invitationRepository.deleteAll();
        notificationRepository.deleteAll();
        eventPropertiesRepository.deleteAll();
        ratingRepository.deleteAll();
        otherServiceRepository.deleteAll();
        venueRepository.deleteAll();

        paymentRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Crear client
        user = new User();
        user.setUsername("juan");
        user.setPassword("1234");
        user.setRole("CLIENT");
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setEmail("juan@example.com");
        user.setDni("12345678Z");
        user.setTelephone(623456789);
        user.setReceivesEmails(true);
        user = userRepository.saveAndFlush(user);

        // Crear provider
        user2 = new User();
        user2.setUsername("fran");
        user2.setPassword("1234");
        user2.setRole("SUPPLIER");
        user2.setFirstName("Francisco");
        user2.setLastName("Pérez");
        user2.setEmail("fran@example.com");
        user2.setDni("12345675B");
        user2.setTelephone(987654321);
        user2.setReceivesEmails(true);
        user2 = userRepository.saveAndFlush(user);

        // Crear servicio
        otherService = new OtherService();
        otherService.setName("Servicio Fotografía");
        otherService.setPicture("test");
        otherService.setCityAvailable("Sevilla");
        otherService.setDescription("test");
        otherService.setExtraInformation("test");
        otherService.setAvailable(true);
        otherService.setFixedPrice(BigDecimal.valueOf(100.0));
        otherService.setLimitedByPricePerGuest(false);
        otherService.setLimitedByPricePerHour(false);
        otherService.setOtherServiceType(OtherServiceType.CATERING);
        otherService.setServicePricePerGuest(BigDecimal.valueOf(100.0));
        otherService.setServicePricePerHour(BigDecimal.valueOf(100.0));
        otherService.setUser(user2);
        otherService = otherServiceRepository.saveAndFlush(otherService);


        // Crear evento y properties
        Event event = new Event();
        event.setUser(user);
        event.setName("test");
        event.setEventType(EventType.WEDDING);
        event.setGuests(100);
        event.setEventDate(LocalDate.of(2025, 12, 20));
        event.setPaymentDate(event.getPaymentDate());

        eventProperties = new EventProperties();
        eventProperties.setOtherService(otherService);
        eventProperties.setPricePerService(BigDecimal.valueOf(100.0));
        eventProperties.setBookDateTime(LocalDateTime.now());
        eventProperties.setStatus(Status.APPROVED);
        eventProperties.setDepositAmount(20.0);

        event.setEventProperties(List.of(eventProperties));
        event = eventRepository.save(event);

        eventProperties = event.getEventProperties().get(0);
    }

    @Test
    void shouldPayDepositSuccessfully() throws Exception {
        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + user.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentType").value("DEPOSIT"))
            .andExpect(jsonPath("$.user.id").value(user.getId()))
            .andExpect(jsonPath("$.eventProperties.id").value(eventProperties.getId()));
    }

    @Test
    void shouldRejectDepositWhenUserNotAuthorized() throws Exception {
        User otherUser = new User();
        otherUser.setFirstName("Otro");
        otherUser.setLastName("Usuario");
        otherUser.setUsername("otro");
        otherUser.setPassword("pass");
        otherUser.setEmail("otro@example.com");
        otherUser.setDni("44444444A");
        otherUser.setTelephone(999999999);
        otherUser.setRole("CLIENT");
        otherUser.setReceivesEmails(true);
        otherUser = userRepository.saveAndFlush(otherUser);

        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + otherUser.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("El usuario no está autorizado para realizar este pago"));
    }

    @Test
    void shouldGetPaymentsFromEventId() throws Exception {
        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + user.getId()))
                .andExpect(status().isOk());

        Integer eventId = eventRepository.findByEventPropertiesId(eventProperties.getId()).get().getId();

        mockMvc.perform(get("/api/payment/" + eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(2))) // Debería haber al menos un pago
                .andExpect(jsonPath("$[0].paymentType").value("DEPOSIT"));
    }

    @Test
    void shouldPayRemainingSuccessfully() throws Exception {
        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + user.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-remaining/" + user.getId()))
                .andExpect(status().isOk());

        Integer eventId = eventRepository.findByEventPropertiesId(eventProperties.getId()).get().getId();
        mockMvc.perform(get("/api/payment/" + eventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(4)))  // Debería haber dos pagos ahora
                .andExpect(jsonPath("$[0].paymentType").value("DEPOSIT"))
                .andExpect(jsonPath("$[1].paymentType").value("REMAINING"));
    }


    @Test
    void shouldRejectRemainingWhenUserNotAuthorized() throws Exception {
        User otherUser = new User();
        otherUser.setFirstName("Otro");
        otherUser.setLastName("Usuario");
        otherUser.setUsername("otro");
        otherUser.setPassword("pass");
        otherUser.setEmail("otro@example.com");
        otherUser.setDni("44444444A");
        otherUser.setTelephone(999999999);
        otherUser.setRole("CLIENT");
        otherUser.setReceivesEmails(true);
        otherUser = userRepository.saveAndFlush(otherUser);

        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-remaining/" + otherUser.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("El usuario no está autorizado para realizar este pago"));
    }

    @Test
    void shouldCreatePaymentPlan() throws Exception {
        Double amount = 50.0;

        mockMvc.perform(post("/api/payment/plan/" + user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(amount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentType").value("PLAN"))
                .andExpect(jsonPath("$.user.id").value(user.getId()))
                .andExpect(jsonPath("$.amount").value(amount));
    }

    @Test
    void shouldGetPaymentsForProvider() throws Exception {
        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + user.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/payment/provider/" + user2.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(2))); // Debería haber al menos un pago
    }

    // 8. Prueba para manejar el caso de un proveedor sin pagos
    @Test
    void shouldHandleProviderWithNoPayments() throws Exception {
        // Crear un nuevo usuario proveedor sin pagos asociados
        User newProvider = new User();
        newProvider.setUsername("newprovider");
        newProvider.setPassword("1234");
        newProvider.setRole("SUPPLIER");
        newProvider.setFirstName("New");
        newProvider.setLastName("Provider");
        newProvider.setEmail("newprovider@example.com");
        newProvider.setDni("12345665R");
        newProvider.setTelephone(655555555);
        newProvider.setReceivesEmails(true);
        newProvider = userRepository.saveAndFlush(newProvider);

        mockMvc.perform(get("/api/payment/provider/" + newProvider.getId()))
                .andExpect(status().isNotFound());
    }

    // 9. Prueba para manejar el caso de un usuario no existente
    @Test
    void shouldHandleNonExistentUser() throws Exception {
        Integer nonExistentUserId = 99999;

        mockMvc.perform(get("/api/payment/provider/" + nonExistentUserId))
                .andExpect(status().isNotFound());
    }

    /*
    //TODO hay que arreglar en el servicio que no deje pagar dos veces el mismo deposito
    @Test
    void shouldRejectPayingDepositTwice() throws Exception {
        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + user.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/payment/" + eventProperties.getId() + "/pay-deposit/" + user.getId()))
                .andExpect(status().isBadRequest());
    }
    */
}
