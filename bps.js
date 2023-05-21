function bps(canvasId, particleCount, temperature, pressure, evade) {
   const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  let borderHitsGlobal = 0;
  let particles = [];
  let evadeMouse = evade;
  let mousePosition = { x: 0, y: 0 };
  let isMouseDown = false;

  // Add the following event listeners to track mouse movement and click events
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mouseup', handleMouseUp);

  function handleMouseMove(event) {
    mousePosition.x = event.clientX - canvas.offsetLeft;
    mousePosition.y = event.clientY - canvas.offsetTop;
  }

  function handleMouseDown(event) {
    isMouseDown = true;
    spawnParticles(30);
  }

  function handleMouseUp(event) {
    isMouseDown = false;
  }

  canvas.width = window.innerWidth - 600;
  canvas.height = window.innerHeight - 20;

  class Particle {
    constructor(x, y) {
      this.borderHits = 0;
      this.radius = Math.random() * 2 + 1;
      this.x = x !== undefined ? x : Math.random() * canvas.width;
      this.y = y !== undefined ? y : Math.random() * canvas.height;
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 4 - 2;
      this.color = this.generateRandomColor();
    }

    checkCollision(otherParticle) {
      const dx = this.x - otherParticle.x;
      const dy = this.y - otherParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.radius + otherParticle.radius) {
        const angle = Math.atan2(dy, dx);
        const thisSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        const otherSpeed = Math.sqrt(otherParticle.speedX * otherParticle.speedX + otherParticle.speedY * otherParticle.speedY);
        const thisDirection = Math.atan2(this.speedY, this.speedX);
        const otherDirection = Math.atan2(otherParticle.speedY, otherParticle.speedX);
        const thisNewSpeedX = otherSpeed * Math.cos(otherDirection - angle);
        const thisNewSpeedY = otherSpeed * Math.sin(otherDirection - angle);
        const otherNewSpeedX = thisSpeed * Math.cos(thisDirection - angle);
        const otherNewSpeedY = thisSpeed * Math.sin(thisDirection - angle);

        this.speedX = thisNewSpeedX;
        this.speedY = thisNewSpeedY;
        otherParticle.speedX = otherNewSpeedX;
        otherParticle.speedY = otherNewSpeedY;

        const overlap = 0.5 * (this.radius + otherParticle.radius - distance + 1);
        this.x += Math.cos(angle) * overlap;
        this.y += Math.sin(angle) * overlap;
        otherParticle.x -= Math.cos(angle) * overlap;
        otherParticle.y -= Math.sin(angle) * overlap;
      }
    }

    generateRandomColor() {
      const hue = Math.random() * 60 + 240; // Blue-green color range
      const saturation = Math.random() * 40 + 40; // Soft saturation
      const lightness = Math.random() * 30 + 60; // Light shades
      const alpha = Math.random() * 0.6 + 0.8; // Adjusted transparency
      return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.closePath();

      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      const speedMultiplier = 1 + ((pressure - 50) / 50) * 0.1;
      const temperatureMultiplier = temperature / 50;

      this.x += this.speedX * speedMultiplier * temperatureMultiplier;
      this.y += this.speedY * speedMultiplier * temperatureMultiplier;

      const shakeMagnitude = 1;
      const shakeX = (Math.random() - 0.5) * shakeMagnitude;
      const shakeY = (Math.random() - 0.5) * shakeMagnitude;

      let offsetX = 0;
      let offsetY = 0;

      if (evadeMouse) {
        const distanceX = this.x - mousePosition.x;
        const distanceY = this.y - mousePosition.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        const evasionDistance = 100;

        if (distance < evasionDistance) {
          const evadingFactor = (evasionDistance - distance) / evasionDistance;
          offsetX = (distanceX / distance) * evadingFactor * 20;
          offsetY = (distanceY / distance) * evadingFactor * 20;
        }
      }

      this.x += (this.speedX + shakeX + offsetX) * speedMultiplier * (temperature / 50);
      this.y += (this.speedY + shakeY + offsetY) * speedMultiplier * (temperature / 50);

      if (this.x + this.radius > canvas.width) {
        this.x = canvas.width - this.radius;
        this.speedX *= -1;
        this.borderHits++;
        borderHitsGlobal++;
      } else if (this.x - this.radius < 0) {
        this.x = this.radius;
        this.speedX *= -1;
        this.borderHits++;
        borderHitsGlobal++;
      }

      if (this.y + this.radius > canvas.height) {
        this.y = canvas.height - this.radius;
        this.speedY *= -1;
        this.borderHits++;
        borderHitsGlobal++;
      } else if (this.y - this.radius < 0) {
        this.y = this.radius;
        this.speedY *= -1;
        this.borderHits++;
        borderHitsGlobal++;
      }
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
      particles[i].update();
    }
  }
 
  function spawnParticles(count) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(mousePosition.x, mousePosition.y));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
      particles[i].update();
    }

    requestAnimationFrame(animate);
  }

  function reset() {
    init();
  }

  // Call the necessary initialization functions
  init();
  animate();

  // Function to handle dark mode preference change
function handleDarkModeChange(event) {
  const isDarkMode = event.matches;

  if (isDarkMode) {
    canvas.style.backgroundColor = '#000000'; // Set the background color to black
  } else {
    canvas.style.backgroundColor = '#ffffff'; // Set the background color to white (or any other desired color)
  }
}

// Detect the user's preferred color scheme
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

// Set the initial background color based on the current color scheme
if (prefersDarkMode.matches) {
  canvas.style.backgroundColor = '#212121'; // Set the background color to black
} else {
  canvas.style.backgroundColor = '#ffffff'; // Set the background color to white (or any other desired color)
}

// Listen for changes in the color scheme preference
prefersDarkMode.addListener(handleDarkModeChange);

  // Return any public functions or variables that you want to expose
  return {
    reset: reset
  };
}
