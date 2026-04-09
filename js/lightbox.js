(function () {
  // ── Build overlay DOM ────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous">&#8592;</button>' +
    '<div class="lb-img-wrap"><img class="lb-img" src="" alt=""><div class="lb-counter"></div></div>' +
    '<button class="lb-next" aria-label="Next">&#8594;</button>';
  document.body.appendChild(overlay);

  var lbImg     = overlay.querySelector('.lb-img');
  var lbClose   = overlay.querySelector('.lb-close');
  var lbPrev    = overlay.querySelector('.lb-prev');
  var lbNext    = overlay.querySelector('.lb-next');
  var lbCounter = overlay.querySelector('.lb-counter');

  var currentGroup = [];
  var currentIndex = 0;

  // ── Groups ───────────────────────────────────────────────────
  // Collect groups after DOM is ready.
  // Group strategy:
  //   • Each .cs-compare block  → its own 2-image group (before/after)
  //   • All .cs-gallery-item imgs on the page → one gallery group
  //   • Standalone .dd-img imgs (not inside .cs-compare) → each its own 1-image group

  function buildGroups() {
    var groups = [];

    // 1. Before/after pairs
    document.querySelectorAll('.cs-compare').forEach(function (compare) {
      var imgs = Array.from(compare.querySelectorAll('img'));
      if (imgs.length) groups.push(imgs);
    });

    // 2. Gallery group
    var galleryImgs = Array.from(document.querySelectorAll('.cs-gallery-item img'));
    if (galleryImgs.length) groups.push(galleryImgs);

    // 3. Standalone dd-img (not inside .cs-compare)
    document.querySelectorAll('.dd-img img').forEach(function (img) {
      if (!img.closest('.cs-compare')) {
        groups.push([img]);
      }
    });

    return groups;
  }

  // ── Show image at index within current group ─────────────────
  function showAt(index) {
    currentIndex = index;
    var img = currentGroup[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';

    var total = currentGroup.length;
    if (total > 1) {
      lbPrev.style.display = 'flex';
      lbNext.style.display = 'flex';
      lbCounter.textContent = (currentIndex + 1) + ' / ' + total;
      lbCounter.style.display = 'block';
      // Label before/after for 2-image groups
      if (total === 2) {
        lbCounter.textContent = currentIndex === 0 ? 'Before' : 'After';
      }
    } else {
      lbPrev.style.display = 'none';
      lbNext.style.display = 'none';
      lbCounter.style.display = 'none';
    }
  }

  // ── Open lightbox ─────────────────────────────────────────────
  function open(group, index) {
    currentGroup = group;
    showAt(index);
    overlay.classList.add('lb-active');
    document.body.style.overflow = 'hidden';
  }

  // ── Close lightbox ────────────────────────────────────────────
  function close() {
    overlay.classList.remove('lb-active');
    document.body.style.overflow = '';
    setTimeout(function () { lbImg.src = ''; }, 300);
  }

  function prev() {
    if (currentGroup.length < 2) return;
    showAt((currentIndex - 1 + currentGroup.length) % currentGroup.length);
  }

  function next() {
    if (currentGroup.length < 2) return;
    showAt((currentIndex + 1) % currentGroup.length);
  }

  // ── Event listeners ───────────────────────────────────────────
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); next(); });

  // Close when clicking the dark backdrop (not image or controls)
  overlay.addEventListener('click', function (e) {
    var inControls = e.target === lbImg ||
                     e.target === lbPrev ||
                     e.target === lbNext ||
                     e.target === lbClose;
    if (!inControls) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('lb-active')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // ── Wire up triggers ──────────────────────────────────────────
  var groups = buildGroups();

  groups.forEach(function (group) {
    group.forEach(function (img, idx) {
      img.classList.add('lb-trigger');
      img.addEventListener('click', function () {
        open(group, idx);
      });
    });
  });
}());
