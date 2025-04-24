package com.eventbride.dto.publics;

import java.math.BigDecimal;
import java.time.LocalDate;
//import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.eventbride.dto.OtherServiceDTO;
import com.eventbride.dto.VenueDTO;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventProperties.Status;
import com.eventbride.event_properties.EventPropertiesService;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventPropertiesPublicDTO {
    private Integer id;
    private Boolean approved;
    private LocalDate requestDate;
    private BigDecimal setPricePerService;
    private VenuePublicDTO venueDTO;
    private OtherServicePublicDTO otherServiceDTO;
    private Status status;
    private Double depositAmount;
    private BigDecimal pricePerService;
    private LocalTime startTime;
    private LocalTime finishTime;
    private EventPublicDTO eventDTO;


    // Constructor para simplificar la creación del DTO
    public EventPropertiesPublicDTO(EventProperties eventProperties, EventPublicDTO eventDTO) {
        this.id = eventProperties.getId();
        this.status = eventProperties.getStatus();
        this.requestDate = eventProperties.getStartTime().toLocalDate();
        this.startTime = eventProperties.getStartTime().toLocalTime();
        this.finishTime = eventProperties.getEndTime().toLocalTime();
        this.depositAmount = eventProperties.getDepositAmount();
        this.pricePerService = eventProperties.getPricePerService();
        this.setPricePerService = eventProperties.getPricePerService();

        if (eventProperties.getVenue() != null) {
            this.venueDTO = new VenuePublicDTO(eventProperties.getVenue());
        }

        if (eventProperties.getOtherService() != null) {
            this.otherServiceDTO = new OtherServicePublicDTO(eventProperties.getOtherService());
        }

        this.eventDTO = eventDTO;
    }

}