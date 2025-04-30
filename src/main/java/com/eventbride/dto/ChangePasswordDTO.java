package com.eventbride.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.eventbride.event.Event;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordDTO {
    String oldPassword;
    String newPassword;
}
