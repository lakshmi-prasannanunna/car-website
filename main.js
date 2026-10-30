/**
 * NOCTIS — Main Interactive Engine
 * Scrollytelling, canvas scrubbing, film grain, headlight cursor, and lineup accordion.
 * Vanilla JavaScript only.
 */

(function () {
  'use strict';

  // Ensure CONFIG is present
  const CFG = window.CONFIG;
  if (!CFG) {
    console.error('NOCTIS configuration not found.');
    return;
  }

  // Detect capabilities
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const preloaderLine = document.getElementById('preloader-line');
  const preloaderCounter = document.getElementById('preloader-counter');

  const siteHeader = document.getElementById('site-header');

  const grainCanvas = document.getElementById('grain-canvas');
  const cursorEl = document.getElementById('cursor');
  const cursorLabel = cursorEl ? cursorEl.querySelector('.cursor-label') : null;

  // Hero Elements
  const heroWrapper = document.getElementById('hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroProgressLine = document.getElementById('hero-progress-line');
  const hudChapter = document.getElementById('hud-chapter');
  const hudSpeed = document.getElementById('hud-speed');
  const hudDist = document.getElementById('hud-dist');
  const heroChaptersEls = {
    chap1: document.getElementById('hero-chap1'),
    chap2: document.getElementById('hero-chap2'),
    chap3: document.getElementById('hero-chap3'),
    chap4: document.getElementById('hero-chap4')
  };

  // Statement Elements
  const statementSection = document.getElementById('statement');
  const statementSentence = document.getElementById('statement-sentence');

  // Dismantle Elements
  const dismantleWrapper = document.getElementById('dismantle');
  const dismantleCanvas = document.getElementById('dismantle-canvas');
  const dismantleProgressLine = document.getElementById('dismantle-progress-line');
  const dismantleSvg = document.getElementById('dismantle-svg');
  const dismantleCalloutsEl = document.getElementById('dismantle-callouts');

  // Lineup Elements
  const lineupSection = document.getElementById('lineup');
  const lineupHeader = document.querySelector('.lineup-header');
  const lineupAccordion = document.getElementById('lineup-accordion');
  const lineupSlides = Array.from(document.querySelectorAll('.accordion-slide'));

  // Section Heights from CONFIG
  if (heroWrapper && CFG.heroScrollHeight) heroWrapper.style.height = CFG.heroScrollHeight;
  if (dismantleWrapper && CFG.dismantleScrollHeight) dismantleWrapper.style.height = CFG.dismantleScrollHeight;

  /* ==========================================================================
     1. FILM GRAIN GENERATOR (Shifted ~8 times/sec, 3-4% Opacity)
     ========================================================================== */
  function initFilmGrain() {
    if (!grainCanvas) return;
    const ctx = grainCanvas.getContext('2d');
    if (!ctx) return;

    // Create a 128x128 offscreen noise tile once
    const tileSize = 128;
    const offscreen = document.createElement('canvas');
    offscreen.width = tileSize;
    offscreen.height = tileSize;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(tileSize, tileSize);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255 | 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);

    const pattern = ctx.createPattern(offscreen, 'repeat');

    function resizeGrain() {
      grainCanvas.width = window.innerWidth + 100;
      grainCanvas.height = window.innerHeight + 100;
    }
    window.addEventListener('resize', resizeGrain, { passive: true });
    resizeGrain();

    // Randomly shift pattern ~8 times per second (every 125ms)
    let lastShift = 0;
    function renderGrain(now) {
      if (now - lastShift > 125) {
        lastShift = now;
        ctx.clearRect(0, 0, grainCanvas.width, grainCanvas.height);
        ctx.save();
        const offsetX = (Math.random() * 64 - 32) | 0;
        const offsetY = (Math.random() * 64 - 32) | 0;
        ctx.translate(offsetX, offsetY);
        ctx.fillStyle = pattern;
        ctx.fillRect(-offsetX, -offsetY, grainCanvas.width, grainCanvas.height);
        ctx.restore();
      }
      requestAnimationFrame(renderGrain);
    }
    requestAnimationFrame(renderGrain);
  }

  /* ==========================================================================
     2. CUSTOM CURSOR ("The Headlight", Desktop Fine Pointer Only)
     ========================================================================== */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isHovering = false;
  let activeCursorText = '';

  function initHeadlightCursor() {
    if (!cursorEl || !isFinePointer || prefersReducedMotion) {
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }

    document.body.classList.add('has-custom-cursor');

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Cursor Lerp RAF loop (lerp: 0.18)
    function loopCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;

      cursorEl.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(loopCursor);
    }
    requestAnimationFrame(loopCursor);

    // Mousedown flash for 120ms
    window.addEventListener('mousedown', () => {
      cursorEl.classList.add('is-down');
      setTimeout(() => {
        cursorEl.classList.remove('is-down');
      }, 120);
    });

    // Morph over interactive targets
    function setupInteractiveListeners() {
      const interactives = document.querySelectorAll('a, button, [data-cursor], .accordion-slide, .swatch');

      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
          let label = el.getAttribute('data-cursor');

          if (!label) {
            if (el.classList.contains('accordion-slide')) {
              label = el.classList.contains('is-open') ? 'CONFIGURE' : 'OPEN';
            } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
              label = 'VIEW';
            }
          }

          if (label) {
            cursorEl.classList.add('is-hovering');
            if (cursorLabel) cursorLabel.textContent = label;
          }
        });

        el.addEventListener('mouseleave', () => {
          cursorEl.classList.remove('is-hovering');
          if (cursorLabel) cursorLabel.textContent = '';
        });
      });
    }

    setupInteractiveListeners();
    // Expose for dynamic elements
    window.refreshCursorListeners = setupInteractiveListeners;
  }

  /* ==========================================================================
     3. NAVBAR HIDE / SHOW ON SCROLL
     ========================================================================== */
  function initNavbar() {
    if (!siteHeader) return;
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;

          if (currentScrollY > 120 && delta > 6) {
            // Scrolling down -> hide
            siteHeader.classList.add('is-hidden');
          } else if (delta < -6 || currentScrollY <= 120) {
            // Scrolling up -> show
            siteHeader.classList.remove('is-hidden');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     4. FRAME PRELOADER & IMAGE CACHE
     ========================================================================== */
  const heroFrames = [];
  const dismantleFrames = [];
  let heroLoadedCount = 0;
  let preloaderFinished = false;

  function isMobileViewport() {
    return window.innerWidth < 768;
  }

  function getFramePath(pattern, index) {
    const pad = String(index).padStart(4, '0');
    return pattern.replace('{index}', pad);
  }

  function preloadSequence(count, getPathFn, onProgress, onComplete) {
    let loaded = 0;
    const frames = new Array(count);

    for (let i = 1; i <= count; i++) {
      const img = new Image();
      const idx = i - 1;
      const path = getPathFn(i);
      img.src = path;

      // Decode before first use
      if ('decode' in img) {
        img.decode()
          .then(() => {
            frames[idx] = img;
            loaded++;
            if (onProgress) onProgress(loaded, count, idx);
            if (loaded === count && onComplete) onComplete(frames);
          })
          .catch(() => {
            // Fallback if decode rejects (network/unsupported)
            frames[idx] = img;
            loaded++;
            if (onProgress) onProgress(loaded, count, idx);
            if (loaded === count && onComplete) onComplete(frames);
          });
      } else {
        img.onload = () => {
          frames[idx] = img;
          loaded++;
          if (onProgress) onProgress(loaded, count, idx);
          if (loaded === count && onComplete) onComplete(frames);
        };
        img.onerror = () => {
          loaded++;
          if (onProgress) onProgress(loaded, count, idx);
        };
      }
    }
    return frames;
  }

  function startFramePreloading(onInitialHeroReady) {
    const isMob = isMobileViewport();
    const heroPattern = isMob ? CFG.paths.heroMobile : CFG.paths.heroDesktop;
    const dismantlePattern = isMob ? CFG.paths.dismantleMobile : CFG.paths.dismantleDesktop;

    const initialGoal = Math.min(CFG.preloaderInitialFrames, CFG.heroFrameCount);

    // 1. Preload Hero Frames
    const preloadedHero = preloadSequence(
      CFG.heroFrameCount,
      (idx) => getFramePath(heroPattern, idx),
      (loaded, total, lastIdx) => {
        heroLoadedCount = loaded;
        for (let j = 0; j < CFG.heroFrameCount; j++) {
          if (preloadedHero[j]) heroFrames[j] = preloadedHero[j];
        }

        // Update preloader line and counter
        if (!preloaderFinished) {
          const ratio = Math.min(loaded / initialGoal, 1);
          const percent = Math.round(ratio * 100);
          if (preloaderLine) preloaderLine.style.width = percent + '%';
          if (preloaderCounter) preloaderCounter.textContent = String(percent).padStart(3, '0');

          if (loaded >= initialGoal) {
            preloaderFinished = true;
            onInitialHeroReady();
          }
        }
      },
      (completeFrames) => {
        for (let j = 0; j < completeFrames.length; j++) {
          heroFrames[j] = completeFrames[j];
        }
        // 2. Once hero is completed, preload dismantle frames in background
        preloadSequence(
          CFG.dismantleFrameCount,
          (idx) => getFramePath(dismantlePattern, idx),
          (dLoaded, dTotal) => {
            // Background dismantle loading
          },
          (dCompleteFrames) => {
            for (let k = 0; k < dCompleteFrames.length; k++) {
              dismantleFrames[k] = dCompleteFrames[k];
            }
          }
        );
      }
    );
  }

  function dismissPreloader() {
    if (!preloader) return;
    preloader.classList.add('is-exiting');

    setTimeout(() => {
      preloader.classList.add('is-hidden');
      // Trigger initial chapter 1 reveal
      revealChapter('chap1');
    }, 450);
  }

  /* ==========================================================================
     5. CANVAS SCROLLYTELLING ENGINE (Hero & Dismantle)
     ========================================================================== */
  function findNearestFrame(frames, targetIdx, total) {
    if (frames[targetIdx]) return frames[targetIdx];
    // Search outwards
    for (let offset = 1; offset < total; offset++) {
      if (targetIdx - offset >= 0 && frames[targetIdx - offset]) return frames[targetIdx - offset];
      if (targetIdx + offset < total && frames[targetIdx + offset]) return frames[targetIdx + offset];
    }
    return null;
  }

  function drawCanvasFrame(canvas, ctx, img, fadeBlackProgress = 0) {
    if (!canvas || !ctx || !img) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const stageW = canvas.clientWidth;
    const stageH = canvas.clientHeight;

    if (canvas.width !== Math.round(stageW * dpr) || canvas.height !== Math.round(stageH * dpr)) {
      canvas.width = Math.round(stageW * dpr);
      canvas.height = Math.round(stageH * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, stageW, stageH);

    // Background base
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, stageW, stageH);

    const isLandscape = stageW >= stageH;
    const imgRatio = img.width / img.height;
    const stageRatio = stageW / stageH;

    let drawW, drawH, drawX, drawY;

    if (isLandscape) {
      // Cover fit for landscape screens
      if (stageRatio > imgRatio) {
        drawW = stageW;
        drawH = stageW / imgRatio;
        drawX = 0;
        drawY = (stageH - drawH) / 2;
      } else {
        drawH = stageH;
        drawW = stageH * imgRatio;
        drawX = (stageW - drawW) / 2;
        drawY = 0;
      }
    } else {
      // Contain fit vertically centered on portrait screens (never crop car)
      if (stageRatio > imgRatio) {
        drawH = stageH;
        drawW = stageH * imgRatio;
        drawX = (stageW - drawW) / 2;
        drawY = 0;
      } else {
        drawW = stageW;
        drawH = stageW / imgRatio;
        drawX = 0;
        drawY = (stageH - drawH) / 2;
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Over the last 5% of scroll, fade to solid black
    if (fadeBlackProgress > 0) {
      ctx.fillStyle = `rgba(7, 8, 10, ${Math.min(fadeBlackProgress, 1)})`;
      ctx.fillRect(0, 0, stageW, stageH);
    }

    ctx.restore();
  }

  /* ==========================================================================
     6. CHAPTER REVEALS & TELEMETRY HUD
     ========================================================================== */
  let activeChapterId = 'chap1';

  function revealChapter(chapterId) {
    if (activeChapterId === chapterId && heroChaptersEls[chapterId]?.classList.contains('is-active')) return;
    activeChapterId = chapterId;

    Object.keys(heroChaptersEls).forEach(id => {
      const el = heroChaptersEls[id];
      if (id === chapterId) {
        el.classList.add('is-active');
        el.classList.add('is-revealed');
      } else {
        el.classList.remove('is-active');
        el.classList.remove('is-revealed');
      }
    });
  }

  function updateHeroTelemetry(progress) {
    // HUD speed & distance
    const speed = Math.round(progress * CFG.hud.maxSpeed);
    const dist = (progress * CFG.hud.maxDistance).toFixed(1);

    if (hudSpeed) hudSpeed.textContent = String(speed).padStart(3, '0');
    if (hudDist) hudDist.textContent = dist;

    // Active chapter determination
    let currentChap = CFG.heroChapters[0];
    for (const chap of CFG.heroChapters) {
      if (progress >= chap.start && progress <= chap.fadeOut) {
        currentChap = chap;
        break;
      }
    }

    if (hudChapter && currentChap) {
      hudChapter.textContent = currentChap.indexStr;
    }

    // Toggle chapter text visibility
    CFG.heroChapters.forEach(chap => {
      const el = heroChaptersEls[chap.id];
      if (!el) return;

      if (progress >= chap.start && progress <= chap.end) {
        el.classList.add('is-active');
        el.classList.add('is-revealed');
      } else if (progress > chap.end && progress <= chap.fadeOut) {
        // Fade out
        const fadeRatio = (progress - chap.end) / (chap.fadeOut - chap.end);
        el.style.opacity = String(Math.max(0, 1 - fadeRatio));
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
        el.classList.remove('is-revealed');
        el.style.opacity = '';
      }
    });
  }

  /* ==========================================================================
     7. DISMANTLE CALLOUTS & SVG CONNECTOR LINES
     ========================================================================== */
  function updateDismantleCallouts(progress) {
    if (!dismantleSvg || !dismantleCalloutsEl) return;

    // SVG view dimensions
    const stageW = dismantleSvg.clientWidth;
    const stageH = dismantleSvg.clientHeight;

    let svgLinesHtml = '';

    CFG.dismantleCallouts.forEach(callout => {
      const el = document.getElementById(`callout-${callout.id}`);
      if (!el) return;

      const isVisible = progress >= callout.threshold;
      if (isVisible) {
        el.classList.add('is-visible');
      } else {
        el.classList.remove('is-visible');
      }

      // Calculate pixel coordinates
      const dotX = (callout.dotX / 100) * stageW;
      const dotY = (callout.dotY / 100) * stageH;
      const textX = (callout.textX / 100) * stageW;
      const textY = (callout.textY / 100) * stageH;

      // Position DOM elements
      const dot = el.querySelector('.callout-dot');
      const content = el.querySelector('.callout-content');

      if (dot) {
        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;
      }

      if (content) {
        content.style.left = `${textX}px`;
        content.style.top = `${textY}px`;
      }

      // Add 1px hairline connecting dot to text
      const lineOpacity = isVisible ? '1' : '0';
      svgLinesHtml += `<line x1="${dotX}" y1="${dotY}" x2="${textX}" y2="${textY}" style="opacity: ${lineOpacity};" />`;
    });

    dismantleSvg.innerHTML = svgLinesHtml;
  }

  /* ==========================================================================
     8. SECTION 2: STATEMENT WORD-BY-WORD SCROLL REVEAL
     ========================================================================== */
  function initStatementWordReveal() {
    if (!statementSentence) return;

    const sentence = "Every part was designed to disappear into one line of light.";
    const words = sentence.trim().split(/\s+/);

    statementSentence.innerHTML = words
      .map(w => `<span class="statement-word">${w}</span>`)
      .join(' ');

    const wordEls = Array.from(statementSentence.querySelectorAll('.statement-word'));

    function updateStatementScroll() {
      if (!statementSection) return;
      const rect = statementSection.getBoundingClientRect();
      const vh = window.innerHeight;

      // Progress as section enters viewport (bottom of vp) to center
      const start = vh * 0.9;
      const end = vh * 0.15;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);

      const totalWords = wordEls.length;
      wordEls.forEach((word, idx) => {
        const wordThreshold = idx / totalWords;
        const wordEnd = (idx + 1) / totalWords;

        if (progress >= wordEnd) {
          word.style.opacity = '1.0';
        } else if (progress <= wordThreshold) {
          word.style.opacity = '0.15';
        } else {
          const ratio = (progress - wordThreshold) / (wordEnd - wordThreshold);
          word.style.opacity = (0.15 + ratio * 0.85).toFixed(3);
        }
      });
    }

    window.addEventListener('scroll', updateStatementScroll, { passive: true });
    updateStatementScroll();
  }

  /* ==========================================================================
     9. SECTION 4: LINEUP ACCORDION (Desktop Hover + Keyboard + Mobile Tap)
     ========================================================================== */
  function initLineupAccordion() {
    if (!lineupAccordion || lineupSlides.length === 0) return;

    let activeIndex = 0;
    let hoverTimeout = null;

    function openSlide(index) {
      if (index < 0 || index >= lineupSlides.length) return;
      activeIndex = index;

      lineupSlides.forEach((slide, i) => {
        const isOpen = i === index;
        slide.classList.toggle('is-open', isOpen);
        slide.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Update cursor label if mouse is over active slide
      if (cursorLabel && cursorEl.classList.contains('is-hovering')) {
        cursorLabel.textContent = 'CONFIGURE';
      }
    }

    lineupSlides.forEach((slide, i) => {
      // Desktop: Debounce hover by 80ms to avoid flicker
      slide.addEventListener('mouseenter', () => {
        if (!isFinePointer) return;
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          openSlide(i);
        }, 80);
      });

      slide.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });

      // Click / Tap (Mobile & Touch)
      slide.addEventListener('click', (e) => {
        // Prevent if clicking on configure link directly
        if (e.target.closest('.slide-configure-link')) return;
        openSlide(i);
      });

      // Keyboard Accessibility (Arrow keys)
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (i + 1) % lineupSlides.length;
          lineupSlides[next].focus();
          openSlide(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (i - 1 + lineupSlides.length) % lineupSlides.length;
          lineupSlides[prev].focus();
          openSlide(prev);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSlide(i);
        }
      });

      // Swatches selection within slide
      const swatches = slide.querySelectorAll('.swatch');
      swatches.forEach(swatch => {
        swatch.addEventListener('click', (ev) => {
          ev.stopPropagation();
          swatches.forEach(s => s.classList.remove('is-active'));
          swatch.classList.add('is-active');
        });
      });
    });

    // IntersectionObserver to reveal section 4 slides with rise 40px and 0.08s stagger
    if ('IntersectionObserver' in window) {
      const lineupObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (lineupHeader) lineupHeader.classList.add('is-revealed');
            lineupAccordion.classList.add('is-revealed');
            lineupObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      lineupObserver.observe(lineupSection);
    } else {
      if (lineupHeader) lineupHeader.classList.add('is-revealed');
      lineupAccordion.classList.add('is-revealed');
    }
  }

  /* ==========================================================================
     10. MAIN ANIMATION & SCROLL LOOP (Single Unified RAF Loop)
     ========================================================================== */
  let heroCtx = null;
  let dismantleCtx = null;

  let currentHeroFrame = 0;
  let targetHeroFrame = 0;
  let lastRoundedHeroFrame = -1;

  let currentDismantleFrame = 0;
  let targetDismantleFrame = 0;
  let lastRoundedDismantleFrame = -1;

  function initCanvases() {
    if (heroCanvas) heroCtx = heroCanvas.getContext('2d', { alpha: false });
    if (dismantleCanvas) dismantleCtx = dismantleCanvas.getContext('2d', { alpha: false });
  }

  function getSectionScrollProgress(wrapper) {
    if (!wrapper) return 0;
    const rect = wrapper.getBoundingClientRect();
    const totalDist = wrapper.offsetHeight - window.innerHeight;
    if (totalDist <= 0) return 0;
    return Math.min(Math.max(-rect.top / totalDist, 0), 1);
  }

  function scrollyLoop() {
    // 1. HERO CALCULATIONS
    if (heroWrapper && heroCanvas && heroCtx) {
      const heroProg = getSectionScrollProgress(heroWrapper);

      // Target frame
      targetHeroFrame = Math.round(heroProg * (CFG.heroFrameCount - 1));

      // Lerp frame: current += (target - current) * 0.15
      currentHeroFrame += (targetHeroFrame - currentHeroFrame) * 0.15;
      const roundedHero = Math.round(currentHeroFrame);

      // Redraw only when rounded frame changes or canvas resized
      if (roundedHero !== lastRoundedHeroFrame) {
        lastRoundedHeroFrame = roundedHero;

        const img = findNearestFrame(heroFrames, roundedHero, CFG.heroFrameCount);
        if (img) {
          // Last 5% fades to black (heroProg: 0.95 -> 1.0)
          const fadeBlack = heroProg >= 0.95 ? (heroProg - 0.95) / 0.05 : 0;
          drawCanvasFrame(heroCanvas, heroCtx, img, fadeBlack);
        }
      }

      // Update 1px bottom progress line
      if (heroProgressLine) {
        heroProgressLine.style.width = (heroProg * 100) + '%';
      }

      // Telemetry HUD & text chapters
      updateHeroTelemetry(heroProg);
    }

    // 2. DISMANTLE CALCULATIONS
    if (dismantleWrapper && dismantleCanvas && dismantleCtx) {
      const disProg = getSectionScrollProgress(dismantleWrapper);

      targetDismantleFrame = Math.round(disProg * (CFG.dismantleFrameCount - 1));
      currentDismantleFrame += (targetDismantleFrame - currentDismantleFrame) * 0.15;
      const roundedDis = Math.round(currentDismantleFrame);

      if (roundedDis !== lastRoundedDismantleFrame) {
        lastRoundedDismantleFrame = roundedDis;

        const dImg = findNearestFrame(dismantleFrames, roundedDis, CFG.dismantleFrameCount);
        if (dImg) {
          drawCanvasFrame(dismantleCanvas, dismantleCtx, dImg, 0);
        }
      }

      // Update 1px bottom progress line
      if (dismantleProgressLine) {
        dismantleProgressLine.style.width = (disProg * 100) + '%';
      }

      // Callouts after 70%
      updateDismantleCallouts(disProg);
    }

    requestAnimationFrame(scrollyLoop);
  }

  /* ==========================================================================
     11. REDUCED MOTION STATIC PROGRESSION
     ========================================================================== */
  function initReducedMotion() {
    if (!prefersReducedMotion) return;

    // Observe hero scroll to switch static chapters
    const heroFallbacks = document.querySelectorAll('.hero-static-fallback .static-frame');
    function onReducedMotionScroll() {
      const prog = getSectionScrollProgress(heroWrapper);
      let activeIdx = 0;
      if (prog >= 0.8) activeIdx = 3;
      else if (prog >= 0.5) activeIdx = 2;
      else if (prog >= 0.2) activeIdx = 1;

      heroFallbacks.forEach((img, idx) => {
        img.classList.toggle('active', idx === activeIdx);
      });

      updateHeroTelemetry(prog);

      // Dismantle static switch
      const d1 = document.getElementById('dismantle-stat-1');
      const d2 = document.getElementById('dismantle-stat-2');
      const dProg = getSectionScrollProgress(dismantleWrapper);
      if (d1 && d2) {
        d1.classList.toggle('active', dProg < 0.5);
        d2.classList.toggle('active', dProg >= 0.5);
      }
    }

    window.addEventListener('scroll', onReducedMotionScroll, { passive: true });
    onReducedMotionScroll();
  }

  /* ==========================================================================
     12. INITIALIZATION ORCHESTRATION
     ========================================================================== */
  function init() {
    initFilmGrain();
    initHeadlightCursor();
    initNavbar();
    initCanvases();
    initStatementWordReveal();
    initLineupAccordion();

    if (prefersReducedMotion) {
      initReducedMotion();
      dismissPreloader();
    } else {
      // Start loading frames
      startFramePreloading(() => {
        // Hero frames 1–40 ready -> reveal site
        dismissPreloader();
        // Start RAF scrollytelling loop
        requestAnimationFrame(scrollyLoop);
      });
    }

    // Window resize handler to force canvas redraw
    window.addEventListener('resize', () => {
      lastRoundedHeroFrame = -1;
      lastRoundedDismantleFrame = -1;
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

