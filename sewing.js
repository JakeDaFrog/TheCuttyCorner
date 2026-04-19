document.addEventListener('DOMContentLoaded', function () {

  // Project cards — arrow navigation only
  document.querySelectorAll('.sewing-slideshow').forEach(function (ss) {
    const photos = Array.from(ss.querySelectorAll('.ss-photo'));
    if (photos.length <= 1) return;

    // Start at whichever image is marked active in the HTML
    let current = photos.findIndex(function (p) { return p.classList.contains('ss-active'); });
    if (current === -1) current = 0;

    function goTo(n) {
      photos[current].classList.remove('ss-active');
      current = (n + photos.length) % photos.length;
      // Load image on demand if it hasn't been fetched yet
      if (photos[current].dataset.src) {
        photos[current].src = photos[current].dataset.src;
        delete photos[current].dataset.src;
      }
      photos[current].classList.add('ss-active');
    }

    // Preload the neighbours of the initial active image
    [current - 1, current + 1].forEach(function (i) {
      var idx = (i + photos.length) % photos.length;
      if (photos[idx].dataset.src) {
        photos[idx].src = photos[idx].dataset.src;
        delete photos[idx].dataset.src;
      }
    });

    var prev = ss.querySelector('.ss-prev');
    var next = ss.querySelector('.ss-next');
    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
  });

  // Bikepacking strip — auto-rotate
  var strip = document.querySelector('.bikepack-strip');
  if (strip) {
    var stripPhotos = strip.querySelectorAll('.ss-photo');
    if (stripPhotos.length > 1) {
      var stripCurrent = 0;
      setInterval(function () {
        stripPhotos[stripCurrent].classList.remove('ss-active');
        stripCurrent = (stripCurrent + 1) % stripPhotos.length;
        stripPhotos[stripCurrent].classList.add('ss-active');
      }, 5000);
    }
  }

});
