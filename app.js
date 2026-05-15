const cursor = document.getElementById("cursor");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const placeholderSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='9' viewBox='0 0 16 9'><rect width='16' height='9' fill='%230e1822'/></svg>";

const imageNodes = document.querySelectorAll("img");
const imageObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const dataSrc = img.getAttribute("data-src");
        if (dataSrc) {
          img.src = dataSrc;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      });
    }, { rootMargin: "200px" })
  : null;

imageNodes.forEach((img) => {
  img.loading = "lazy";
  img.decoding = "async";
  img.classList.add("img-blur");

  const markLoaded = () => {
    if (img.getAttribute("data-src")) return;
    img.classList.add("is-loaded");
  };

  img.addEventListener("load", markLoaded, { once: true });
  img.addEventListener("error", markLoaded, { once: true });

  const dataSrc = img.getAttribute("data-src");
  if (dataSrc) {
    if (!img.getAttribute("src")) {
      img.setAttribute("src", placeholderSrc);
    }
    if (imageObserver) {
      imageObserver.observe(img);
    } else {
      img.src = dataSrc;
      img.removeAttribute("data-src");
    }
  } else if (img.complete) {
    markLoaded();
  }
});

if (cursor && window.innerWidth > 768 && !prefersReduced) {
  let mouseX = 0;
  let mouseY = 0;
  let curX = 0;
  let curY = 0;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const animateCursor = () => {
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    cursor.style.left = `${curX - cursor.offsetWidth / 2}px`;
    cursor.style.top = `${curY - cursor.offsetHeight / 2}px`;
    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  document.querySelectorAll("[data-hover]").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });
} else if (cursor) {
  cursor.style.display = "none";
}

const nav = document.getElementById("nav");
let lastScroll = 0;

const mobileButton = document.querySelector(".nav-mobile-btn");
const navLinks = document.querySelector(".nav-links");

if (mobileButton && navLinks) {
  mobileButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

if (nav) {
  window.addEventListener("scroll", () => {
    const curr = window.scrollY;
    if (curr > lastScroll && curr > 100) {
      nav.classList.add("hidden-nav");
    } else {
      nav.classList.remove("hidden-nav");
    }
    lastScroll = curr;
  });
}

const heroCanvas = document.getElementById("hero-canvas");

if (heroCanvas && !prefersReduced) {
  const ctx = heroCanvas.getContext("2d", { alpha: false });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lines = [];
  let mx = null;
  let my = null;

  const chars = ["A", "R", "I", "S", "E", "A", "B", "I", "L", "I", "T", "Y", " "];

  class Line {
    constructor(x, fontSize, canvasHeight) {
      this.x = x;
      this.fontSize = fontSize;
      this.canvasHeight = canvasHeight;
      this.reset();
    }

    reset() {
      this.total = 40 + Math.floor(Math.random() * 80);
      this.speed = Math.random() * 1.5 + 0.5;
      this.charIndex = 0;
      this.y = -this.total * this.fontSize;
      this.history = new Array(this.total).fill(null);
    }

    draw() {
      ctx.fillStyle = "#2180c3";
      if (this.charIndex >= this.history.length) return;
      this.charIndex += this.speed;
      const ci = Math.floor(Math.random() * chars.length);
      const ch = chars[ci];
      const cy = this.y + Math.floor(this.charIndex) * this.fontSize;
      if (cy >= 0 && cy < this.canvasHeight) {
        this.history[Math.floor(this.charIndex)] = ch;
        ctx.fillText(ch, this.x, cy);
      }
    }

    clear(mouseX, mouseY, clearRadius) {
      const sz = this.fontSize;
      for (let i = 0; i < Math.floor(this.charIndex); i += 1) {
        if (this.history[i] === null) continue;
        const cy = this.y + i * sz;
        const cx = this.x + sz / 2;
        if (mouseX !== null && Math.abs(cx - mouseX) <= clearRadius && Math.abs(cy - mouseY) <= clearRadius) {
          this.history[i] = null;
          ctx.clearRect(this.x, cy - sz + 2, sz, sz - 4);
        }
      }
      if (this.charIndex >= this.history.length && this.history.every((h) => h === null)) {
        this.reset();
      }
    }
  }

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    heroCanvas.width = width * dpr;
    heroCanvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fontSize = 14;
    const columns = Math.ceil(width / fontSize);
    lines = [];
    for (let i = 0; i < columns; i += 1) {
      lines.push(new Line(i * fontSize, fontSize, height));
    }
  };

  const draw = () => {
    ctx.fillStyle = "#070c12";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    for (const line of lines) line.clear(mx, my, 120);
    for (const line of lines) line.draw();
    requestAnimationFrame(draw);
  };

  heroCanvas.addEventListener("mousemove", (event) => {
    mx = event.clientX;
    my = event.clientY;
  });
  heroCanvas.addEventListener("mouseleave", () => {
    mx = null;
    my = null;
  });

  window.addEventListener("resize", resize);
  resize();
  draw();
}

const tagCloudEl = document.getElementById("tag-cloud-el");

if (tagCloudEl) {
  const tagData = [
    { text: "IaaS", def: "Infrastructure as a Service and raw compute building blocks." },
    { text: "PaaS", def: "Platform as a Service for building without server setup." },
    { text: "SaaS", def: "Software delivered via browser and managed by providers." },
    { text: "VPC", def: "Private networking inside the cloud." },
    { text: "Storage", def: "Object, block, and file storage patterns." },
    { text: "Security", def: "Identity, encryption, and compliance controls." },
    { text: "Scaling", def: "Auto scale to match user demand." },
    { text: "DevOps", def: "Automation from code to deployment." },
    { text: "Containers", def: "Portable app packaging for consistent runtime." },
    { text: "Serverless", def: "Run code without managing servers." },
    { text: "IAM", def: "Identity and access management." },
    { text: "CDN", def: "Deliver content from global edge locations." }
  ];

  const goldenRatio = Math.PI * (1 + Math.sqrt(5));
  const radius = 220;

  tagData.forEach((tag, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / tagData.length);
    const theta = goldenRatio * i;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    const el = document.createElement("div");
    el.className = "cloud-tag";
    el.textContent = tag.text;
    el.style.transform = `translate3d(${x + 300}px, ${y + 200}px, ${z}px)`;
    el.style.fontSize = `${16 + ((z + radius) / radius) * 12}px`;
    el.style.opacity = 0.5 + ((z + radius) / (2 * radius)) * 0.5;
    el.addEventListener("click", () => showTagTooltip(tag.text, tag.def));
    tagCloudEl.appendChild(el);
  });

  if (prefersReduced) {
    tagCloudEl.style.animation = "none";
  }

  const tagContainer = document.getElementById("tag-cloud-container");
  let isDragging = false;
  let startX = 0;
  let rotY = 0;

  if (tagContainer) {
    tagContainer.addEventListener("mousedown", (event) => {
      isDragging = true;
      startX = event.clientX;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    document.addEventListener("mousemove", (event) => {
      if (!isDragging) return;
      rotY += (event.clientX - startX) * 0.5;
      startX = event.clientX;
      tagCloudEl.style.transform = `rotateY(${rotY}deg) rotateX(10deg)`;
      tagCloudEl.style.animation = "none";
    });
  }
}

function showTagTooltip(title, desc) {
  const tooltip = document.getElementById("tag-tooltip");
  const titleEl = document.getElementById("tooltip-title");
  const descEl = document.getElementById("tooltip-desc");

  if (!tooltip || !titleEl || !descEl) return;
  titleEl.textContent = title;
  descEl.textContent = desc;
  tooltip.classList.add("active");
  setTimeout(() => tooltip.classList.remove("active"), 4000);
}

if (window.gsap && window.ScrollTrigger && !prefersReduced) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.from(title, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play none none none" }
    });
  });

  gsap.from(".tutorial-card", {
    y: 60,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    scrollTrigger: { trigger: ".tutorials-grid", start: "top 80%" }
  });

  gsap.from(".info-card", {
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    scrollTrigger: { trigger: ".info-grid", start: "top 80%" }
  });

  gsap.from(".lecture-card", {
    x: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15,
    scrollTrigger: { trigger: ".lecture-list", start: "top 75%" }
  });
}
