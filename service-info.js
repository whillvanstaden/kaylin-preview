(() => {
  const descriptions = {
    crisis: {
      title: 'Crisis & Trauma Counselling',
      paragraphs: [
        'Support following distressing events or during periods of emotional crisis, with space to talk about your experience and its impact on everyday life.',
        'Counselling focuses on understanding your needs, developing practical coping strategies and identifying sources of support. Screening and referral for specialised care are provided where appropriate.',
        'This service is not an emergency response service. If there is immediate danger, contact emergency services or go to the nearest emergency department.'
      ]
    },
    grief: {
      title: 'Grief Counselling',
      paragraphs: [
        'A supportive space to explore the emotions and changes that can follow bereavement or other significant losses.',
        'Counselling helps you make sense of your experience, consider ways to cope and adjust to life after loss at your own pace. There is no single right way to grieve.'
      ]
    },
    couples: {
      title: 'Couples Counselling',
      paragraphs: [
        'Navigating the complexities of the heart can be a difficult task, as romantic partners face an overabundance of challenges daily.',
        'Couples counselling offers a space to explore relationship concerns, improve communication and work towards a fulfilling, mutually beneficial relationship. Sessions can support couples who are experiencing difficulties or who want to maintain a healthy relationship.'
      ]
    },
    family: {
      title: 'Family Counselling',
      paragraphs: [
        'Family counselling aims to strengthen the family unit.',
        'Promoting understanding, healing, and cooperation within the family, this intervention helps each family member to cope with challenges, improve interactions, and develop healthier relationships.',
        'Sessions provide space to discuss shared concerns and explore practical ways to support one another through family changes and everyday difficulties.'
      ]
    },
    maintenance: {
      title: 'Maintenance Counselling',
      paragraphs: [
        'Maintenance Counselling centers around maintaining a healthy psychosocial well-being through life’s challenges, no matter how big or small they might feel.',
        'This treatment can be utilized after dealing with major challenges to provide the needed support to sustain positive changes, prevent relapses, and to continue building on progress.',
        'It can further be used as a preventative measure by teaching skills that will assist in dealing with or averting dilemmas the future might hold.'
      ]
    },
    psychometric: {
      title: 'Psychometric Testing',
      paragraphs: [
        'To help you unlock your true potential, counsellors can perform tests that measure various aspects of an individual’s psychological functioning, behavior, personality, and cognitive abilities.',
        'These tools provide evidence-based insights that can help guide clients towards better self-awareness and informed decisions.',
        'Assessments are offered where appropriate and within the professional scope and competencies of an HPCSA-registered counsellor. The purpose, suitability and fees are discussed before an assessment, with referral where needed.'
      ]
    },
    workshops: {
      title: 'Workshops',
      paragraphs: [
        'Counselling can also take the form of interactive and focused events that are designed to educate, train, or develop skills in specific areas.',
        'During these events, attendees are supported and guided through structured activities, discussions, and exercises that focus on self-improvement and education across a wide range of psychological topics.'
      ]
    },
    organizational: {
      title: 'Organizational Counselling',
      paragraphs: [
        'Organizational counselling is a specialized form of counselling that focuses on addressing the psychological, emotional, and interpersonal challenges faced by individuals within the workplace or organizational setting.',
        'The primary goal is to enhance employee well-being, productivity, and organizational harmony by resolving personal and professional issues.'
      ]
    }
  };
  const dialog = document.getElementById('serviceInfoDialog');
  if (!dialog) return;
  const title = document.getElementById('serviceInfoTitle');
  const body = document.getElementById('serviceInfoBody');
  const image = document.getElementById('serviceInfoImage');
  document.querySelectorAll('[data-service-info]').forEach(button => {
    const openService = () => {
      if (dialog.open) return;
      if (button.dataset.serviceInfo === 'hpcsa') {
        title.textContent = 'Understanding HPCSA registration';
        image.hidden = true;
        image.removeAttribute('src');
        body.replaceChildren(document.getElementById('registrationInfoContent').content.cloneNode(true));
        dialog.showModal();
        return;
      }
      const service = descriptions[button.dataset.serviceInfo];
      if (!service) return;
      title.textContent = service.title;
      image.hidden = false;
      image.src = `assets/services/${button.dataset.serviceInfo}.png`;
      body.replaceChildren(...service.paragraphs.map(text => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      }));
      dialog.showModal();
    };
    button.addEventListener('click', openService);

  });
  dialog.querySelector('.service-info-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
})();
