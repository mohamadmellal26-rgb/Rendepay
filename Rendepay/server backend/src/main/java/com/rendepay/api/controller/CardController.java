package com.rendepay.api.controller;

import com.rendepay.api.entity.Card;
import com.rendepay.api.service.CardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    // جلب كل البطاقات
    @GetMapping
    public ResponseEntity<List<Card>> getAllCards() {
        return ResponseEntity.ok(cardService.getAllCards());
    }

    // إنشاء بطاقة جديدة
    @PostMapping
    public ResponseEntity<Card> createCard(@RequestBody Card card) {
        return ResponseEntity.ok(cardService.createCard(card));
    }

    // شحن / إضافة رصيد للبطاقة (محمي عبر Spring Security)
    // PUT: /api/cards/1/top-up
    // Body: { "amount": 50.00 }
    @PutMapping("/{id}/top-up")
    public ResponseEntity<?> topUp(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            if (!request.containsKey("amount")) {
                return ResponseEntity.badRequest().body(Map.of("error", "يرجى تحديد المبلغ (amount)"));
            }

            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            // تم تعديل الاستدعاء لتمرير Baremters اثنين فقط وتجريده من الـ SecretKey
            Card updatedCard = cardService.topUpBalance(id, amount);
            return ResponseEntity.ok(updatedCard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // سحب / خصم رصيد من البطاقة
    // PUT: /api/cards/1/withdraw
    // Body: { "amount": 20.00 }
    @PutMapping("/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            if (!request.containsKey("amount")) {
                return ResponseEntity.badRequest().body(Map.of("error", "يرجى تحديد المبلغ (amount)"));
            }

            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            Card updatedCard = cardService.withdrawBalance(id, amount);
            return ResponseEntity.ok(updatedCard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // تحويل أموال بين بطاقتين
    // POST: /api/cards/transfer
    // Body: { "sourceCardId": 1, "targetCardCode": "12345678", "amount": 50.00 }
    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(@RequestBody Map<String, Object> request) {
        try {
            if (!request.containsKey("sourceCardId") || !request.containsKey("targetCardCode") || !request.containsKey("amount")) {
                return ResponseEntity.badRequest().body(Map.of("error", "بيانات التحويل غير مكتملة"));
            }

            Long sourceCardId = Long.valueOf(request.get("sourceCardId").toString());
            String targetCardCode = request.get("targetCardCode").toString();
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            cardService.transferMoney(sourceCardId, targetCardCode, amount);
            return ResponseEntity.ok(Map.of("message", "تم تحويل الأموال بنجاح"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}