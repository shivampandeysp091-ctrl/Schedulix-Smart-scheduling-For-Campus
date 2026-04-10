package com.schedulix.faculty_coordination.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.schedulix.faculty_coordination.model.CollegeAccount;
import com.schedulix.faculty_coordination.repository.CollegeAccountRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id:YOUR_RAZORPAY_KEY}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:YOUR_RAZORPAY_SECRET}")
    private String razorpayKeySecret;

    @Autowired
    private CollegeAccountRepository collegeAccountRepository;

    public String createOrder(UUID collegeId, int amountInRupees, String planTier) throws RazorpayException {
        collegeAccountRepository.findById(collegeId)
                .orElseThrow(() -> new RuntimeException("College account not found"));

        if ("rzp_test_placeholder_key".equals(razorpayKeyId) || razorpayKeyId == null || razorpayKeyId.contains("YOUR_RAZORPAY_KEY")) {
             System.out.println("⚠️ MOCK PAYMENT MODE: Skipping actual Razorpay order creation due to placeholder keys.");
             JSONObject mock = new JSONObject();
             mock.put("id", "mock_order_" + UUID.randomUUID().toString());
             mock.put("amount", amountInRupees * 100);
             return mock.toString();
        }

        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInRupees * 100); // Amount in paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + collegeId.toString().substring(0, 8));
        
        JSONObject notes = new JSONObject();
        notes.put("collegeId", collegeId.toString());
        notes.put("planTier", planTier);
        orderRequest.put("notes", notes);

        Order order = razorpay.orders.create(orderRequest);
        return order.toString();
    }

    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if ("rzp_test_placeholder_key".equals(razorpayKeyId) || razorpayKeyId == null || razorpayKeyId.contains("YOUR_RAZORPAY_KEY")) {
             return "mock_signature_789".equals(signature);
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);
            return com.razorpay.Utils.verifyPaymentSignature(options, razorpayKeySecret);
        } catch (Exception e) {
            return false;
        }
    }

    public void activateSubscription(UUID collegeId, String planTier) {
        CollegeAccount college = collegeAccountRepository.findById(collegeId)
                .orElseThrow(() -> new RuntimeException("College account not found"));

        college.setPlanTier(planTier);
        college.setPaymentStatus("active");
        college.setStatus("active");
        
        // Setup standard limits based on plan
        if ("institution_plan".equals(planTier)) {
            college.setMaxAdmins(10);
            college.setMaxFaculty(100);
            college.setMaxStudents(5000);
        } else if ("department_pro".equals(planTier)) {
            college.setMaxAdmins(5);
            college.setMaxFaculty(30);
            college.setMaxStudents(800);
        } else {
            college.setMaxAdmins(3);
            college.setMaxFaculty(30);
            college.setMaxStudents(500);
        }

        collegeAccountRepository.save(college);
    }
}
