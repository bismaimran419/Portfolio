/* ================================================================
   BISMA — CS PORTFOLIO  |  script.js
   Handles: sticky navbar, hamburger menu, active nav link
            highlighting, scroll reveal, contact form, footer year
================================================================ */

'use strict';

/* ----------------------------------------------------------------
   DOM REFERENCES
   Cache all needed elements once on load to avoid repeated queries
---------------------------------------------------------------- */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('nav-links');
const allNavLinks = navLinks ? navLinks.querySelectorAll('a') : [];
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');
const yearSpan    = document.getElementById('year');


/* ----------------------------------------------------------------
   FOOTER YEAR
   Dynamically insert the current year so it never goes stale
---------------------------------------------------------------- */
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}


/* ----------------------------------------------------------------
   STICKY NAVBAR — shadow on scroll
   Adds the .scrolled class when the page scrolls past 10px
---------------------------------------------------------------- */
function handleNavScroll() {
  if (navbar) {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run once on load in case page loads mid-scroll


/* ----------------------------------------------------------------
   HAMBURGER MENU (mobile)
   Toggles the .open class on both the button and the nav-links
   Also updates aria-expanded for accessibility
---------------------------------------------------------------- */
function toggleMenu() {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
}

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

if (hamburger && navLinks) {
  hamburger.addEventListener('click', toggleMenu);

  // Close menu when any nav link is clicked (mobile smooth scroll)
  allNavLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (navbar && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
}


/* ----------------------------------------------------------------
   ACTIVE NAV LINK HIGHLIGHTING
   Uses IntersectionObserver to detect which section is on screen
   and marks the matching nav link as .active
---------------------------------------------------------------- */
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && navLinks) {
        // Remove active from all links
        allNavLinks.forEach(link => link.classList.remove('active'));

        // Add active to the matching link
        const activeLink = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  },
  {
    rootMargin: '-50% 0px -50% 0px', // trigger when section is in the middle of viewport
    threshold: 0
  }
);

sections.forEach(section => sectionObserver.observe(section));


/* ----------------------------------------------------------------
   SCROLL REVEAL ANIMATION
   Fades elements in as they enter the viewport.
---------------------------------------------------------------- */
const revealTargets = document.querySelectorAll(
  '.skill-card, .project-card, .cert-card, .about-grid, .contact-grid, .edu-card, .about-stats'
);

// Apply initial hidden state via JS so that non-JS users still see content
revealTargets.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
});

const revealObserver = new IntersectionObserver(
  function (entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children)
          : [];
        const order = siblings.indexOf(entry.target);
        const delay = Math.min(order * 60, 300); // cap at 300ms

        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);

        observer.unobserve(entry.target); // animate once only
      }
    });
  },
  { threshold: 0.12 }
);

revealTargets.forEach(el => revealObserver.observe(el));


/* ----------------------------------------------------------------
   SMOOTH SCROLL POLYFILL
---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ----------------------------------------------------------------
   CERTIFICATION IMAGE MODAL DIALOG LOGIC
---------------------------------------------------------------- */
const certModal = document.getElementById('cert-modal');
const modalImg  = document.getElementById('modal-img');
const viewLinks = document.querySelectorAll('.cert-link');
const closeBtn  = document.querySelector('.modal-close');
const overlay   = document.querySelector('.modal-overlay');

if (certModal && modalImg) {
  
  // Open Modal Function
  viewLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const imgPath = this.getAttribute('data-cert-img');
      
      if (imgPath) {
        modalImg.src = imgPath;
        certModal.classList.add('open');
        certModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close Modal Function
  function closeModal() {
    certModal.classList.remove('open');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { modalImg.src = ''; }, 300);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && certModal.classList.contains('open')) {
      closeModal();
    }
  });
}


/* ----------------------------------------------------------------
   CONTACT FORM — Clean API Submission via Formspree (No Duplicate Blocks)
---------------------------------------------------------------- */
if (contactForm && formStatus) {

  contactForm.addEventListener('submit', function (e) {
    // 1. Browser default refresh block karo
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.form-btn');
    const originalBtnText = submitBtn.innerHTML;

    // 2. Values extract karo
    const name    = contactForm.name.value.trim();
    const email   = contactForm.email.value.trim();
    const subject = contactForm.subject.value.trim();
    const message = contactForm.message.value.trim();

    // 3. Simple Validation Check
    if (!name || !email || !subject || !message) {
      showFormStatus('Please fill in all fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormStatus('Please enter a valid email address.', 'error');
      return;
    }

    // 4. Set loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    // 5. Submit to Formspree API endpoint
    fetch('https://formspree.io/f/mnjyoewk', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      body: JSON.stringify({ 
        name: name, 
        email: email, 
        subject: subject, 
        message: message 
      })
    })
    .then(response => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      if (response.ok) {
        showFormStatus('Message sent successfully! I will get back to you soon.', 'success');
        contactForm.reset(); // Sirf success pe form khali hoga
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            showFormStatus(data['errors'].map(error => error['message']).join(', '), 'error');
          } else {
            showFormStatus('Oops! There was a problem submitting your form.', 'error');
          }
        });
      }
    })
    .catch(error => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      showFormStatus('Oops! Network error. Please check your connection or try again later.', 'error');
    });
  });
}

/**
 * Display a status message below the form
 */
function showFormStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = 'form-status ' + type;

  setTimeout(() => {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  }, 5000);
}


/* ----------------------------------------------------------------
   HERO TERMINAL ANIMATION
---------------------------------------------------------------- */
const termBody = document.getElementById('term-body');

if (termBody) {
  const floatTags = termBody.querySelector('.floating-tags');
  const codeLines = [
    `<span class="c-comment">// bisma_portfolio.cpp</span>`,
    `<span class="c-keyword">#include</span> <span class="c-str">&lt;iostream&gt;</span>`,
    `<span class="c-keyword">#include</span> <span class="c-str">&lt;string&gt;</span>`,
    ``,
    `<span class="c-keyword">class</span> <span class="c-fn">Developer</span> <span class="c-punc">{</span>`,
    `  <span class="c-keyword">public</span><span class="c-punc">:</span>`,
    `    <span class="c-var">string</span> name <span class="c-punc">=</span> <span class="c-str">"Bisma Imran"</span><span class="c-punc">;</span>`,
    `    <span class="c-var">string</span> degree <span class="c-punc">=</span> <span class="c-str">"BS CS"</span><span class="c-punc">;</span>`,
    `    <span class="c-var">bool</span> passionate <span class="c-punc">=</span> <span class="c-keyword">true</span><span class="c-punc">;</span>`,
    ``,
    `    <span class="c-fn">void</span> <span class="c-fn">greet</span><span class="c-punc">() {</span>`,
    `      cout <span class="c-punc">&lt;&lt;</span> <span class="c-str">"Hello, World!"</span><span class="c-punc">;</span>`,
    `    <span class="c-punc">}</span>`,
    `<span class="c-punc">};</span>`,
  ];

  let idx = 0;

  function showLine() {
    if (idx >= codeLines.length) {
      setTimeout(() => {
        termBody.querySelectorAll('.code-line').forEach(l => {
          l.style.opacity = '0';
          l.style.transform = 'translateY(4px)';
        });
        setTimeout(() => {
          termBody.querySelectorAll('.code-line').forEach(l => l.remove());
          idx = 0;
          setTimeout(showLine, 400);
        }, 700);
      }, 3500);
      return;
    }

    const prev = termBody.querySelector('.cursor');
    if (prev) prev.remove();

    const div = document.createElement('div');
    div.className = 'code-line';
    div.innerHTML = codeLines[idx] === '' ? '&nbsp;' : codeLines[idx];

    const cur = document.createElement('span');
    cur.className = 'cursor';
    div.appendChild(cur);

    termBody.insertBefore(div, floatTags);
    requestAnimationFrame(() => requestAnimationFrame(() => div.classList.add('visible')));

    idx++;
    setTimeout(showLine, codeLines[idx - 1] === '' ? 120 : 180 + Math.random() * 120);
  }

  setTimeout(showLine, 600);
}