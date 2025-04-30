package com.eventbride.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingDTO {

    @Min(0)
    @Max(5)
    private Double stars;

    @Size(max = 3000)
    private String comment;

    private LocalDateTime createdAt;

    private Integer userId;

    private Integer venueId;

    private Integer otherServiceId;
}