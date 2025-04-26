package com.eventbride.payment;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eventbride.event.Event;
import com.eventbride.event.EventRepository;
import com.eventbride.event_properties.EventProperties;
import com.eventbride.event_properties.EventPropertiesRepository;
import com.eventbride.notification.NotificationService;
import com.eventbride.notification.Notification.NotificationType;
import com.eventbride.event_properties.EventProperties.Status;
import com.eventbride.payment.Payment.PaymentType;
import com.eventbride.user.User;
import com.eventbride.user.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class PaymentService {
    private PaymentRepository paymentRepository;
    private EventPropertiesRepository eventPropertiesRepository;
    private UserRepository userRepository;
    private NotificationService notificationService;
    private EventRepository eventRepository;
    private Double commissionRate = 0.05;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository, EventPropertiesRepository eventPropertiesRepository,
            UserRepository userRepository, NotificationService notificationService, EventRepository eventRepository) {
        this.paymentRepository = paymentRepository;
        this.eventPropertiesRepository = eventPropertiesRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.eventRepository = eventRepository;
    }

    private boolean isAuthorizedForPayment(Integer userId, Integer eventPropertiesId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        if ("ADMIN".equals(user.getRole())) {
            return true;
        }

        Optional<Event> eventOpt = eventRepository.findByEventPropertiesId(eventPropertiesId);
        if (!eventOpt.isPresent()) {
            return false;
        }

        Event event = eventOpt.get();

        return event.getUser() != null && event.getUser().getId().equals(userId);
    }

    @Transactional
    public Payment payDeposit(Integer eventPropertiesId, Integer userId) {
        if (!isAuthorizedForPayment(userId, eventPropertiesId)) {
            throw new RuntimeException("El usuario no está autorizado para realizar este pago");
        }

        EventProperties e = eventPropertiesRepository.findById(eventPropertiesId).orElse(null);
        Payment p;
        Payment c;

        if (e != null) {
            e.setStatus(Status.DEPOSIT_PAID);
            eventPropertiesRepository.save(e);

            p = new Payment();

            p.setAmount(e.getDepositAmount());
            p.setDateTime(LocalDateTime.now());
            p.setPaymentType(PaymentType.DEPOSIT);
            p.setEventProperties(e);
            User user = userRepository.findById(userId).orElse(null);

            // Creación de comisión
            c = new Payment();
            c.setAmount(e.getDepositAmount() * commissionRate);
            c.setDateTime(LocalDateTime.now());
            c.setPaymentType(PaymentType.COMMISSION);
            c.setEventProperties(e);

            if (user == null)
                return null;

            p.setUser(user);
            c.setUser(user);

            paymentRepository.save(p);
            paymentRepository.save(c);
            Optional<Event> event = eventRepository.findByEventPropertiesId(e.getId());
            notificationService.createNotification(NotificationType.NEW_DEPOSIT_PAYMENT,
                    e.getVenue() != null ? e.getVenue().getUser() : e.getOtherService().getUser(), event.get(), e,
                    null);
        } else {
            p = null;
        }
        return p;
    }

    @Transactional
    public Payment payRemaining(Integer eventPropertiesId, Integer userId) {
        if (!isAuthorizedForPayment(userId, eventPropertiesId)) {
            throw new RuntimeException("El usuario no está autorizado para realizar este pago");
        }

        EventProperties e = eventPropertiesRepository.findById(eventPropertiesId).orElse(null);
        Payment p;
        Payment c;

        Double precioTotal = e.getPricePerService().doubleValue();
        Double precioRemaining = precioTotal - e.getDepositAmount();
        Double comision = precioRemaining * commissionRate;

        Payment depositPayment = paymentRepository.filterByEventPropertiesId(eventPropertiesId);

        if (depositPayment != null && e != null) {
            e.setStatus(Status.COMPLETED);
            eventPropertiesRepository.save(e);

            // Payment de usuario cliente
            p = new Payment();

            p.setAmount(precioRemaining);
            p.setDateTime(LocalDateTime.now());
            p.setPaymentType(PaymentType.REMAINING);
            p.setEventProperties(e);
            User user = userRepository.findById(userId).orElse(null);

            // Payment de comisión
            c = new Payment();

            c.setAmount(comision);
            c.setDateTime(LocalDateTime.now());
            c.setPaymentType(PaymentType.COMMISSION);
            c.setEventProperties(e);

            if (user == null)
                return null;

            p.setUser(user);
            c.setUser(user);
            paymentRepository.save(p);
            paymentRepository.save(c);
            Optional<Event> event = eventRepository.findByEventPropertiesId(e.getId());
            notificationService.createNotification(NotificationType.NEW_REMAINING_PAYMENT,
                    e.getVenue() != null ? e.getVenue().getUser() : e.getOtherService().getUser(), event.get(), e,
                    null);
        } else {
            p = null;
        }
        return p;
    }

    @Transactional
    public Payment payPlan(Integer userId, Double amount) {
        Payment p = new Payment();

        p.setAmount(amount);
        p.setDateTime(LocalDateTime.now());
        p.setPaymentType(PaymentType.PLAN);
        p.setUser(userRepository.findById(userId).get());
        paymentRepository.save(p);
        return p;
    }

    @Transactional
    public List<Payment> getPaymentsFromEventId(Integer eventId) {
        List<Payment> payments = paymentRepository.findPaymentsByEventId(eventId);
        return payments;
    }

    public List<Payment> getPaymentsForProvider(Integer providerUserId) {
        List<Payment> payments = paymentRepository.findPaymentsByProviderUserId(providerUserId);
        if (payments.isEmpty()) {
            throw new RuntimeException("No se han encontrado pagos para el proveedor con ID: " + providerUserId);
        }
        return payments;
    }

    @Transactional
    public void deletePayments(List<Payment> payments) {
        paymentRepository.deleteAll(payments);
    }

}