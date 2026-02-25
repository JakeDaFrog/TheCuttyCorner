document.addEventListener('DOMContentLoaded', function () {

  // Project cards — arrow navigation only
  document.querySelectorAll('.sewing-slideshow').forEach(function (ss) {
    const photos = ss.querySelectorAll('.ss-photo');
    if (photos.length <= 1) return;

    let current = 0;

    function goTo(n) {
      photos[current].classList.remove('ss-active');
      current = (n + photos.length) % photos.length;
      photos[current].classList.add('ss-active');
    }

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
