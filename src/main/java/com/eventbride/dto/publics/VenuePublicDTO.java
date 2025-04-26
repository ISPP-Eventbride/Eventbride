package com.eventbride.dto.publics;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

import com.eventbride.venue.Venue;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VenuePublicDTO {
	private Integer id;
    private String name;
    private Boolean available;
    private String cityAvailable;
    private BigDecimal servicePricePerGuest;
    private BigDecimal servicePricePerHour;
    private BigDecimal fixedPrice;
    private String picture;
    private String description;
    private Boolean limitedByPricePerGuest;
    private Boolean limitedByPricePerHour;
    private String postalCode;
    private String coordinates;
    private String address;
    private int maxGuests;
    private double surface;
    private LocalTime earliestTime;
    private LocalTime latestTime;
    private UserPublicDTO userDTO;



    // Constructor para simplificar la creación del DTO
    public VenuePublicDTO(Venue venue) {
		this.id = venue.getId();
        this.name = venue.getName();
        this.available = venue.getAvailable();
        this.cityAvailable = venue.getCityAvailable();
        this.servicePricePerGuest = venue.getServicePricePerGuest();
        this.servicePricePerHour = venue.getServicePricePerHour();
        this.fixedPrice = venue.getFixedPrice();
        this.picture = venue.getPicture();
        this.description = venue.getDescription();
        this.limitedByPricePerGuest = venue.getLimitedByPricePerGuest();
        this.limitedByPricePerHour = venue.getLimitedByPricePerHour();
        this.postalCode = venue.getPostalCode();
        this.coordinates = venue.getCoordinates();
        this.address = venue.getAddress();
        this.maxGuests = venue.getMaxGuests();
        this.surface = venue.getSurface();
        this.earliestTime = venue.getEarliestTime();
        this.latestTime = venue.getLatestTime();
        if(venue.getUser() != null){
            this.userDTO = new UserPublicDTO(venue.getUser());
        }
    }

    // Método estático para crear una lista de DTOs a partir de una lista de entidades
    public static List<VenuePublicDTO> fromEntities(List<Venue> venues) {
        return venues.stream()
                .map(VenuePublicDTO::new)
                .toList();
    }
}
