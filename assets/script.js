function showSidebar(){
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
}
function hideSidebar(){
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
}

btn =1;
function activateBtn(){
  if(btn == 1){
    document.querySelector('.active-btn').style.display = 'none';
    document.querySelector('.inactive-btn').style.display = 'inline-block';
    document.querySelector('.stats').innerHTML = 'Inactive';
    btn = 0;
}
else{
  document.querySelector('.inactive-btn').style.display = 'none';
    document.querySelector('.active-btn').style.display = 'inline-block';
    document.querySelector('.stats').innerHTML = 'Active';
    btn = 1;
}
}

let count = 1;
function showOption(){
    if(count == 1){
        document.querySelector('.drop-ul').style.display = 'flex';
        count = 0;
    }
    else{
        document.querySelector('.drop-ul').style.display = 'none';
        count = 1;
    }
}

let count1 = 1;
function showArticle(){
    if(count1 === 1){
        document.querySelector('#article').style.display = 'block';
        count1 = 0;
    }
    else{
        document.querySelector('#article').style.display = 'none';
        count1 = 1;
    }
}
let count2 = 1;
function showBook(){
    if(count2 === 1){
        document.querySelector('#book').style.display = 'block';
        count2 = 0;
    }
    else{
        document.querySelector('#book').style.display = 'none';
        count2 = 1;
    }
}
let count3 = 1;
function showResource(){
    if(count3 === 1){
        document.querySelector('#resource').style.display = 'block';
        count3 = 0;
    }
    else{
        document.querySelector('#resource').style.display = 'none';
        count3 = 1;
    }
}


const carouselTrack = document.querySelector('.carousel-track');
const images = document.querySelectorAll('.carousel-slide');
const imageWidth = images[0].clientWidth;  // Get the width of the first image

let currentSlide = 0;
let isAnimating = false;  // Flag to prevent multiple animations

// Function to move to the next slide
function moveToNextSlide() {
  if (isAnimating) return;
  isAnimating = true;

  if (currentSlide === images.length - 1) {
    // Handle infinite loop: move to the first slide after the last one
    currentSlide = 0;
    carouselTrack.style.transform = 'none'; // Reset transform to avoid transition issues
  } else {
    currentSlide++;
  }
  carouselTrack.style.transform = `translateX(-${currentSlide * imageWidth}px)`;
  updateActiveSlide();

  setTimeout(() => {
    isAnimating = false;
  }, 500);  // Adjust this value to control animation duration (in milliseconds)
}

// Function to update the active slide indicator (optional)
function updateActiveSlide() {
  // You can remove this function if you don't need a visual active slide indicator
  images.forEach(image => image.classList.remove('active'));
  images[currentSlide].classList.add('active');
}

// Start autoplay
let autoplayInterval = setInterval(moveToNextSlide, 3000);  // Adjust this value to control autoplay interval (in milliseconds)

// Optional: Pause autoplay on hover (add this inside the container element)
// carousel.addEventListener('mouseover', () => clearInterval(autoplayInterval));
// carousel.addEventListener('mouseout', () => autoplayInterval = setInterval(moveToNextSlide, 3000));




const currentDateElement = document.getElementById('current-date');
const today = new Date();
currentDateElement.textContent = today.toLocaleDateString();
