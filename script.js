const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const landing = document.querySelector(".landing");
const canvas = document.querySelector(".motion-field");

if (!prefersReducedMotion && landing) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      landing.style.setProperty("--move-x", `${x * 18}px`);
      landing.style.setProperty("--move-y", `${y * 14}px`);
      landing.style.setProperty("--logo-x", `${x * 10}px`);
      landing.style.setProperty("--logo-y", `${y * 8}px`);
      landing.style.setProperty("--tilt-x", `${x * 4}`);
      landing.style.setProperty("--tilt-y", `${y * 4}`);
    },
    { passive: true },
  );
}

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const strands = [];
  let width = 0;
  let height = 0;
  let frameId = 0;
  let time = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    strands.length = 0;
    const count = Math.max(6, Math.min(12, Math.floor(width / 120)));

    for (let i = 0; i < count; i += 1) {
      strands.push({
        y: (height / (count + 1)) * (i + 1),
        amplitude: 18 + Math.random() * 30,
        speed: 0.004 + Math.random() * 0.006,
        offset: Math.random() * Math.PI * 2,
        alpha: 0.06 + Math.random() * 0.07,
      });
    }
  };

  const draw = () => {
    time += 1;
    ctx.clearRect(0, 0, width, height);

    strands.forEach((strand, index) => {
      ctx.beginPath();

      for (let x = -40; x <= width + 40; x += 24) {
        const wave =
          strand.y +
          Math.sin(x * 0.009 + time * strand.speed + strand.offset) * strand.amplitude +
          Math.cos(x * 0.004 + time * strand.speed * 1.6) * (strand.amplitude * 0.42);

        if (x === -40) {
          ctx.moveTo(x, wave);
        } else {
          ctx.lineTo(x, wave);
        }
      }

      ctx.strokeStyle =
        index % 3 === 0
          ? `rgba(216, 111, 98, ${strand.alpha})`
          : `rgba(18, 74, 132, ${strand.alpha})`;
      ctx.lineWidth = index % 3 === 0 ? 1.4 : 1;
      ctx.stroke();
    });

    frameId = requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw();

  window.addEventListener("pagehide", () => cancelAnimationFrame(frameId));
}
