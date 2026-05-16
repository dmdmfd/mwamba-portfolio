/* =====================================================
   PARTICLE BACKGROUND CANVAS
   ===================================================== */
(function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function createParticles() {
        const count = Math.min(Math.floor((W * H) / 14000), 90);
        particles = Array.from({ length: count }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r:  Math.random() * 1.8 + 0.5,
            a:  Math.random() * 0.5 + 0.1,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(56,189,248,${0.07 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw dots + cursor repulsion
        particles.forEach(p => {
            if (window._cx !== undefined) {
                const dx = p.x - window._cx;
                const dy = p.y - window._cy;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 110 && d > 0) {
                    const force = (110 - d) / 110 * 0.55;
                    p.vx += (dx / d) * force;
                    p.vy += (dy / d) * force;
                    const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    if (spd > 1.8) { p.vx = (p.vx / spd) * 1.8; p.vy = (p.vy / spd) * 1.8; }
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56,189,248,${p.a})`;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });

        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
})();

/* =====================================================
   NAVBAR — scroll + mobile toggle
   ===================================================== */
(function initNav() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    if (toggle) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('nav-open');
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(s => observer.observe(s));

    // Close mobile nav on link click
    links.forEach(a => {
        a.addEventListener('click', () => navbar.classList.remove('nav-open'));
    });
})();

/* =====================================================
   TYPING ANIMATION
   ===================================================== */
(function initTyping() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = [
        'mobile apps.',
        'secure systems.',
        'Flutter experiences.',
        'clean code.',
        'solutions that matter.',
    ];

    let phraseIndex = 0, charIndex = 0, deleting = false;

    function type() {
        const current = phrases[phraseIndex];
        el.textContent = deleting
            ? current.slice(0, charIndex - 1)
            : current.slice(0, charIndex + 1);

        if (!deleting) {
            charIndex++;
            if (charIndex === current.length) { deleting = true; setTimeout(type, 1800); return; }
        } else {
            charIndex--;
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, 400);
                return;
            }
        }

        setTimeout(type, deleting ? 45 : 80);
    }

    setTimeout(type, 1000);
})();

/* =====================================================
   SKILL BAR ANIMATION + PERCENTAGE COUNTER
   ===================================================== */
(function initSkillBars() {
    const fills = document.querySelectorAll('.bar-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill   = entry.target;
                const target = parseInt(fill.dataset.width || '0');
                fill.style.width = target + '%';

                const pctEl = fill.closest('.skill-row')?.querySelector('.skill-pct');
                if (pctEl) {
                    let current  = 0;
                    const frames = 60;
                    const inc    = target / frames;
                    const timer  = setInterval(() => {
                        current = Math.min(current + inc, target);
                        pctEl.textContent = Math.round(current) + '%';
                        if (current >= target) clearInterval(timer);
                    }, 1200 / frames);
                }

                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.2 });

    fills.forEach(f => observer.observe(f));
})();

/* =====================================================
   SCROLL REVEAL
   ===================================================== */
(function initReveal() {
    const targets = document.querySelectorAll(
        '.section-title, .section-tag, .skill-card, .project-card, .tl-item, .cert-card, .about-grid, .contact-grid, .hero-badge, .hero-name, .hero-subtitle, .hero-desc, .hero-cta, .hero-socials, .hero-visual'
    );

    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
})();

/* =====================================================
   CUSTOM GLOWING CURSOR
   ===================================================== */
(function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    document.body.classList.add('has-custom-cursor');

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    }, { passive: true });

    (function animateCursor() {
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateCursor);
    })();

    document.querySelectorAll('a, button, .project-card, .skill-card, .cert-card, .contact-link').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width       = '44px';
            ring.style.height      = '44px';
            ring.style.borderColor = 'rgba(56,189,248,0.85)';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width       = '28px';
            ring.style.height      = '28px';
            ring.style.borderColor = 'rgba(56,189,248,0.5)';
        });
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    });
})();

/* =====================================================
   BACK TO TOP
   ===================================================== */
(function initBackTop() {
    const btn = document.getElementById('back-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* =====================================================
   CURSOR POSITION — shared with particle repulsion
   ===================================================== */
document.addEventListener('mousemove', (e) => {
    window._cx = e.clientX;
    window._cy = e.clientY;
}, { passive: true });

/* =====================================================
   HERO NAME TEXT SCRAMBLE
   ===================================================== */
(function initTextScramble() {
    const el = document.querySelector('.hero-name');
    if (!el) return;

    const chars     = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const firstNode = Array.from(el.childNodes).find(n => n.nodeType === 3);
    const accentEl  = el.querySelector('.accent');
    const firstName = 'Mwamba ';
    const lastName  = 'Mulenga';
    let frame = 0;
    const total = 28;

    function tick() {
        const progress = frame / total;
        frame++;

        if (firstNode) {
            let s = '';
            for (let i = 0; i < firstName.length; i++) {
                if (firstName[i] === ' ') { s += ' '; continue; }
                s += Math.random() < progress
                    ? firstName[i]
                    : chars[Math.floor(Math.random() * chars.length)];
            }
            firstNode.textContent = s;
        }
        if (accentEl) {
            let s = '';
            for (let i = 0; i < lastName.length; i++) {
                s += Math.random() < progress
                    ? lastName[i]
                    : chars[Math.floor(Math.random() * chars.length)];
            }
            accentEl.textContent = s;
        }

        if (frame <= total) {
            setTimeout(tick, 38);
        } else {
            if (firstNode) firstNode.textContent = firstName;
            if (accentEl)  accentEl.textContent  = lastName;
        }
    }

    setTimeout(tick, 700);
})();

/* =====================================================
   HERO STATS COUNT-UP
   ===================================================== */
(function initHeroStats() {
    const defs = [
        { target: 2,  suffix: '+' },
        { target: 8,  suffix: '+' },
        { target: 10, suffix: '+' },
    ];
    const els = document.querySelectorAll('#hero .stat-n');

    els.forEach((el, i) => {
        const { target, suffix } = defs[i] || {};
        if (target == null) return;
        el.textContent = '0' + suffix;
        setTimeout(() => {
            let cur = 0;
            const frames = 45;
            const timer = setInterval(() => {
                cur = Math.min(cur + target / frames, target);
                el.textContent = Math.round(cur) + suffix;
                if (cur >= target) clearInterval(timer);
            }, 1400 / frames);
        }, 900 + i * 200);
    });
})();

/* =====================================================
   3D CARD TILT
   ===================================================== */
(function initTiltCards() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.project-card, .skill-card, .cert-card, .tl-content').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'box-shadow 0.25s ease';
        });
        card.addEventListener('mousemove', (e) => {
            const r  = card.getBoundingClientRect();
            const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -7;
            const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  7;
            card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
            card.style.boxShadow = `${-ry * 1.8}px ${rx * 1.8}px 36px rgba(56,189,248,0.2)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.6s ease';
            card.style.transform  = '';
            card.style.boxShadow  = '';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
    });
})();

/* =====================================================
   MAGNETIC BUTTONS
   ===================================================== */
(function initMagneticBtns() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.hero-cta .btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width  / 2)) * 0.28;
            const y = (e.clientY - (r.top  + r.height / 2)) * 0.28;
            btn.style.transform  = `translate(${x}px, ${y}px)`;
            btn.style.transition = 'transform 0.08s ease';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform  = '';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, box-shadow 0.3s ease';
            setTimeout(() => { btn.style.transition = ''; }, 500);
        });
    });
})();

/* =====================================================
   TIMELINE LINE DRAW ON SCROLL
   ===================================================== */
(function initTimelineDraw() {
    const tl = document.querySelector('.timeline');
    if (!tl) return;

    const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            tl.classList.add('tl-animated');
            obs.disconnect();
        }
    }, { threshold: 0.05 });

    obs.observe(tl);
})();

/* =====================================================
   CONTACT FORM
   ===================================================== */
(function initContactForm() {
    const form   = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
        btn.disabled = true;

        const name    = (form.name    ? form.name.value.trim()    : '');
        const email   = (form.email   ? form.email.value.trim()   : '');
        const subject = (form.subject ? form.subject.value.trim() : '');
        const message = (form.message ? form.message.value.trim() : '');

        const sub  = encodeURIComponent(subject || `Portfolio contact from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

        setTimeout(() => {
            window.location.href = `mailto:mwambamule06@gmail.com?subject=${sub}&body=${body}`;
            if (status) {
                status.className   = 'form-status success';
                status.textContent = 'Your email client should open. Thanks for reaching out!';
            }
            btn.innerHTML = orig;
            btn.disabled  = false;
            form.reset();
        }, 800);
    });
})();
