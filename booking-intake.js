(() => {
  const el = id => document.getElementById(id);
  const form = document.querySelector('[data-step="2"]');
  if (!el('bookingIntake') || !form) return;
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Africa/Johannesburg',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const birthParts = value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').map(Number) : null;
  const isMinor = value => {
    const birth = birthParts(value), now = birthParts(today);
    if (!birth || !now || value > today) return false;
    return now[0]-birth[0]-(now[1]<birth[1] || (now[1]===birth[1] && now[2]<birth[2]) ? 1 : 0) < 18;
  };
  document.querySelectorAll('[data-birth-date]').forEach(input => { input.max = today; input.min = '1900-01-01'; });
  const group = (id, active) => {
    const box = el(id); box.hidden = !active;
    box.querySelectorAll('input,select').forEach(input => { input.disabled = !active; });
  };
  const requiresGuardian = () => el('sessionType').value==='child' || isMinor(el('patientDob').value) || el('includesMinor').checked;
  const sync = () => {
    const medical = ['medical','reclaim'].includes(el('paymentArrangement').value);
    const minor = requiresGuardian();
    group('medicalAidFields',medical);
    group('parentalFields',minor);
    group('secondGuardianFields',minor && el('secondGuardianRequired').checked);
    group('sponsorFields',el('thirdPartySponsor').checked);
    el('sponsorLetter').required = el('thirdPartySponsor').checked;
    el('claimCodeNotice').hidden = !medical || el('claimCodePermission').value!=='no';
    if (el('payButton')) el('payButton').textContent = el('paymentArrangement').value==='medical' ? 'Try Medical-aid Request Preview' : 'Try Payment Preview';
    if (el('intakeReview')) el('intakeReview').textContent = `Required client and payment consents completed${minor ? '; guardian consent included' : ''}. ${medical ? 'Medical-aid details supplied. Cover is subject to practice and scheme review.' : 'Private payment selected.'} Nothing has been submitted or booked.`;
  };
  const invalidate = () => {
    document.querySelectorAll('#bookingIntake input[type="checkbox"][required]').forEach(input => { input.checked=false; });
    el('bookingAcknowledgement').checked=false;
    el('paymentStatus').hidden=true; el('paymentRecovery').hidden=true; el('payButton').disabled=false;
    window.bookingIntake.record=null;
  };
  const validate = () => {
    sync(); el('intakeError').hidden=true;
    let invalid = [...form.querySelectorAll('input,select')].find(input => !input.disabled && (!input.checkValidity() || (input.required && input.type!=='checkbox' && !input.value.trim())));
    if (invalid) {
      el('intakeError').textContent='Please complete the required fields and consent checkboxes before continuing.';
      el('intakeError').hidden=false; invalid.focus(); invalid.reportValidity(); return false;
    }
    if (el('paymentArrangement').value==='medical' && el('claimCodePermission').value==='no') {
      el('intakeError').textContent='Without permission for the required claim code, select private payment or discuss funding with the practice.';
      el('intakeError').hidden=false; el('paymentArrangement').focus(); return false;
    }
    if (el('thirdPartySponsor').checked) {
      const file=el('sponsorLetter').files[0];
      if (!file || !/\.pdf$/i.test(file.name) || file.size>10*1024*1024) {
        el('intakeError').textContent='Select a signed sponsor letter as a PDF smaller than 10 MB. It stays on this page in the preview.';
        el('intakeError').hidden=false; el('sponsorLetter').focus(); return false;
      }
    }
    return true;
  };
  window.bookingIntake = {
    sync, validate, record:null,
    directMedicalAid: () => el('paymentArrangement').value==='medical',
    capture: () => {
      if (!validate()) return null;
      const consents=[...document.querySelectorAll('#bookingIntake input[type="checkbox"][required]')].filter(input=>!input.disabled).map(input=>({id:input.id,accepted:input.checked,wording:input.closest('label').innerText}));
      const details=Object.fromEntries([...el('bookingIntake').querySelectorAll('input,select')].filter(input=>!input.disabled&&input.type!=='file').map(input=>[input.id,input.type==='checkbox'?input.checked:input.value]));
      const record={preview:true,documentVersion:'2026-10-12-supplied-pdfs',acceptedAt:new Date().toISOString(),clientName:el('clientName').value,appointment:{session:el('sessionType').value,format:document.querySelector('input[name="format"]:checked')?.value,date:document.querySelector('#dateStrip [aria-pressed="true"]')?.getAttribute('aria-label'),time:document.querySelector('#timeGrid [aria-pressed="true"]')?.textContent},details,consents};
      window.bookingIntake.record=record;
      return record;
    }
  };
  form.querySelectorAll('input,select').forEach(input => {
    input.addEventListener('input', () => {
      if (!input.matches('input[type="checkbox"][required]')) invalidate();
      else {el('bookingAcknowledgement').checked=false;window.bookingIntake.record=null;}
      sync();
    });
    input.addEventListener('change',sync);
  });
  el('sessionType').addEventListener('change',()=>{invalidate();sync();});
  document.querySelectorAll('input[name="format"]').forEach(input=>input.addEventListener('change',invalidate));
  document.querySelector('[data-step="1"]').addEventListener('click',event=>{if(event.target.closest('#dateStrip button,#timeGrid button,[role="checkbox"]')) invalidate();});
  sync();
})();

