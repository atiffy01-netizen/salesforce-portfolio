/* Portfolio interactive engine */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const navbar = $('#navbar');
  const navBurger = $('#navBurger');
  const mobileOverlay = $('#mobileOverlay');
  const mobileMenu = $('#mobileMenu');
  const mobileClose = $('#mobileClose');
  const scrollTopBtn = $('#scrollTop');
  const progressBar = $('#scrollProgressBar');
  const typedEl = $('#typedText');
  const contactForm = $('#contactForm');
  const formSuccess = $('#formSuccess');
  const formError = $('#formError');
  const formErrorText = $('#formErrorText');
  const yearEl = $('#year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const sections = $$('section[id]');
  const navLinks = $$('.nav__link[data-section]');

  const raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (cb) => setTimeout(cb, 16);

  let scrollTicking = false;
  let lastScrollY = window.scrollY;
  let lastActiveId = '';
  let scrollHeight = 1;
  let resizeTimer = null;

  function measureScrollHeight() {
    scrollHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  }

  function setActiveLink(id) {
    if (!id || id === lastActiveId || !navLinks.length) return;
    lastActiveId = id;
    for (let i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.toggle('active', navLinks[i].dataset.section === id);
    }
  }

  function applyScrollState() {
    scrollTicking = false;
    const scrollY = lastScrollY;

    if (navbar) navbar.classList.toggle('scrolled', scrollY > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', scrollY > 500);
    if (progressBar) {
      const progress = Math.min((scrollY / scrollHeight) * 100, 100);
      progressBar.style.width = progress + '%';
    }
  }

  function onScroll() {
    lastScrollY = window.scrollY;
    if (scrollTicking) return;
    scrollTicking = true;
    raf(applyScrollState);
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measureScrollHeight();
      onScroll();
    }, 150);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', () => {
    measureScrollHeight();
    onScroll();
  }, { once: true });

  measureScrollHeight();
  applyScrollState();

  if (sections.length && navLinks.length) {
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) setActiveLink(entries[i].target.id);
        }
      }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 });
      sections.forEach((section) => sectionObserver.observe(section));
    } else {
      setActiveLink(sections[0].id);
    }
  }

  function openMenu() {
    if (mobileMenu) mobileMenu.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    if (navBurger) navBurger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    if (navBurger) navBurger.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (navBurger) {
    navBurger.addEventListener('click', () => {
      if (mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
  $$('.mobile-menu__link, .mobile-menu__cta').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const serviceModal = $('#serviceModal');
  const serviceModalTitle = $('#serviceModalTitle');
  const serviceModalDesc = $('#serviceModalDesc');
  const serviceModalIcon = $('#serviceModalIcon');
  let serviceTrigger = null;

  function openServiceModal(button) {
    const card = button.closest('.service-card');
    if (!card || !serviceModal) return;
    const title = card.querySelector('h4');
    const desc = card.querySelector('p');
    const icon = card.querySelector('.service-card__icon');
    if (serviceModalTitle) serviceModalTitle.textContent = title ? title.textContent : '';
    if (serviceModalDesc) serviceModalDesc.textContent = desc ? desc.textContent : '';
    if (serviceModalIcon) serviceModalIcon.innerHTML = icon ? icon.innerHTML : '';
    serviceTrigger = button;
    serviceModal.classList.add('open');
    serviceModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = serviceModal.querySelector('.service-modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeServiceModal(restoreFocus) {
    if (!serviceModal || !serviceModal.classList.contains('open')) return;
    serviceModal.classList.remove('open');
    serviceModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (restoreFocus && serviceTrigger) serviceTrigger.focus();
    serviceTrigger = null;
  }

  $$('[data-service-detail]').forEach((button) => {
    button.addEventListener('click', () => openServiceModal(button));
  });

  if (serviceModal) {
    $$('[data-service-close]', serviceModal).forEach((el) => {
      el.addEventListener('click', () => closeServiceModal(el.tagName !== 'A'));
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeServiceModal(true);
  });

  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const revealElements = $$('[data-reveal]');
  if (reduceMotion) {
    revealElements.forEach((el) => el.classList.add('revealed'));
  } else if (revealElements.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('revealed');
            revealObserver.unobserve(entries[i].target);
          }
        }
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      revealElements.forEach((el) => revealObserver.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('revealed'));
    }
  }

  if (typedEl) {
    const words = ['Salesforce CRMs', 'Modern Web Applications', 'Apex Automations', 'AI Workflows'];
    if (reduceMotion) {
      typedEl.textContent = words[0];
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;
      const TYPE_SPEED = 80;
      const DELETE_SPEED = 40;
      const PAUSE = 2000;

      function typeWrite() {
        const current = words[wordIndex];
        if (!isDeleting) {
          charIndex++;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            isDeleting = true;
            setTimeout(typeWrite, PAUSE);
            return;
          }
          setTimeout(typeWrite, TYPE_SPEED);
        } else {
          charIndex--;
          typedEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typeWrite, 400);
            return;
          }
          setTimeout(typeWrite, DELETE_SPEED);
        }
      }
      setTimeout(typeWrite, 1000);
    }
  }

  const counters = $$('.counter');
  const counterDone = new WeakSet();

  function setCounterFinal(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    el.textContent = el.dataset.format === 'comma' ? target.toLocaleString('en-US') : String(target);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1500;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = el.dataset.format === 'comma' ? value.toLocaleString('en-US') : String(value);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (reduceMotion) {
    counters.forEach(setCounterFinal);
  } else if (counters.length) {
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting && !counterDone.has(entries[i].target)) {
            counterDone.add(entries[i].target);
            animateCounter(entries[i].target);
            counterObserver.unobserve(entries[i].target);
          }
        }
      }, { threshold: 0.5 });
      counters.forEach((el) => counterObserver.observe(el));
    } else {
      counters.forEach(setCounterFinal);
    }
  }

  const skillFills = $$('.skill-card__fill');
  const skillsGrid = $('.skills__grid');
  const skillDone = new WeakSet();

  function skillTarget(fill) {
    const label = fill.parentElement ? fill.parentElement.nextElementSibling : null;
    const shown = label ? parseFloat(label.textContent) : NaN;
    const stored = parseFloat(fill.dataset.level);
    const value = Number.isFinite(shown) ? shown : (Number.isFinite(stored) ? stored : 0);
    return Math.min(Math.max(value, 0), 100);
  }

  function setSkillFinal(fill) {
    const target = skillTarget(fill);
    fill.dataset.level = target;
    fill.style.width = target + '%';
  }

  function animateSkillFill(fill) {
    const target = skillTarget(fill);
    fill.dataset.level = target;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      fill.style.width = (eased * target) + '%';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (reduceMotion) {
    skillFills.forEach(setSkillFinal);
  } else if (skillsGrid && skillFills.length) {
    if ('IntersectionObserver' in window) {
      let triggered = false;
      const skillObserver = new IntersectionObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting || triggered) continue;
          triggered = true;
          skillObserver.disconnect();
          skillFills.forEach((fill, idx) => {
            if (skillDone.has(fill)) return;
            skillDone.add(fill);
            fill.dataset.level = skillTarget(fill);
            fill.style.width = '0%';
            setTimeout(() => animateSkillFill(fill), idx * 60);
          });
        }
      }, { threshold: 0.15 });
      skillObserver.observe(skillsGrid);
    } else {
      skillFills.forEach(setSkillFinal);
    }
  }

  if (contactForm) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const requiredFields = ['name', 'email', 'subject', 'message'];

    function showFormError(message) {
      if (formSuccess) formSuccess.classList.remove('show');
      if (formErrorText) formErrorText.textContent = message;
      if (formError) formError.classList.add('show');
    }

    function clearFormMessage() {
      if (formError) formError.classList.remove('show');
      if (formSuccess) formSuccess.classList.remove('show');
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (!btn || btn.disabled) return;

      clearFormMessage();

      for (let i = 0; i < requiredFields.length; i++) {
        const field = contactForm.elements[requiredFields[i]];
        if (!field || !field.value.trim()) {
          showFormError('Please fill in all required fields before sending.');
          if (field) field.focus();
          return;
        }
      }

      const emailField = contactForm.elements.email;
      if (!emailPattern.test(emailField.value.trim())) {
        showFormError('Please enter a valid email address.');
        emailField.focus();
        return;
      }

      const label = btn.querySelector('span');
      const icon = btn.querySelector('i');
      const originalLabel = label ? label.textContent : '';
      const originalIcon = icon ? icon.className : '';

      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if (label) label.textContent = 'Sending...';
      if (icon) icon.className = 'fa-solid fa-spinner fa-spin';

      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.ok === false) throw new Error('Submission failed');

        contactForm.reset();
        if (formSuccess) {
          formSuccess.classList.add('show');
          setTimeout(() => formSuccess.classList.remove('show'), 6000);
        }
      } catch (err) {
        showFormError('Your message could not be sent. Please try again.');
      } finally {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        if (label) label.textContent = originalLabel;
        if (icon) icon.className = originalIcon;
      }
    });
  }
})();
