// Unpublished product slots, deliberately without invented details or prices.
export const resourceSlots = [1, 2, 3].map(slot => ({
  slot, id: null, image: null, title: null, audience: null, description: null,
  included: [], priceCents: null, approved: false, fileKey: null
}));
// TODO: Replace with approved product data. Keep purchases separate from bookings.
