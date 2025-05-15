package com.eventbride.tests.venues;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.eventbride.event.Event;
import com.eventbride.event.EventService;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventPropertiesService;
import com.eventbride.user.User;
import com.eventbride.venue.Venue;
import com.eventbride.venue.VenueService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VenueService venueService;

    @MockBean
    private EventService eventService;

    @MockBean
    private EventPropertiesService eventPropertiesService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "testuser")
    void testGetAllVenues_withResults() throws Exception {
        Venue venue = new Venue();
        venue.setId(1);
        venue.setName("Salón Real");
        venue.setPostalCode("41001");
        venue.setAddress("Calle Real, 123");
        venue.setCoordinates("37.3886,-5.9823");
        venue.setMaxGuests(100);
        venue.setSurface(200.0);
        venue.setEarliestTime(LocalTime.of(9, 0));
        venue.setLatestTime(LocalTime.of(22, 0));
        venue.setAvailable(true);
        venue.setCityAvailable("Sevilla");
        venue.setFixedPrice(new BigDecimal("500"));
        venue.setServicePricePerHour(new BigDecimal("50"));
        venue.setServicePricePerGuest(new BigDecimal("20"));
        venue.setPicture("http://example.com/venue.jpg");
        venue.setDescription("Salón de lujo");
        venue.setLimitedByPricePerGuest(true);
        venue.setLimitedByPricePerHour(false);

        when(venueService.getAllVenues()).thenReturn(List.of(venue));

        mockMvc.perform(get("/api/venues"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Salón Real")))
                .andExpect(jsonPath("$[0].postalCode", is("41001")));
    }

    @Test
    @WithMockUser(username = "someone")
    void testGetAllVenues_emptyList() throws Exception {
        when(venueService.getAllVenues()).thenReturn(List.of());

        mockMvc.perform(get("/api/venues"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetVenueById_existingId_returnsVenue() throws Exception {
        Venue venue = new Venue();
        venue.setId(1);
        venue.setName("Salón Real");
        venue.setPostalCode("41001");
        venue.setAddress("Calle Real, 123");
        venue.setCoordinates("37.3886,-5.9823");
        venue.setSurface(300.0);
        venue.setMaxGuests(100);
        venue.setEarliestTime(LocalTime.of(9, 0));
        venue.setLatestTime(LocalTime.of(23, 0));

        when(venueService.getVenueById(1)).thenReturn(Optional.of(venue));

        mockMvc.perform(get("/api/venues/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Salón Real")))
                .andExpect(jsonPath("$.postalCode", is("41001")))
                .andExpect(jsonPath("$.maxGuests", is(100)));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetVenueById_nonExistentId_returnsNotFound() throws Exception {
        when(venueService.getVenueById(999)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/venues/999"))
                .andExpect(status().isNotFound());
    }

    private Venue createVenue(String name, String city, int maxGuests, double surface) {
        Venue v = new Venue();
        v.setId(1);
        v.setName(name);
        v.setAvailable(true);
        v.setCityAvailable(city);
        v.setPostalCode("41001");
        v.setCoordinates("37.3886,-5.9823");
        v.setAddress("Calle Real, 123");
        v.setMaxGuests(maxGuests);
        v.setSurface(surface);
        v.setEarliestTime(LocalTime.of(9, 0));
        v.setLatestTime(LocalTime.of(23, 0));
        v.setServicePricePerGuest(BigDecimal.valueOf(20));
        v.setServicePricePerHour(BigDecimal.valueOf(50));
        v.setFixedPrice(BigDecimal.valueOf(500));
        v.setPicture("https://example.com/img.jpg");
        v.setDescription("Venue description");
        v.setLimitedByPricePerGuest(false);
        v.setLimitedByPricePerHour(false);
        return v;
    }

    @Test
    @WithMockUser
    void testGetFilteredVenues_noFilters() throws Exception {
        when(venueService.getFilteredVenues(null, null, null))
                .thenReturn(List.of(createVenue("Salón Real", "Sevilla", 100, 250)));

        mockMvc.perform(get("/api/venues/filter"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Salón Real")));
    }

    @Test
    @WithMockUser
    void testGetFilteredVenues_byCityAndCapacity() throws Exception {
        when(venueService.getFilteredVenues("Sevilla", 80, null))
                .thenReturn(List.of(createVenue("Azahares", "Sevilla", 80, 300)));

        mockMvc.perform(get("/api/venues/filter")
                        .param("city", "Sevilla")
                        .param("maxGuests", "80"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Azahares")))
                .andExpect(jsonPath("$[0].cityAvailable", is("Sevilla")))
                .andExpect(jsonPath("$[0].maxGuests", is(80)));
    }

    @Test
    @WithMockUser
    void testGetFilteredVenues_noMatch() throws Exception {
        when(venueService.getFilteredVenues("Madrid", 10, 1000.0))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/venues/filter")
                        .param("city", "Madrid")
                        .param("maxGuests", "10")
                        .param("surface", "1000.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    private Venue createVenue() {
        Venue venueToSave = new Venue();
        venueToSave.setName("Nuevo Venue");
        venueToSave.setAvailable(true);
        venueToSave.setCityAvailable("Sevilla");
        venueToSave.setServicePricePerGuest(new BigDecimal("25.00"));
        venueToSave.setServicePricePerHour(new BigDecimal("60.00"));
        venueToSave.setFixedPrice(new BigDecimal("700.00"));
        venueToSave.setPicture("https://example.com/venue.jpg");
        venueToSave.setDescription("Un gran espacio para eventos.");
        venueToSave.setLimitedByPricePerGuest(false);
        venueToSave.setLimitedByPricePerHour(false);
        venueToSave.setPostalCode("41001");
        venueToSave.setCoordinates("37.3886,-5.9823");
        venueToSave.setAddress("Calle Ejemplo 42");
        venueToSave.setMaxGuests(150);
        venueToSave.setSurface(300.0);
        venueToSave.setEarliestTime(LocalTime.of(10, 0));
        venueToSave.setLatestTime(LocalTime.of(22, 0));
        return venueToSave;
    }


    @Test
    @WithMockUser(username = "cliente", authorities = {"STUDENT"})
    void testCreateVenue_asStudent_returnsError() throws Exception {
        Venue venueToSave = createVenue();

        mockMvc.perform(post("/api/venues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(venueToSave)))
                .andExpect(status().isBadRequest())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof IllegalArgumentException))
                .andExpect(result -> assertEquals("No tienes permisos para crear este venue.",
                                                  result.getResolvedException().getMessage()));
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"ADMIN"})
    void testDeleteVenue_asAdmin_success() throws Exception {
        mockMvc.perform(delete("/api/venues/admin/1"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Deleted successfully")));
    }

    @Test
    @WithMockUser(username = "supplier", authorities = {"SUPPLIER"})
    void testDeleteVenue_asSupplier_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/venues/admin/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"ADMIN"})
    void shouldToggleAvailabilityAsAdminSuccessfully() throws Exception {
        Venue venue = createVenue();
        venue.setAvailable(true);

        when(venueService.getVenueById(1)).thenReturn(Optional.of(venue));
        when(eventPropertiesService.findAll()).thenReturn(List.of());

        mockMvc.perform(patch("/api/venues/disable/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @WithMockUser(username = "proveedor", authorities = {"SUPPLIER"})
    void shouldToggleAvailabilityAsOwnerSupplierSuccessfully() throws Exception {
        Venue venue = createVenue();
        
        User user = new User();
        user.setUsername("proveedor");
        venue.setUser(user);

        venue.setAvailable(false);

        when(venueService.getVenueById(1)).thenReturn(Optional.of(venue));
        when(eventPropertiesService.findAll()).thenReturn(List.of());

        mockMvc.perform(patch("/api/venues/disable/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @WithMockUser(username = "otroUsuario", authorities = {"SUPPLIER"})
    void shouldReturnForbiddenWhenUserIsNotOwnerOrAdmin() throws Exception {
        Venue venue = createVenue();
        
        User user = new User();
        user.setUsername("proveedor");
        venue.setUser(user);
        
        venue.setAvailable(true);

        when(venueService.getVenueById(1)).thenReturn(Optional.of(venue));
        when(eventPropertiesService.findAll()).thenReturn(List.of());

        mockMvc.perform(patch("/api/venues/disable/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("No tienes permisos para modificar este servicio"));
    }

    @Test
    @WithMockUser(username = "admin", authorities = {"ADMIN"})
    void shouldReturnNotFoundWhenVenueDoesNotExist() throws Exception {
        when(venueService.getVenueById(1)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/venues/disable/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Servicio no encontrado"));
    }

}
