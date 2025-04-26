package com.eventbride.payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventbride.dto.PaymentDTO;
import com.eventbride.dto.ServiceDTO;
import com.eventbride.event_properties.EventPropertiesService;
import com.eventbride.model.MessageResponse;
import com.eventbride.service.ServiceService;
import com.eventbride.user.User;
import com.eventbride.user.UserService;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserService userService;

    @Autowired
    private ServiceService serviceService;

    @Autowired
    private EventPropertiesService evebEventPropertiesService;

    @GetMapping("/{eventId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsFromEventId(@PathVariable Integer eventId) {
        List<Payment> payments = paymentService.getPaymentsFromEventId(eventId);
        List<PaymentDTO> dtos = PaymentDTO.fromEntities(payments);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{eventPropertiesId}/pay-deposit/{userId}")
    public ResponseEntity<?> createPaymentDeposit(@PathVariable Integer eventPropertiesId,
            @PathVariable Integer userId) {
        try {
            Payment newPayment = paymentService.payDeposit(eventPropertiesId, userId);
            return ResponseEntity.ok(newPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{eventPropertiesId}/pay-remaining/{userId}")
    public ResponseEntity<?> createPaymentRemaining(@PathVariable Integer eventPropertiesId,
            @PathVariable Integer userId) {
        try {
            Payment newPayment = paymentService.payRemaining(eventPropertiesId, userId);
            return ResponseEntity.ok(newPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/plan/{userId}")
    public ResponseEntity<?> createPaymentPlan(@PathVariable Integer userId, @RequestBody @Valid Double amount) {
        try {
            Payment newPayment = paymentService.payPlan(userId, amount);
            return ResponseEntity.ok(newPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/provider/{userId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsForProvider(@PathVariable Integer userId) {
        try {
            List<Payment> payments = paymentService.getPaymentsForProvider(userId);
            return ResponseEntity.ok(PaymentDTO.fromEntities(payments));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/withdraw/{userId}")
    public ResponseEntity<?> withdrawPayments(@PathVariable Integer userId) throws IllegalArgumentException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> user = userService.getUserByUsername(auth.getName());

        if (!user.isPresent()) {
            throw new IllegalArgumentException("El usuario no existe");
        }

        if (!user.get().getRole().equals("SUPPLIER")) {
            throw new IllegalArgumentException("El usuario debe ser proovedor para poder realizar esta acción");
        }

        List<Payment> providerPayments = paymentService.getPaymentsForProvider(userId);

        if (providerPayments.isEmpty()) {
            throw new IllegalArgumentException("El proovedor debe tener payments asociados para realizar esta acción");
        }

        paymentService.deletePayments(providerPayments);

        return new ResponseEntity<>(new MessageResponse("Se han retirado correctamente los fondos"), HttpStatus.OK);
    }

}