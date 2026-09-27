package com.rendepay.api.repository;

import com.rendepay.api.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    
    // دالة أساسية للبحث عن البطاقة باستخدام كود البطاقة الفريد (تستخدم في التحويل المالي عبر NFC أو الكود)
    Optional<Card> findByCode(String code);
}