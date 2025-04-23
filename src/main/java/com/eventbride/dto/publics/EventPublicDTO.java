package com.eventbride.dto.publics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.eventbride.dto.EventPropertiesDTO;
import com.eventbride.event.Event;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventPublicDTO {
    private Integer id;
    private Event.EventType eventType;
    private Integer guests;
    private LocalDate eventDate;
    private List<EventPropertiesPublicDTO> eventPropertiesDTO;
    private String UserEmail;
    private String name;

    // Constructor para simplificar la creación del DTO
    public EventPublicDTO(Event event, List<EventPropertiesPublicDTO> evenPropDTO) {
        this.id = event.getId();
        this.eventType = event.getEventType();
        this.guests = event.getGuests();
        this.eventDate = event.getEventDate();
        this.eventPropertiesDTO = evenPropDTO;
        this.UserEmail = event.getUser().getEmail();
        this.name = event.getName();
    }
}
