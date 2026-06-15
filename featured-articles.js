// Featured articles data — newest article MUST be first in this array.
// When you add a new article, add it at the TOP of this list. The homepage
// "Newest Update" section always shows featuredArticles[0].
const featuredArticles = [
  {
    title: "Tour de Los Padres 2026",
    link: "Articles/Article-13.html",
    quote: "Coming away from the ride I felt a sense of belonging and a deeper love for the South Los Padres. The wilderness is unforgiving and nearly inaccessible and having a body that allows me to travel through these places with the people I love is something I am so thankful for.",
    image: "images/P1200231.JPG"
  },
  {
    title: "Winter Hot Springs Bikepacking",
    link: "Articles/Article-12.html",
    quote: "In December of 2025, Rhys, Drew, Chad, and I decided to take a classic winter hot springs trip. We had originally planned a coast tour for the weekend, but for the second year in a row, weather shut that plan down.",
    image: "images/Article-12-5.JPG"
  },
  {
    title: "Arroyo Seco Overnighter January 2026",
    link: "Articles/Article-11.html",
    quote: "High flows and a good bush-whack in the northern Los Padres made for an incredible overnight adventure with amazing waterfalls and narrows.",
    image: "images/Article-11-11.JPG"
  },
  {
    title: "Arroyo Seco Summer Activities",
    link: "Articles/Article-10.html",
    quote: "John shot Drew and me a text in mid-summer about a trip we had previously discussed on a backpacking trip earlier that year. We loaded up the car and drove up north to Eastern Big Sur for a few nights of good times and hiking.",
    image: "images/SecoRiver-1.jpeg"
  },
  {
    title: "Getting Started With Bikepacking",
    link: "Articles/Article-1.html",
    quote: "So, you want to get started in the wonderful world of bikepacking? This guide will equip you with all the knowledge and skills you will need to conquer your first bikepacking trip.",
    image: "images/Article-1-1.jpg"
  },
  {
    title: "Half Dome in One Fell Swoop",
    link: "Articles/Article-2.html",
    quote: "In October of 2024, I got a call from my good friend Carson about climbing Half Dome cables. Upon reaching the cable tie-in on the dome, we realized that we were in the first 7 people on the dome.",
    image: "images/HalfDome-2.jpg"
  }
];

// Populate the newest update section with featuredArticles[0]
function populateFeaturedArticle() {
  const article = featuredArticles[0];

  const contentDiv = document.querySelector('.featured-content');
  const imageLink = document.querySelector('.featured-image-link');
  const image = document.querySelector('.featured-image');

  if (contentDiv && imageLink && image) {
    contentDiv.querySelector('h2').textContent = 'Newest Update';
    contentDiv.querySelector('.featured-description').innerHTML =
      `<strong>${article.title}</strong><br><em>"${article.quote}"</em><br><a href="${article.link}">Take a peek →</a>`;

    image.src = article.image;
    image.alt = article.title;
    imageLink.href = article.link;
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', populateFeaturedArticle);
} else {
  populateFeaturedArticle();
}
