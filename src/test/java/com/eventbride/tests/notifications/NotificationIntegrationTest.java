package com.eventbride.tests.notifications;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eventbride.chat.ChatRepository;
import com.eventbride.event.EventRepository;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.notification.Notification;
import com.eventbride.notification.NotificationRepository;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.rating.RatingRepository;
import com.eventbride.user.User;
import com.eventbride.user.User.Plan;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.VenueRepository;

@SpringBootTest
@AutoConfigureMockMvc
class NotificationIntegrationTest {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private VenueRepository venueRepository;

	@Autowired
	private OtherServiceRepository otherServiceRepository;

	@Autowired
	private InvitationRepository invitationRepository;

	@Autowired
	private ChatRepository chatMessageRepository;

	@Autowired
	private RatingRepository ratingRepository;

	@Autowired
	private NotificationRepository notificationRepository;

    @Autowired
    private MockMvc mockMvc;

	private User aliceUser;

	@BeforeEach
	void setup() {
		chatMessageRepository.deleteAll();
		notificationRepository.deleteAll();
		invitationRepository.deleteAll();
		ratingRepository.deleteAll();
		eventRepository.deleteAll();
		venueRepository.deleteAll();
		otherServiceRepository.deleteAll();
		userRepository.deleteAll();

		aliceUser = new User();
        aliceUser.setFirstName("alice");
        aliceUser.setLastName("alice");
        aliceUser.setUsername("alice123");
        aliceUser.setEmail("alice@example.com");
        aliceUser.setTelephone(623456789);
        aliceUser.setPassword("securePassword");
        aliceUser.setDni("12345678Z");
        aliceUser.setRole("CLIENT");
        aliceUser.setPaymentPlanDate(LocalDate.now());
        aliceUser.setExpirePlanDate(LocalDate.now().plusMonths(1));
        aliceUser.setReceivesEmails(true);
        aliceUser.setProfilePicture("https://example.com/pic.jpg");
        aliceUser = userRepository.saveAndFlush(aliceUser);

		Notification notification = new Notification();
		notification.setSubject("Test Subject");
		notification.setMessage("Test Message");
		notification.setUser(aliceUser);
		notification.setCreatedAt(LocalDateTime.now());
		notification.setType(Notification.NotificationType.NEW_MESSAGE);
		notificationRepository.saveAndFlush(notification);

	}

    @Test
    @WithMockUser(username = "alice123")
    void testGetAllNotificationsForUser() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject", is(notNullValue())))
                .andExpect(jsonPath("$[0].message", is(notNullValue())));
    }

    @Test
    @WithMockUser(username = "nonExistentUser")
    void testGetAllNotificationsForNonExistentUser() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isInternalServerError()); // The SecurityException is properly thrown and produces a
                                                              // 500 error
    }
}
