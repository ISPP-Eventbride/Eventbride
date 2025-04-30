package com.eventbride.tests.chat;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.eventbride.chat.ChatMessage;
import com.eventbride.chat.ChatRepository;
import com.eventbride.event.EventRepository;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ChatIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ChatRepository chatRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private InvitationRepository invitationRepository;

	private User bob;

	@BeforeAll
	void setupBobAndMessages() {
		// Buscar o crear bob
		this.bob = userRepository.findByUsername("bob123").orElseGet(() -> {
			User newBob = new User();
			newBob.setUsername("bob123");
			newBob.setPassword(passwordEncoder.encode("test"));
			newBob.setDni("98765432M");
			newBob.setRole("SUPPLIER");
			newBob.setPlan(User.Plan.BASIC);
			newBob.setReceivesEmails(true);
			newBob.setFirstName("Bob");
			newBob.setLastName("Builder");
			newBob.setEmail("bob@example.com");
			newBob.setTelephone(987654321);
			newBob.setProfilePicture("https://example.com/bob.jpg");
			return userRepository.save(newBob);
		});

		// Buscar alice
		Optional<User> aliceOpt = userRepository.findByUsername("alice123");
		if (aliceOpt.isEmpty()) {
			throw new IllegalStateException("El usuario alice123 debe existir en la base de datos");
		}
		User alice = aliceOpt.get();

		// Crear mensaje "Hola Bob" si no existe
		boolean exists = chatRepository
			.findMessagesBetweenUsers2(alice, bob)
			.stream()
			.anyMatch(m -> "Hola Bob".equals(m.getContent()));
		if (!exists) {
			ChatMessage message = new ChatMessage();
			message.setContent("Hola Bob");
			message.setTimestamp(LocalDateTime.now());
			message.setSender(alice);
			message.setReceiver(bob);
			chatRepository.save(message);
		}

		// Crear mensaje "Hola nuevo" si no existe
		boolean existsNuevo = chatRepository
			.findMessagesBetweenUsers2(alice, bob)
			.stream()
			.anyMatch(m -> "Hola nuevo".equals(m.getContent()));
		if (!existsNuevo) {
			ChatMessage msg = new ChatMessage();
			msg.setContent("Hola nuevo");
			msg.setTimestamp(LocalDateTime.of(2025, 4, 6, 19, 43, 16));
			msg.setSender(alice);
			msg.setReceiver(bob);
			chatRepository.save(msg);
		}
	}

	@Test
	@WithMockUser(username = "alice123")
	void testGetUserConversationsReturnsLastMessagePerUser() throws Exception {
		mockMvc.perform(get("/api/chat/conversations"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].content").value("Hola Bob"))
			.andExpect(jsonPath("$[0].sender.username").value("alice123"))
			.andExpect(jsonPath("$[0].receiver.username").value("bob123"));
	}

	@Test
	@WithMockUser(username = "alice123")
	void testFindMessagesBetweenUsersReturnsMessages() throws Exception {
		mockMvc.perform(get("/api/chat/" + bob.getId()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[*].content").value(org.hamcrest.Matchers.containsInAnyOrder("Hola Bob", "Hola nuevo")))
			.andExpect(jsonPath("$[*].sender.username").value(org.hamcrest.Matchers.hasItem("alice123")))
			.andExpect(jsonPath("$[*].receiver.username").value(org.hamcrest.Matchers.hasItem("bob123")));
	}
}
