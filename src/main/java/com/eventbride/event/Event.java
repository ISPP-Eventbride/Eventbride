package com.eventbride.event;

import java.time.LocalDate;
import java.util.List;

import com.eventbride.event_properties.EventProperties;
import com.eventbride.model.BaseEntity;
import com.eventbride.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "events")
@Getter
@Setter

public class Event extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "guests", nullable = false)
    @Min(1)
    private Integer guests;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    public enum EventType {
        WEDDING,
        CHRISTENING,
        COMMUNION
    }

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id")
    private List<EventProperties> eventProperties;

    @Column(name = "payment_date", nullable = true)
    private LocalDate paymentDate;

/*
    public LocalDate getPaymentDate() {
        if (eventType == EventType.WEDDING) {
            return eventDate.minusMonths(3);
        } else if (eventType == EventType.CHRISTENING) {
            return eventDate.minusMonths(0);
        } else {
            return eventDate.minusMonths(2);
        }
    }
*/
    @Column(name = "confirmed_guests", nullable = true)
    private Integer confirmedGuests;

    @Column(name = "paid", nullable = true)
    private Boolean paid;

    @Column(name = "name", nullable = false)
    @NotBlank
    @Size(min = 1, max = 50)
    private String name;
}
