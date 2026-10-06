import { BookingPaymentService, PreviewPaymentGateway } from './payments.js';
const $ = selector => document.querySelector(selector);
const menuToggle = $('.menu-toggle'), nav = $('.primary-nav');
function closeMenu() {
  nav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false');
  $('.menu-toggle .sr-only').textContent = 'Open navigation';
}
menuToggle.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') closeMenu();
  else { nav.classList.add('is-open'); menuToggle.setAttribute('aria-expanded', 'true'); $('.menu-toggle .sr-only').textContent = 'Close navigation'; }
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menuToggle.focus(); }
});
$('#year').textContent = new Date().getFullYear();
const sessions = {
  individual: { title: 'Individual Counselling', fee: 'R600' },
  couples: { title: 'Couples / Family Counselling', fee: 'R650' },
  child: { title: 'Children / Teenagers', fee: 'R600' }
};
const booking = { step: 1, format: '', session: '', date: '', time: '' };
const panels = [...document.querySelectorAll('.booking-panel')];
const progress = [...document.querySelectorAll('.booking-progress li')];
const paymentService = new BookingPaymentService(new PreviewPaymentGateway());
// TODO: Replace preview availability with server-backed availability and temporary slot holds.
const formatDate = new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' });
const shortDay = new Intl.DateTimeFormat('en-ZA', { weekday: 'short', timeZone: 'Africa/Johannesburg' });
const shortMonth = new Intl.DateTimeFormat('en-ZA', { month: 'short', timeZone: 'Africa/Johannesburg' });
const todayParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
const part = type => todayParts.find(p => p.type === type).value;
const today = new Date(`${part('year')}-${part('month')}-${part('day')}T10:00:00Z`);
const saturdayAnchor = Date.UTC(2026, 9, 10, 10);
function summaryRows() {
  return [['Session', sessions[booking.session]?.title], ['Format', booking.format], ['Date', booking.date], ['Time', booking.time ? `${booking.time} SAST` : ''], ['Duration', booking.session ? '45–60 minutes' : ''], ['Fee', sessions[booking.session]?.fee]].filter(([,value]) => value);
}
function fillSummary(target) {
  target.replaceChildren();
  summaryRows().forEach(([label,value]) => {
    const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label; dd.textContent = value; row.append(dt, dd); target.append(row);
  });
}
function updateSummary() {
  $('#bookingSummary').hidden = (!booking.format && !booking.session) || booking.step === 3;
  fillSummary($('#summaryDetails')); fillSummary($('#reviewSummary'));
}
function invalidateAcknowledgement() {
  $('#bookingAcknowledgement').checked = false; $('#paymentStatus').hidden = true;
  $('#paymentRecovery').hidden = true; $('#payButton').disabled = false;
}
function showStep(step) {
  booking.step = step;
  panels.forEach(panel => { panel.hidden = Number(panel.dataset.step) !== step; });
  progress.forEach((item,i) => {
    item.classList.toggle('is-active', i + 1 === step); item.classList.toggle('is-complete', i + 1 < step);
    if (i + 1 === step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
  });
  updateSummary(); $(`#step${step}-title`).focus();
}
document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => showStep(booking.step - 1)));
document.querySelectorAll('input[name="format"]').forEach(input => input.addEventListener('change', () => { booking.format = input.value; invalidateAcknowledgement(); updateSummary(); }));
$('#sessionType').addEventListener('change', event => { booking.session = event.target.value; invalidateAcknowledgement(); updateSummary(); });
for (let offset=1, count=0; count<12; offset++) {
  const date = new Date(today); date.setUTCDate(date.getUTCDate()+offset); const day = date.getUTCDay();
  if (day === 0) continue;
  const openSaturday = ((Math.round((date - saturdayAnchor) / 86400000) % 14) + 14) % 14 === 0;
  const unavailable = day === 1 || (day === 6 && !openSaturday);
  const button = document.createElement('button'); button.type = 'button'; button.className = 'date-button'; button.disabled = unavailable;
  button.setAttribute('aria-label', `${formatDate.format(date)} — ${unavailable ? (day===1 ? 'booked' : 'closed') : 'available'}`); button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `<span>${shortDay.format(date)}</span><strong>${date.getUTCDate()}</strong><small>${unavailable ? (day===1 ? 'Booked' : 'Closed') : shortMonth.format(date)}</small>`;
  button.addEventListener('click', () => {
    $('#dateStrip').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    booking.date = formatDate.format(date); booking.time = ''; invalidateAcknowledgement(); updateSummary(); makeTimes(day===6);
  });
  $('#dateStrip').append(button); count++;
}
function makeTimes(saturday) {
  $('#timeGrid').replaceChildren();
  (saturday ? ['09:00','10:00','11:00','12:00'] : ['09:00','10:30','12:00','14:00','15:30','17:00','18:00']).forEach(time => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'time-button'; button.textContent = time; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      $('#timeGrid').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b===button)));
      booking.time = time; invalidateAcknowledgement(); updateSummary();
    }); $('#timeGrid').append(button);
  });
}
panels[0].addEventListener('submit', event => {
  event.preventDefault();
  const missing = [!booking.format && 'format', !booking.session && 'session type', !booking.date && 'date', !booking.time && 'time'].filter(Boolean);
  $('#appointmentError').hidden = !missing.length;
  if (missing.length) { $('#appointmentError').textContent = `Please choose your ${missing.join(', ')}.`; return; } showStep(2);
});
const fields = ['clientName','clientPhone','clientEmail'];
function validateDetails() {
  const phone = $('#clientPhone').value.replace(/[\s()-]/g,'');
  const valid = [Boolean($('#clientName').value.trim()), /^(?:0[6-8]\d{8}|\+27[6-8]\d{8})$/.test(phone), Boolean($('#clientEmail').value.trim()) && $('#clientEmail').validity.valid];
  const messages = ['Enter your full name.', 'Enter a South African mobile number, for example 076 764 6013 or +27 76 764 6013.', 'Enter a valid email address.'];
  fields.forEach((id,i) => { $(`#${id}`).setAttribute('aria-invalid', String(!valid[i])); $(`#${id}Error`).hidden = valid[i]; $(`#${id}Error`).textContent = valid[i] ? '' : messages[i]; });
  $('#detailsError').hidden = valid.every(Boolean); return valid;
}
panels[1].addEventListener('submit', event => {
  event.preventDefault(); const valid = validateDetails();
  if (valid.every(Boolean)) showStep(3); else $(`#${fields[valid.indexOf(false)]}`).focus();
});
fields.forEach(id => $(`#${id}`).addEventListener('input', () => { invalidateAcknowledgement(); if ($(`#${id}`).getAttribute('aria-invalid') === 'true') validateDetails(); }));
$('#bookingAcknowledgement').addEventListener('change', () => { $('#consentError').hidden = true; });
const paymentModal = $('#paymentModal');
function openPaymentPreview() {
  $('#consentError').hidden = $('#bookingAcknowledgement').checked;
  if (!$('#bookingAcknowledgement').checked) { $('#bookingAcknowledgement').focus(); return; } paymentModal.showModal();
}
function showPaymentResult(result) {
  const messages = {
    success: 'Payment preview complete. No payment was taken and no appointment has been confirmed. Contact the practice to arrange a real appointment.',
    failed: 'Payment was not completed. Your appointment has not been confirmed. Your selections are kept here so you can try again.',
    cancelled: 'Payment was cancelled. Your appointment has not been confirmed. Your selections are kept here.'
  };
  $('#paymentStatus').textContent = messages[result.status] || 'Payment could not be completed. Your appointment has not been confirmed.';
  $('#paymentStatus').hidden = false; $('#paymentRecovery').hidden = result.status === 'success'; $('#payButton').disabled = result.status === 'success';
}
$('#payButton').addEventListener('click', openPaymentPreview); $('#retryPayment').addEventListener('click', openPaymentPreview);
$('#returnToBooking').addEventListener('click', () => showStep(1));
$('#closePayment').addEventListener('click', () => paymentModal.close('cancelled'));
paymentModal.addEventListener('click', event => { if (event.target === paymentModal) paymentModal.close('cancelled'); });
paymentModal.addEventListener('cancel', event => { event.preventDefault(); paymentModal.close('cancelled'); });
paymentModal.addEventListener('close', () => { if (paymentModal.returnValue !== 'handled') showPaymentResult({ status: 'cancelled' }); });
document.querySelectorAll('[data-preview-outcome]').forEach(button => button.addEventListener('click', async () => {
  const result = await paymentService.pay({ ...booking }, button.dataset.previewOutcome); paymentModal.close('handled');
  // Unverified preview results never confirm a booking.
  showPaymentResult(result);
}));
const sticky = $('.mobile-book'); let bookingVisible = false, heroActionVisible = false;
const syncSticky = () => {
  const keyboard = window.visualViewport && window.visualViewport.height < window.innerHeight * .75;
  sticky.classList.toggle('is-hidden', bookingVisible || heroActionVisible || Boolean(keyboard));
};
new IntersectionObserver(entries => { bookingVisible = entries[0].isIntersecting; syncSticky(); }, { threshold: 0 }).observe($('#booking'));
new IntersectionObserver(entries => { heroActionVisible = entries[0].isIntersecting; syncSticky(); }, { threshold: 0 }).observe($('.hero-actions'));
window.visualViewport?.addEventListener('resize', syncSticky);
window.addEventListener('resize', () => { if (window.innerWidth>1100) closeMenu(); });
updateSummary();
