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
  '../images/Home-17.jpg'
];

let bgIndex = Math.floor(Math.random() * homeBackgrounds.length);

const cycleBackground = () => {
  document.body.style.backgroundImage = `url('${homeBackgrounds[bgIndex]}')`;
  bgIndex = (bgIndex + 1) % homeBackgrounds.length;
};

cycleBackground();
setInterval(cycleBackground, 20000);
x