const canvas = document.getElementById("car-canvas");
const context = canvas.getContext("2d");

canvas.width = 1920; 
canvas.height = 1080;

const frameCount = 192;
const currentFrame = index => (
  `car video/frame_${(index + 1).toString().padStart(4, '0')}.png`
);

const images = [];
const car = {
  frame: 0
};

// Load all frames
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

// Draw the first frame when it loads
images[0].onload = render;

function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Calculate scaling to fit the canvas nicely, assuming 1920x1080 standard
  const scale = Math.max(canvas.width / images[car.frame].width, canvas.height / images[car.frame].height);
  const x = (canvas.width / 2) - (images[car.frame].width / 2) * scale;
  const y = (canvas.height / 2) - (images[car.frame].height / 2) * scale;
  
  // Draw scaled image centered if not identical aspect ratio
  if(images[car.frame].width) {
      context.drawImage(images[car.frame], 0, 0, images[car.frame].width, images[car.frame].height, x, y, images[car.frame].width * scale, images[car.frame].height * scale);
  }
}

// Ensure resize works well
window.addEventListener('resize', () => {
    // Optionally resize canvas on window resize, for now sticking to 1920x1080 scaled down by CSS object-fit
});

// Scroll event listener
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.max(0, Math.ceil(scrollFraction * frameCount))
  );

  if (car.frame !== frameIndex) {
    car.frame = frameIndex;
    requestAnimationFrame(render);
  }
});
