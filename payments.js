/** Provider-neutral boundary. A browser redirect never confirms an appointment. */
export class PreviewPaymentGateway {
  async checkout(transaction, outcome) {
    return { status: outcome, mode: 'preview', transactionType: transaction.type, verified: false };
  }
}
export class UnconfiguredPaymentGateway {
  async checkout() { throw new Error('Online payment is not available. Please contact the practice.'); }
}
export class BookingPaymentService {
  constructor(gateway) { this.gateway = gateway; }
  async pay(appointment, outcome) {
    if (!appointment.format || !appointment.session || !appointment.date || !appointment.time) throw new Error('Please complete your appointment details.');
    return this.gateway.checkout({ type: 'booking', appointment }, outcome);
  }
}
export class ResourcePaymentService {
  constructor(gateway) { this.gateway = gateway; }
  async purchase(resource) {
    if (!resource.approved || !resource.id || !Number.isInteger(resource.priceCents) || resource.priceCents <= 0) throw new Error('This resource is not yet available to purchase.');
    return this.gateway.checkout({ type: 'resource', resourceId: resource.id });
  }
}
// TODO: Connect production payment gateway through a server adapter, never browser credentials.
// Create checkout from trusted fees/products and temporarily hold the available slot.
// Verify signed webhooks, amount, ZAR currency, transaction ID and status on the server.
// Confirm/reserve appointments and send confirmations idempotently only after verification.
// Browser redirects and preview results must never confirm. Failed/cancelled checkout releases
// the hold; retries reuse the transaction safely. Resource orders never consume appointments.
// TODO: Approved product database, private files, secure signed digital delivery/access control,
// receipt/confirmation email and server ownership verification before download access.
