const canvas = document.getElementById('scroll-canvas');
const context = canvas.getContext('2d');

// Total frames count based on directory listing
const frameCount = 240;

// Function to generate the correct file name path
const currentFrame = index => (
  `video_frames_24fps/frame_${index.toString().padStart(6, '0')}.png`
);

// Preload images - windowed + idle to preserve quality but avoid 115MB upfront load
const images = new Array(frameCount);
const loaded = new Set();
const loadFrame = (i) => {
  if (i < 1 || i > frameCount || loaded.has(i)) return;
  loaded.add(i);
  const img = new Image();
  img.decoding = 'async';
  img.src = currentFrame(i);
  images[i - 1] = img;
  return img;
};

const preloadWindow = (center1Based, radius = 30) => {
  for (let d = -radius; d <= radius; d++) loadFrame(center1Based + d);
};

const idlePreloadRest = () => {
  let i = 1;
  const chunk = () => {
    for (let n = 0; n < 10 && i <= frameCount; n++, i++) loadFrame(i);
    if (i <= frameCount) {
      if ('requestIdleCallback' in window) requestIdleCallback(chunk, { timeout: 2000 });
      else setTimeout(chunk, 50);
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(chunk, { timeout: 2000 });
  else setTimeout(chunk, 50);
};

// First frame immediately for first paint
loadFrame(1);
preloadWindow(1);
idlePreloadRest();

// Set canvas dimensions - capped backing store on mobile for GPU, CSS stays 100vw/100vh
const sizeCanvas = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const maxW = window.innerWidth <= 768 ? 1280 : 1920;
  canvas.width = Math.min(window.innerWidth * dpr, maxW);
  canvas.height = Math.min(window.innerHeight * dpr, maxW * 9 / 16);
  // CSS size preserved via stylesheet (100vw/100vh cover)
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
};
sizeCanvas();

const img = new Image();
img.src = currentFrame(1);
img.onload = function() {
    drawCanvas(img);
}

const updateImage = index => {
  const frame = images[index];
  if (frame && frame.complete && frame.naturalWidth) {
      drawCanvas(frame);
  } else {
      loadFrame(index + 1);
      preloadWindow(index + 1);
  }
}

// Draw image ensuring it covers the canvas
const drawCanvas = (img) => {
    const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, width, height);
};

let ticking = false;
const getFrameIndex = () => {
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
  return Math.min(frameCount - 1, Math.ceil(scrollFraction * frameCount));
};
window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      const frameIndex = getFrameIndex();
      preloadWindow(frameIndex + 1, 20);
      updateImage(frameIndex);
      ticking = false;
    });
  }
}, { passive: true });

window.addEventListener('resize', () => {
    sizeCanvas();
    const frameIndex = getFrameIndex();
    if(images[frameIndex] && images[frameIndex].complete) {
        drawCanvas(images[frameIndex]);
    }
});

// Hamburger toggle (mobile only, hidden on desktop via CSS)
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// Contact form -> opens visitor's email app via mailto (no backend/fake success)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;
    const to = contactForm.dataset.contactEmail || '';
    const name = document.getElementById('contact-name').value.trim();
    const from = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const body = `Hi,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0A— ${encodeURIComponent(name)} (${encodeURIComponent(from)})`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
  });
}

// "Start a Project" buttons -> smooth-scroll to contact, then focus Name field
const focusNameField = () => {
  const nameField = document.getElementById('contact-name');
  if (nameField) nameField.focus({ preventScroll: true });
};
document.querySelectorAll('a[aria-label="Start a project with Himanshu"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    // Native smooth scroll runs via CSS; focus after scroll settles (~900ms)
    window.setTimeout(focusNameField, 900);
  });
});
