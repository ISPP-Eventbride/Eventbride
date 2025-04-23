package com.eventbride.tests.users;

import com.eventbride.chat.ChatRepository;
import com.eventbride.event.EventRepository;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.notification.NotificationRepository;
import com.eventbride.notification.NotificationService;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.eventbride.venue.VenueRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UsersIntegrationTest {

//#region Autowired 

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private NotificationService notificationService;

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
    private NotificationRepository notificationRepository;

//#endregion

    private User adminUser;
    private User normalUser;
    private User supplierUser;
    private User clientUser;

    @BeforeEach
    void setup() {
        chatMessageRepository.deleteAll();
        notificationRepository.deleteAll();    
        invitationRepository.deleteAll();
        eventRepository.deleteAll();
        venueRepository.deleteAll();
        otherServiceRepository.deleteAll();
        userRepository.deleteAll();

        // admin
        adminUser = new User();
        adminUser.setFirstName("AdminTest");
        adminUser.setLastName("User");
        adminUser.setUsername("admintest");
        adminUser.setPassword("1234");
        adminUser.setEmail("admintest@example.com");
        adminUser.setDni("12345678X");
        adminUser.setTelephone(123456789);
        adminUser.setRole("ADMIN");
        adminUser.setReceivesEmails(true);
        adminUser.setPlan(null);
        adminUser.setPaymentPlanDate(null);
        adminUser.setExpirePlanDate(null);
        adminUser = userRepository.saveAndFlush(adminUser);

        // normal user
        normalUser = new User();
        normalUser.setFirstName("Juan");
        normalUser.setLastName("Pérez");
        normalUser.setUsername("juanp");
        normalUser.setPassword("abcd");
        normalUser.setEmail("juan@example.com");
        normalUser.setDni("11111111H");
        normalUser.setTelephone(987654321);
        normalUser.setRole("USER");
        normalUser.setReceivesEmails(true);
        normalUser.setPlan(User.Plan.BASIC);
        normalUser.setPaymentPlanDate(null);
        normalUser.setExpirePlanDate(null);
        normalUser = userRepository.saveAndFlush(normalUser);

        // supplier user
        supplierUser = new User();
        supplierUser.setFirstName("Proveedor");
        supplierUser.setLastName("García");
        supplierUser.setUsername("proveedor1");
        supplierUser.setPassword("supply123");
        supplierUser.setEmail("supplier@example.com");
        supplierUser.setDni("22222222X");
        supplierUser.setTelephone(111111111);
        supplierUser.setRole("SUPPLIER");
        supplierUser.setReceivesEmails(true);
        supplierUser.setPlan(User.Plan.PREMIUM);
        supplierUser.setExpirePlanDate(LocalDate.now().minusDays(1)); 
        supplierUser.setPaymentPlanDate(LocalDate.now().minusMonths(1)); 
        supplierUser = userRepository.saveAndFlush(supplierUser);

        // client user
        clientUser = new User();
        clientUser.setFirstName("Cliente");
        clientUser.setLastName("López");
        clientUser.setUsername("cliente1");
        clientUser.setPassword("client123");
        clientUser.setEmail("client@example.com");
        clientUser.setDni("33333333Y");
        clientUser.setTelephone(222222222);
        clientUser.setRole("CLIENT");
        clientUser.setReceivesEmails(true);
        clientUser.setPlan(null);
        clientUser.setPaymentPlanDate(null);
        clientUser.setExpirePlanDate(null);
        clientUser = userRepository.saveAndFlush(clientUser);
    }


    // 1. GET /api/users (getAllUsers)
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldReturnAllUsersAsAdmin() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk()) 
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldRejectNonAdminOnGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isBadRequest());
    }

    // 2. GET /api/users/DTO (getAllUsersDTO)
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldReturnUserDTOList() throws Exception {
        mockMvc.perform(get("/api/users/DTO"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldRejectNonAdminOnUserDTOList() throws Exception {
        mockMvc.perform(get("/api/users/DTO"))
                .andExpect(status().isBadRequest());
    }

    // 3. GET /api/users/{id} (getUserById)
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldReturnUserByIdAsAdmin() throws Exception {
        mockMvc.perform(get("/api/users/" + adminUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(adminUser.getId()));
    }

    @Test
    @WithMockUser(username = "proveedor1", authorities = {"SUPPLIER"})
    void supplierShouldNotAccessOtherUsersData() throws Exception {
        mockMvc.perform(get("/api/users/" + adminUser.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "cliente1", authorities = {"CLIENT"})
    void clientShouldNotAccessAdminData() throws Exception {
        mockMvc.perform(get("/api/users/" + adminUser.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldRejectNonAdminAccessingAnotherUser() throws Exception {
        mockMvc.perform(get("/api/users/" + adminUser.getId()))
                .andExpect(status().isBadRequest());
    }

    // 4. GET /api/users/chat/{id} (getUserByIdChat)
    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldReturnUserChatDTO() throws Exception {
        mockMvc.perform(get("/api/users/chat/" + adminUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(adminUser.getId()));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldReturn404WhenUserChatNotFound() throws Exception {
        mockMvc.perform(get("/api/users/chat/900"))
            .andExpect(jsonPath("$.error").value("404 NOT_FOUND \"Usuario no encontrado\""));
    }

    // 5. PUT /api/users/admin/{id} (updateUser as ADMIN)
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldUpdateUserAsAdmin() throws Exception {
        String updatedUserJson = "{" +
                "\"firstName\":\"Nuevo\",\"lastName\":\"Nombre\",\"username\":\"juanp\"," +
                "\"email\":\"nuevo@example.com\",\"telephone\":123456789,\"dni\":\"87654321X\"," +
                "\"role\":\"USER\",\"receivesEmails\":true," +
                "\"password\":\"abcd\"}"; // necesario por @NotBlank
    
        mockMvc.perform(put("/api/users/admin/" + normalUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("nuevo@example.com"));
    }

    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldRejectUpdateUserAsNonAdmin() throws Exception {
        mockMvc.perform(put("/api/users/admin/" + adminUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    // 6. DELETE /api/users/{id} (deleteUser)
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldDeleteUserAsAdmin() throws Exception {
        mockMvc.perform(delete("/api/users/" + adminUser.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", authorities = {"USER"})
    void shouldRejectDeleteUserAsNonAdmin() throws Exception {
        mockMvc.perform(delete("/api/users/" + adminUser.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "cliente1", authorities = {"CLIENT"})
    void clientShouldNotDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/users/" + adminUser.getId()))
                .andExpect(status().isBadRequest());
    }

    // 7. GET /api/users/planExpired/{id}
    @Test
    @WithMockUser(username = "proveedor1", authorities = {"SUPPLIER"})
    void shouldDowngradePlan() throws Exception {
        mockMvc.perform(get("/api/users/planExpired"))
                .andExpect(status().isOk());
    } 

    // 8. PUT /api/users/{id} (updateOwnProfile)
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldUpdateOwnProfile() throws Exception {
        String updatedUserJson = "{" +
        "\"firstName\":\"Yo\",\"lastName\":\"Mismo\",\"username\":\"admin\"," +
        "\"email\":\"yo@example.com\",\"telephone\":123456789,\"dni\":\"11111111X\"," +
        "\"role\":\"ADMIN\",\"receivesEmails\":true," +
        "\"password\":\"1234\"}";
    
        mockMvc.perform(put("/api/users/" + adminUser.getId())  // ← ID correcto
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("yo@example.com"));
    }

    @Test
    @WithMockUser(username = "cliente1", authorities = {"CLIENT"})
    void clientShouldUpdateOwnProfile() throws Exception {
        String updatedUserJson = "{" +
            "\"firstName\":\"ClienteActualizado\",\"lastName\":\"Nuevo\",\"username\":\"cliente1\"," +
            "\"email\":\"cliente@nuevo.com\",\"telephone\":222222222,\"dni\":\"33333333Y\"," +
            "\"role\":\"CLIENT\",\"receivesEmails\":true,\"password\":\"client123\"}";

        mockMvc.perform(put("/api/users/" + clientUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("cliente@nuevo.com"));
    }

    @Test
    @WithMockUser(username = "proveedor1", authorities = {"SUPPLIER"})
    void supplierShouldUpdateOwnProfile() throws Exception {
        String updatedUserJson = "{" +
            "\"firstName\":\"ProveedorActualizado\",\"lastName\":\"Nuevo\",\"username\":\"proveedor1\"," +
            "\"email\":\"nuevo@supplier.com\",\"telephone\":123456789,\"dni\":\"22222222X\"," +
            "\"role\":\"SUPPLIER\",\"receivesEmails\":true,\"password\":\"supply123\"}";

        mockMvc.perform(put("/api/users/" + supplierUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedUserJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("nuevo@supplier.com"));
    }
      
    
    // 9. PUT /api/users/premium/{id}
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldUpgradeToPremium() throws Exception {
        String expirationDate = LocalDate.now().plusDays(30).toString();
        mockMvc.perform(put("/api/users/premium/" + adminUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content('"' + expirationDate + '"'))
                .andExpect(status().isOk());
    }

    // 10. GET /api/users/getAdmin
    @Test
    @WithMockUser(username = "admintest", authorities = {"ADMIN"})
    void shouldReturnAdminUserId() throws Exception {
        mockMvc.perform(get("/api/users/getAdmin"))
                .andExpect(status().isOk())
                .andExpect(content().string(String.valueOf(adminUser.getId())));
    }
}
