package com.eventbride.tests.invitations;

import com.eventbride.event.Event;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event.EventRepository;
import com.eventbride.invitation.Invitation;
import com.eventbride.invitation.Invitation.InvitationType;
import com.eventbride.invitation.InvitationService;
import com.eventbride.invitation.InvitationRepository;
import com.eventbride.user.User;
import com.eventbride.venue.Venue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/* 
@ExtendWith(MockitoExtension.class)
public class InvitationUnitTest {

    @InjectMocks
    private InvitationService invitationService;

    @Mock
    private InvitationRepository invitationRepository;

    @Mock
    private EventRepository eventRepository;

    private User owner;
    private Event event;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1);

        event = new Event();
        event.setId(10);
        event.setUser(owner);

        EventProperties properties = new EventProperties();
        properties.setVenue(new Venue());

        event.setEventProperties(List.of(properties));
    }

    @Test
    void shouldCreateInvitationWhenUserOwnsEventAndHasVenue() {
        when(eventRepository.findById(10)).thenReturn(Optional.of(event));
        when(invitationRepository.save(any(Invitation.class))).thenAnswer(i -> i.getArguments()[0]);

        Invitation invitation = invitationService.createVoidInvitation(10, 5, owner);

        assertNotNull(invitation);
        assertEquals(5, invitation.getMaxGuests());
        assertEquals(event, invitation.getEvent());
        assertEquals(InvitationType.SENT, invitation.getInvitationType());
    }

    @Test
    void shouldThrowWhenEventHasNoVenue() {
        event.setEventProperties(List.of(new EventProperties())); // sin venue

        when(eventRepository.findById(10)).thenReturn(Optional.of(event));

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                invitationService.createVoidInvitation(10, 5, owner)
        );

        assertEquals("No se puede crear una invitación para un evento sin venue", exception.getMessage());
    }

    @Test
    void shouldThrowWhenUserDoesNotOwnEvent() {
        User intruder = new User();
        intruder.setId(999);

        when(eventRepository.findById(10)).thenReturn(Optional.of(event));

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                invitationService.createVoidInvitation(10, 5, intruder)
        );

        assertEquals("El evento no te pertenece", exception.getMessage());
    }

    @Test
    void shouldGetInvitationWithoutUserCheck() {
        Invitation invitation = new Invitation();
        invitation.setId(1);
        invitation.setEvent(event);

        when(invitationRepository.findById(1)).thenReturn(Optional.of(invitation));

        Invitation found = invitationService.getInvitationById(1);

        assertEquals(1, found.getId());
        assertEquals(event, found.getEvent());
    }

    @Test
    void shouldThrowWhenInvitationNotFound() {
        when(invitationRepository.findById(404)).thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                invitationService.getInvitationById(404)
        );

        assertEquals("La invitación no existe", exception.getMessage());
    }

}
*/
