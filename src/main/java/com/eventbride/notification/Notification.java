package com.eventbride.notification;

import java.time.LocalDateTime;

import com.eventbride.model.BaseEntity;
import com.eventbride.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum NotificationType {
        REQUEST_CANCELLED_PROVIDER,
        REQUEST_CANCELLED_AUTO,
        EVENT_CREATED,
        PAYMENT_REMINDER,
        NEW_MESSAGE,
        REQUEST_CONFIRMED,
        NEW_REQUEST,
        NEW_DEPOSIT_PAYMENT,
        NEW_REMAINING_PAYMENT,
        EVENT_DELETED,
        INVITATION_CONFIRMED,
        INVITATION_DELETED,
        PLAN_EXPIRED,
        PLAN_UPGRADED,
        EVENTPROPERTIES_DELETED
    }
}
