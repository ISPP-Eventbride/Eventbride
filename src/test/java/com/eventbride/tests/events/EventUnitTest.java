package com.eventbride.tests.events;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import com.eventbride.event.Event;
import com.eventbride.event.Event.EventType;
import com.eventbride.notification.NotificationRepository;
import com.eventbride.notification.NotificationService;
import com.eventbride.event.EventRepository;
import com.eventbride.event.EventService;
import com.eventbride.user.User;
import com.eventbride.user.User.Plan;
import com.fasterxml.jackson.databind.introspect.TypeResolutionContext.Empty;

import org.checkerframework.checker.units.qual.C;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;

@ExtendWith(MockitoExtension.class)
public class EventUnitTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EventService eventService;

    private Event event;
    private User user;

    // #region Constructor
    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setFirstName("Juan");
        user.setLastName("Pérez");
        user.setUsername("juanp");
        user.setEmail("juan@example.com");
        user.setTelephone(723456789);
        user.setPassword("securePassword");
        user.setDni("12345678Z");
        user.setRole("CLIENT");
        user.setPlan(Plan.PREMIUM);
        user.setPaymentPlanDate(LocalDate.now());
        user.setExpirePlanDate(LocalDate.now().plusMonths(1));
        user.setReceivesEmails(true);
        user.setProfilePicture("https://example.com/pic.jpg");

        event = new Event();
        event.setId(1);
        event.setEventType(EventType.WEDDING);
        event.setGuests(100);
        event.setEventDate(LocalDate.now().plusMonths(6));
        event.setUser(user);
        event.setConfirmedGuests(66);
        event.setPaid(false);
        event.setName("Boda de Juan");

    }
    // #endregion

    // #region Positivos
    @Test
    void shouldSetAndGetFieldsCorrectly() {
        assertEquals(EventType.WEDDING, event.getEventType());
        assertEquals(100, event.getGuests());
        assertEquals(LocalDate.now().plusMonths(6), event.getEventDate());
        assertEquals(user, event.getUser());
        assertEquals(66, event.getConfirmedGuests());
        assertFalse(event.getPaid());
        assertEquals("Boda de Juan", event.getName());
    }
    // #endregion

    // #region Negativos
    @Test
    void shouldFailWhenEventNameIsEmpty() {
        event.setName("   ");
        assertTrue(event.getName().trim().isEmpty(), "El nombre del evento está vacío o solo contiene espacios");
    }

    @Test
    void shouldFailWhenGuestCountIsNegative() {
        event.setGuests(-5);
        assertTrue(event.getGuests() < 0, "El número de invitados no puede ser negativo");
    }

    @Test
    void shouldFailWhenEventDateIsInPast() {
        event.setEventDate(LocalDate.now().minusDays(1));
        assertTrue(event.getEventDate().isBefore(LocalDate.now()), "La fecha del evento no puede ser en el pasado");
    }
    // #endregion

    // #region Servicio

    // 1. getAllEvents
    @Test
    void shouldReturnAllEvents() {
        when(eventRepository.findAll()).thenReturn(List.of(event));
        List<Event> result = eventService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void shouldReturnEmptyListWhenNoEventsExist() {
        when(eventRepository.findAll()).thenReturn(Collections.emptyList());
        List<Event> result = eventService.findAll();

        assertTrue(result.isEmpty());
    }

    // 2. getEventById
    @Test
    void shouldReturnEventById() {
        when(eventRepository.findById(1)).thenReturn(Optional.of(event));
        Event result = eventService.findById(1);

        assertEquals(event, result);
    }

    @Test
    void shouldReturnEmptyWhenEventNotFound() {
        when(eventRepository.findById(99)).thenReturn(Optional.empty());
        IllegalArgumentException thrown = assertThrows(
                IllegalArgumentException.class,
                () -> eventService.findById(99),
                "Se esperaba que findById lanzara IllegalArgumentException");

        assertEquals("El evento no existe", thrown.getMessage());
    }

    // 3. saveEvent
    @Test
    void shouldSaveEvent() {
        when(eventRepository.save(event)).thenReturn(event);
        Event saved = eventService.save(event);

        assertEquals("Boda de Juan", saved.getName());
    }

    // 4. updateEvent
    @Test
    void shouldUpdateEvent() {
        Event updatedEvent = new Event();
        updatedEvent.setName("Evento Actualizado");
        updatedEvent.setEventType(EventType.CHRISTENING);
        updatedEvent.setGuests(50);
        updatedEvent.setEventDate(LocalDate.now().plusMonths(3));
        updatedEvent.setPaid(true);

        when(eventRepository.findById(1)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0));

        Event result = eventService.updateEvent(updatedEvent, 1);

        assertEquals("Evento Actualizado", result.getName());
        assertEquals(EventType.CHRISTENING, result.getEventType());
        assertEquals(50, result.getGuests());
        assertTrue(result.getPaid());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistentEvent() {
        when(eventRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> eventService.updateEvent(event, 999));
    }

    // 5. deleteEvent
    @Test
    void shouldDeleteEventById() {
        when(eventRepository.findById(1)).thenReturn(Optional.of(event));
        eventService.deleteEvent(1);
        verify(eventRepository).delete(event);
    }

    // 6. getRecentEventByUserId
    @Test
    void getRecentEventByUserId() {
        when(eventRepository.findRecentEventByUserId(1)).thenReturn(Optional.of(event));
        Optional<Event> result = eventService.getRecentEventByUserId(1);

        assertTrue(result.isPresent());
    }

    @Test
    void shouldReturnEmptyWhenEventNotFoundByUserId() {
        when(eventRepository.findRecentEventByUserId(99)).thenReturn(Optional.empty());
        Optional<Event> result = eventService.getRecentEventByUserId(99);

        assertTrue(result.isEmpty());
    }

    // 7. getRecentEventByUserId
    @Test
    void findEventsByUserId() {
        when(eventRepository.findAllEventsByUserId(1)).thenReturn(List.of(event));
        List<Event> result = eventService.findEventsByUserId(1);

        assertEquals(1, result.size());    
    }

    @Test
    void shouldReturnEmptyWhenEventsNotFoundByUserId() {
        when(eventRepository.findAllEventsByUserId(99)).thenReturn(List.of());
        List<Event> result = eventService.findEventsByUserId(99);

        assertEquals(0, result.size());    
    }

}
