const homeBackgrounds = [
  '../images/Home-1.jpg',
  '../images/Home-2.jpg',
  '../images/Home-3.jpg',
  '../images/Home-4.jpg',
  '../images/Home-5.jpg',
  '../images/Home-6.jpg',
  '../images/Home-7.jpg',
  '../images/Home-8.jpg',
  '../images/Home-9.jpg',
  '../images/Home-10.jpg',
  '../images/Home-11.jpg',
  '../images/Home-12.jpg',
  '../images/Home-13.jpg',
  '../images/Home-14.jpg',
  '../images/Home-15.jpg',
  '../images/Home-16.jpg',
  '../images/Home-18.jpg',
  '../images/Home-19.jpg',
  '../images/Home-20.jpg'
];

// Check if user already has a background picked for this session
let bgIndex = sessionStorage.getItem('bgIndex');

if (bgIndex === null) {
  // First visit of the session - pick a random background and save it
  bgIndex = Math.floor(Math.random() * homeBackgrounds.length);
  sessionStorage.setItem('bgIndex', bgIndex);
} else {
  // Convert from string back to number
  bgIndex = parseInt(bgIndex);
}

// Set the background image and keep it for the entire session
document.body.style.backgroundImage = `url('${homeBackgrounds[bgIndex]}')`;