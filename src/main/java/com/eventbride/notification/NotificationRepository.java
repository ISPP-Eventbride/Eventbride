package com.eventbride.notification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserId(Integer userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.createdAt >= :timeLimit AND n.type = 'NEW_MESSAGE'")
    List<Notification> findRecentNewMessageNotificationsByUserId(Integer userId, LocalDateTime timeLimit);

    
}
