package com.schedulix.faculty_coordination.controller;

import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.service.RazorpayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@PreAuthorize("hasRole('ROLE_PRINCIPAL')") // Principal ONLY can pay
public class PaymentController {

    @Autowired
    private RazorpayService razorpayService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data, @AuthenticationPrincipal User currentUser) {
        try {
            int amount = (Integer) data.get("amount");
            String planTier = (String) data.get("planTier");

            if (currentUser.getCollegeId() == null) {
                return ResponseEntity.badRequest().body("Platform Owners cannot purchase plans. Please login as a College Principal.");
            }

            String orderJson = razorpayService.createOrder(currentUser.getCollegeId(), amount, planTier);
            return ResponseEntity.ok(orderJson);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload, @AuthenticationPrincipal User currentUser) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");
        String planTier = payload.get("planTier");

        boolean isValid = razorpayService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isValid) {
            razorpayService.activateSubscription(currentUser.getCollegeId(), planTier);
            return ResponseEntity.ok("Payment verified and subscription activated successfully!");
        } else {
            return ResponseEntity.badRequest().body("Invalid payment signature.");
        }
    }
}
