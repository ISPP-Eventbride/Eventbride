package com.eventbride.tests.otherServices;

import com.eventbride.dto.OtherServiceDTO;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventPropertiesService;
import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherService.OtherServiceType;
import com.eventbride.otherService.OtherServiceService;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class OtherServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private OtherServiceService otherServiceService;
    
    @MockBean
    private EventPropertiesService eventPropertiesService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "testuser")
    void testGetAllOtherServices_withResults() throws Exception {
        User user = new User();
        user.setId(1);
        user.setUsername("proveedor");
        user.setEmail("proveedor@example.com");
        user.setDni("12345678Z");
        user.setRole("OWNER");
        user.setPlan(User.Plan.PREMIUM);
        user.setReceivesEmails(true);

        OtherService otherService = new OtherService();
        otherService.setId(1);
        otherService.setName("Decoración Premium");
        otherService.setAvailable(true);
        otherService.setCityAvailable("Sevilla");
        otherService.setServicePricePerGuest(new BigDecimal("10.00"));
        otherService.setServicePricePerHour(new BigDecimal("25.00"));
        otherService.setFixedPrice(new BigDecimal("500.00"));
        otherService.setPicture("https://example.com/decor.jpg");
        otherService.setDescription("Decoración completa para eventos.");
        otherService.setExtraInformation("Incluye iluminación, manteles, flores, etc.");
        otherService.setOtherServiceType(OtherService.OtherServiceType.DECORATION);
        otherService.setLimitedByPricePerGuest(false);
        otherService.setLimitedByPricePerHour(false);
        otherService.setUser(user);

        when(otherServiceService.getAllOtherServices()).thenReturn(List.of(otherService));

        mockMvc.perform(get("/api/other-services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Decoración Premium")))
                .andExpect(jsonPath("$[0].cityAvailable", is("Sevilla")))
                .andExpect(jsonPath("$[0].available", is(true)))
                .andExpect(jsonPath("$[0].otherServiceType", is("DECORATION")))
                .andExpect(jsonPath("$[0].description", containsString("completa")))
                .andExpect(jsonPath("$[0].extraInformation", containsString("flores")));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetAllOtherServices_emptyList() throws Exception {
        when(otherServiceService.getAllOtherServices()).thenReturn(List.of());

        mockMvc.perform(get("/api/other-services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetOtherServiceById_existingId_returnsService() throws Exception {
        User user = new User();
        user.setId(1);
        user.setUsername("proveedor");
        user.setEmail("proveedor@example.com");
        user.setDni("12345678Z");
        user.setRole("OWNER");
        user.setPlan(User.Plan.PREMIUM);
        user.setReceivesEmails(true);

        OtherService service = new OtherService();
        service.setId(1);
        service.setName("Decoración Premium");
        service.setAvailable(true);
        service.setCityAvailable("Sevilla");
        service.setServicePricePerGuest(new BigDecimal("10.00"));
        service.setServicePricePerHour(new BigDecimal("25.00"));
        service.setFixedPrice(new BigDecimal("500.00"));
        service.setPicture("https://example.com/decor.jpg");
        service.setDescription("Decoración completa para eventos.");
        service.setExtraInformation("Incluye iluminación, manteles, flores, etc.");
        service.setOtherServiceType(OtherService.OtherServiceType.DECORATION);
        service.setLimitedByPricePerGuest(false);
        service.setLimitedByPricePerHour(false);
        service.setUser(user);

        when(otherServiceService.getOtherServiceById(1)).thenReturn(Optional.of(service));

        mockMvc.perform(get("/api/other-services/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Decoración Premium")))
                .andExpect(jsonPath("$.cityAvailable", is("Sevilla")))
                .andExpect(jsonPath("$.otherServiceType", is("DECORATION")))
                .andExpect(jsonPath("$.available", is(true)));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetFilteredOtherServices_withFilters() throws Exception {
        User user = new User();
        user.setId(1);
        user.setUsername("proveedor");
        user.setEmail("proveedor@example.com");
        user.setDni("12345678Z");
        user.setRole("OWNER");
        user.setPlan(User.Plan.PREMIUM);
        user.setReceivesEmails(true);

        OtherService otherService1 = new OtherService();
        otherService1.setId(1);
        otherService1.setName("Catering Premium");
        otherService1.setAvailable(true);
        otherService1.setCityAvailable("Madrid");
        otherService1.setServicePricePerGuest(new BigDecimal("10.00"));
        otherService1.setServicePricePerHour(new BigDecimal("25.00"));
        otherService1.setFixedPrice(new BigDecimal("500.00"));
        otherService1.setPicture("https://example.com/catering.jpg");
        otherService1.setDescription("Catering completo para eventos.");
        otherService1.setExtraInformation("Incluye bebida, tapas, y postres.");
        otherService1.setOtherServiceType(OtherService.OtherServiceType.CATERING);
        otherService1.setLimitedByPricePerGuest(false);
        otherService1.setLimitedByPricePerHour(false);
        otherService1.setUser(user);

        List<OtherService> mockServices = List.of(otherService1);

        when(otherServiceService.getFilteredOtherServices("Catering", "Madrid", OtherService.OtherServiceType.CATERING))
                .thenReturn(mockServices);

        mockMvc.perform(get("/api/other-services/filter")
                        .param("name", "Catering")
                        .param("city", "Madrid")
                        .param("type", "CATERING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Catering Premium")))
                .andExpect(jsonPath("$[0].cityAvailable", is("Madrid")))
                .andExpect(jsonPath("$[0].available", is(true)))
                .andExpect(jsonPath("$[0].otherServiceType", is("CATERING")))
                .andExpect(jsonPath("$[0].description", containsString("completo")))
                .andExpect(jsonPath("$[0].extraInformation", containsString("bebida")));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetFilteredOtherServices_emptyList() throws Exception {
        when(otherServiceService.getFilteredOtherServices("Catering", "Madrid", OtherService.OtherServiceType.CATERING))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/other-services/filter")
                        .param("name", "Catering")
                        .param("city", "Madrid")
                        .param("type", "CATERING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetFilteredOtherServices_withoutFilters() throws Exception {
        User user = new User();
        user.setId(1);
        user.setUsername("proveedor");
        user.setEmail("proveedor@example.com");
        user.setDni("12345678Z");
        user.setRole("OWNER");
        user.setPlan(User.Plan.PREMIUM);
        user.setReceivesEmails(true);

        OtherService otherService1 = new OtherService();
        otherService1.setId(1);
        otherService1.setName("Catering Premium");
        otherService1.setAvailable(true);
        otherService1.setCityAvailable("Madrid");
        otherService1.setServicePricePerGuest(new BigDecimal("10.00"));
        otherService1.setServicePricePerHour(new BigDecimal("25.00"));
        otherService1.setFixedPrice(new BigDecimal("500.00"));
        otherService1.setPicture("https://example.com/catering.jpg");
        otherService1.setDescription("Catering completo para eventos.");
        otherService1.setExtraInformation("Incluye bebida, tapas, y postres.");
        otherService1.setOtherServiceType(OtherService.OtherServiceType.CATERING);
        otherService1.setLimitedByPricePerGuest(false);
        otherService1.setLimitedByPricePerHour(false);
        otherService1.setUser(user);

        List<OtherService> mockServices = List.of(otherService1);

        when(otherServiceService.getFilteredOtherServices(null, null, null))
                .thenReturn(mockServices);

        mockMvc.perform(get("/api/other-services/filter")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Catering Premium")))
                .andExpect(jsonPath("$[0].cityAvailable", is("Madrid")));
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"SUPPLIER"})
    void testDeleteOtherService_serviceNotFound() throws Exception {
        when(otherServiceService.getOtherServiceById(1)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/other-services/delete/1"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Servicio no encontrado"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"SUPPLIER"})
    void testDeleteOtherService_withoutPermission() throws Exception {
        User user = new User();
        user.setId(2);
        user.setUsername("anotheruser");
        user.setEmail("anotheruser@example.com");
        user.setRole("SUPPLIER");

        OtherService otherService = new OtherService();
        otherService.setId(1);
        otherService.setName("Catering Premium");
        otherService.setUser(user);

        when(otherServiceService.getOtherServiceById(1)).thenReturn(Optional.of(otherService));

        mockMvc.perform(delete("/api/other-services/delete/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("No tienes permisos para eliminar este servicio"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"SUPPLIER"})
    void testDeleteOtherService_success() throws Exception {
        User user = new User();
        user.setId(1);
        user.setUsername("testuser");
        user.setEmail("testuser@example.com");
        user.setRole("SUPPLIER");

        OtherService otherService = new OtherService();
        otherService.setId(1);
        otherService.setName("Catering Premium");
        otherService.setUser(user);

        when(otherServiceService.getOtherServiceById(1)).thenReturn(Optional.of(otherService));
        doNothing().when(otherServiceService).deleteOtherService(1);

        mockMvc.perform(delete("/api/other-services/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Eliminado correctamente"));
    }

}
