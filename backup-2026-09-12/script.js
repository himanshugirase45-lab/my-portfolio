const canvas = document.getElementById('scroll-canvas');
const context = canvas.getContext('2d');

// Total frames count based on directory listing
const frameCount = 240;

// Function to generate the correct file name path
const currentFrame = index => (
  `video_frames_24fps/frame_${index.toString().padStart(6, '0')}.png`
);

// Preload images
const images = [];
const preloadImages = () => {
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }
};

preloadImages();

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const img = new Image();
img.src = currentFrame(1);
img.onload = function() {
    drawCanvas(img);
}

const updateImage = index => {
  if(images[index]) {
      drawCanvas(images[index]);
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

window.addEventListener('scroll', () => {  
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  // Calculate the frame index based on the scroll fraction. Ensure it stays between 0 and 239.
  const frameIndex = Math.min(
    frameCount - 1,
    Math.ceil(scrollFraction * frameCount)
  );
  
  // Update the canvas using the preloaded image
  requestAnimationFrame(() => updateImage(frameIndex));
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;
    const frameIndex = Math.min(
      frameCount - 1,
      Math.ceil(scrollFraction * frameCount)
    );
    if(images[frameIndex]) {
        drawCanvas(images[frameIndex]);
    }
});
