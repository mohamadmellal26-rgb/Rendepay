package com.rendepay.api.service;

import com.rendepay.api.entity.Card;
import com.rendepay.api.repository.CardRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CardService {

    private final CardRepository cardRepository;

    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    // المراجع والمالك ومدير الفرع والموظف يمكنهم الاطلاع
    @PreAuthorize("hasAnyRole('OWNER', 'BRANCH_MANAGER', 'TELLER', 'AUDITOR')")
    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    @PreAuthorize("hasAnyRole('OWNER', 'BRANCH_MANAGER', 'TELLER')")
    public Card createCard(Card card) {
        if (card.getBalance() == null) {
            card.setBalance(BigDecimal.ZERO);
        }
        return cardRepository.save(card);
    }

    // عملية الشحن تقتصر على المالك ومدير الفرع فقط (أو موظف الشباك وفق حدود محددة)
    @Transactional
    @PreAuthorize("hasAnyRole('OWNER', 'BRANCH_MANAGER')")
    public Card topUpBalance(Long cardId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("المبلغ يجب أن يكون أكبر من صفر");
        }

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("البطاقة رقم " + cardId + " غير موجودة"));

        card.setBalance(card.getBalance().add(amount));
        return cardRepository.save(card);
    }

    // عملية السحب متاحة لموظف الشباك والمدير والمالك
    @Transactional
    @PreAuthorize("hasAnyRole('OWNER', 'BRANCH_MANAGER', 'TELLER')")
    public Card withdrawBalance(Long cardId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("المبلغ يجب أن يكون أكبر من صفر");
        }

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("البطاقة رقم " + cardId + " غير موجودة"));

        if (card.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("الرصيد غير كافٍ");
        }

        card.setBalance(card.getBalance().subtract(amount));
        return cardRepository.save(card);
    }

    // التحويل بين الحسابات المالي
    @Transactional
    @PreAuthorize("hasAnyRole('OWNER', 'BRANCH_MANAGER', 'TELLER')")
    public void transferMoney(Long sourceCardId, String targetCardCode, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("المبلغ المراد تحويله يجب أن يكون أكبر من صفر");
        }

        Card sourceCard = cardRepository.findById(sourceCardId)
                .orElseThrow(() -> new IllegalArgumentException("بطاقة المرسل غير موجودة"));

        Card targetCard = cardRepository.findByCode(targetCardCode)
                .orElseThrow(() -> new IllegalArgumentException("بطاقة المستلم غير موجودة أو خاطئة"));

        if (sourceCard.getId().equals(targetCard.getId())) {
            throw new IllegalArgumentException("لا يمكنك التحويل لنفس البطاقة");
        }

        if (sourceCard.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("رصيدك غير كافٍ لإتمام عملية التحويل");
        }

        sourceCard.setBalance(sourceCard.getBalance().subtract(amount));
        targetCard.setBalance(targetCard.getBalance().add(amount));

        cardRepository.save(sourceCard);
        cardRepository.save(targetCard);
    }
}