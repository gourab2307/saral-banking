
export const paymentConfig = {
  demoPin: '1234',

  // All monetary values are stored as integer paise.
  maxPaymentPaise: 100000000, // ₹10,00,000
  newPayeeLimitPaise: 1000000, // ₹10,000
  youngAccountApprovalThresholdPaise: 200000, // ₹2,000
  youngAccountDailyLimitPaise: 500000, // ₹5,000 daily spending limit

  // Safety checks
  requireSafetyAcknowledgement: true,
  requireIndependentVerificationForNewPayee: true,
}
