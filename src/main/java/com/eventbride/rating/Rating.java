package com.eventbride.rating;

import com.eventbride.user.User;
import com.eventbride.venue.Venue;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

import com.eventbride.model.BaseEntity;
import com.eventbride.otherService.OtherService;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "ratings")
public class Rating extends BaseEntity {

    @Column(name = "stars", nullable = false)
    @Min(0)
    @Max(5)
    private Double stars;

    @Column(name = "comment", length = 5000)
    @Size(max = 3000)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "other_service_id")
    private OtherService otherService;
}