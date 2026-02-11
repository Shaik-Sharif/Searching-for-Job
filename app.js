// app.js - hardened version of your code (mobile menu, banner slider, latest jobs)
(function () {
  'use strict';

  const JOBS_PATHS = [
    '/data/jobs.json',     // try project data folder first
    '/backend/data/jobs.json',
    'jobs.json'            // fallback relative path (your original)
  ];

  // UTILS
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));
  const safe = (fn) => { try { return fn(); } catch (e) { console.warn(e); return null; } };

  // wait for DOM
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileMenu();
    initBannerSlider();
    loadLatestJobs(); // async; handles its own errors
  }

  /* -------- Mobile menu -------- */
  function initMobileMenu() {
    const mobileBtn = qs('#mobileMenuBtn');
    const nav = qs('#mainNav');
    if (!mobileBtn) return; // not on this page
    if (!nav) {
      console.warn('mainNav element missing');
      return;
    }
    mobileBtn.addEventListener('click', () => nav.classList.toggle('show'));
  }

  /* -------- Banner slider -------- */
  function initBannerSlider() {
    const bannerSlider = qs('#bannerSlider');
    const leftBtn = qs('#bannerLeft');
    const rightBtn = qs('#bannerRight');
    const slides = qsa('.banner-slide');

    if (!bannerSlider || slides.length === 0) {
      // either not on a page with a banner or no slides present
      return;
    }

    let index = 0;
    const total = slides.length;
    let intervalId = null;
    const INTERVAL = 4000;

    function update() {
      // guard: ensure bannerSlider has style
      if (!bannerSlider.style) return;
      bannerSlider.style.transform = `translateX(-${index * 100}%)`;
    }

    function next() { index = (index + 1) % total; update(); }
    function prev() { index = (index - 1 + total) % total; update(); }

    if (leftBtn) leftBtn.addEventListener('click', prev);
    if (rightBtn) rightBtn.addEventListener('click', next);

    // pause on hover (optional)
    bannerSlider.addEventListener('mouseenter', () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    });
    bannerSlider.addEventListener('mouseleave', () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(next, INTERVAL);
    });

    // init
    update();
    intervalId = setInterval(next, INTERVAL);
  }

  /* -------- Load latest jobs -------- */
  async function loadLatestJobs() {
    const latestContainer = qs('#latest-jobs');
    if (!latestContainer) return; // page doesn't have a latest jobs section

    latestContainer.innerHTML = '<div class="loader">Loading jobs…</div>';

    let jobs = [];
    for (const p of JOBS_PATHS) {
      try {
        const res = await fetch(p, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        jobs = await res.json();
        if (Array.isArray(jobs)) break; // got a valid list
      } catch (err) {
        console.warn(`Failed to fetch jobs from ${p}:`, err.message);
        jobs = [];
      }
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      latestContainer.innerHTML = '<div class="no-jobs">No jobs available right now.</div>';
      return;
    }

    // Take only first 3 jobs
    const latest = jobs.slice(0, 3);

    // build with fragment (faster, safer)
    const frag = document.createDocumentFragment();
    latest.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card';
      // sanitize text by creating nodes rather than injecting raw HTML
      const h3 = document.createElement('h3'); h3.textContent = job.title || 'Untitled';
      const pCompany = document.createElement('p');
      pCompany.innerHTML = `<strong>Company:</strong> ${escapeHtml(job.company || '')}`;
      const pLoc = document.createElement('p');
      pLoc.innerHTML = `<strong>Location:</strong> ${escapeHtml(job.location || '')}`;
      const pExp = document.createElement('p');
      pExp.innerHTML = `<strong>Experience:</strong> ${escapeHtml(job.experience || '')}`;

      const a = document.createElement('a');
      a.className = 'btn';
      // Keep original behavior: link to job_details.html?id=...
      a.href = `job_details.html?id=${encodeURIComponent(job.id)}`;
      a.textContent = 'View Details';

      card.appendChild(h3);
      card.appendChild(pCompany);
      card.appendChild(pLoc);
      card.appendChild(pExp);
      card.appendChild(a);

      frag.appendChild(card);
    });

    latestContainer.innerHTML = ''; // clear loader
    latestContainer.appendChild(frag);
  }

  /* -------- Helpers -------- */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();