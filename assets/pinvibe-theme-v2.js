/* PinVibe theme v2 scripts — built from modules/js-*.js (minified). Loaded by pinvibe-theme-v2.ext.xml. */
(function () {
  'use strict';
  function $(selector, context) {
    var root = context || document;
    return root.querySelector(selector);
  }
  function $$(selector, context) {
    var root = context || document;
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }
  function addClass(el, name) {
    if (el && !el.classList.contains(name)) {
      el.classList.add(name);
    }
  }
  function removeClass(el, name) {
    if (el && el.classList.contains(name)) {
      el.classList.remove(name);
    }
  }
  function toggleClass(el, name, force) {
    if (!el) {
      return false;
    }
    if (typeof force === 'boolean') {
      if (force) {
        el.classList.add(name);
      } else {
        el.classList.remove(name);
      }
      return force;
    }
    return el.classList.toggle(name);
  }
  function prefersReducedMotion() {
    if (typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function hasFinePointer() {
    if (typeof window.matchMedia !== 'function') {
      return true;
    }
    return window.matchMedia('(pointer: fine)').matches;
  }
  function scrollToY(y) {
    if (prefersReducedMotion()) {
      window.scrollTo(0, y);
    } else if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo(0, y);
    }
  }
  function scrollY() {
    return window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop || 0;
  }
  function documentHeight() {
    var body = document.body;
    var html = document.documentElement;
    return Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
  }
  function onScrollThrottled(callback) {
    var ticking = false;
    function handler() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          callback();
        });
      }
    }
    window.addEventListener('scroll', handler, { passive: true });
    return handler;
  }
  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }
  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
    }
  }
  function focusableElements(container) {
    if (!container) {
      return [];
    }
    var selector = 'a[href], button:not([disabled]), input:not([disabled]),' +
      'select:not([disabled]), textarea:not([disabled]),' +
      '[tabindex]:not([tabindex="-1"])';
    return $$(selector, container).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }
  function firstFocusable(container) {
    var items = focusableElements(container);
    return items.length ? items[0] : null;
  }
  function trapTabKey(event, container) {
    if (event.key !== 'Tab') {
      return;
    }
    var items = focusableElements(container);
    if (!items.length) {
      return;
    }
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  var toastRegion = null;
  function getToastRegion() {
    if (toastRegion) {
      return toastRegion;
    }
    toastRegion = document.createElement('div');
    toastRegion.id = 'js-toast-region';
    toastRegion.className = 'toast-region';
    toastRegion.setAttribute('aria-live', 'polite');
    toastRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastRegion);
    return toastRegion;
  }
  function showToast(message) {
    if (!message) {
      return;
    }
    var region = getToastRegion();
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    region.appendChild(toast);
    void toast.offsetWidth;
    addClass(toast, 'is-visible');
    window.setTimeout(function () {
      removeClass(toast, 'is-visible');
      window.setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3200);
  }
  function initTopbar() {
    var dismissBtn = $('#js-topbar-dismiss');
    if (!dismissBtn) {
      return;
    }
    dismissBtn.addEventListener('click', function (event) {
      event.preventDefault();
      var topbar = $('.topbar');
      if (topbar) {
        addClass(topbar, 'is-dismissed');
        topbar.setAttribute('aria-hidden', 'true');
      }
    });
  }
  var drawer = null;
  var drawerOverlay = null;
  var drawerOpeners = [];
  var drawerLastOpener = null;
  var drawerIsOpen = false;
  function findDrawer() {
    return $('#js-mobile-drawer') || $('.mobile-drawer') ||
      $('[data-drawer]') || null;
  }
  function findDrawerOverlay() {
    return $('#js-drawer-overlay') || $('.drawer-overlay') || null;
  }
  function createDrawerOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'js-drawer-overlay';
    overlay.className = 'drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('hidden', '');
    document.body.appendChild(overlay);
    return overlay;
  }
  function lockBodyScroll() {
    addClass(document.body, 'is-scroll-locked');
    document.documentElement.style.overflow = 'hidden';
  }
  function unlockBodyScroll() {
    removeClass(document.body, 'is-scroll-locked');
    document.documentElement.style.overflow = '';
  }
  function openDrawer(opener) {
    if (!drawer || drawerIsOpen) {
      return;
    }
    drawerIsOpen = true;
    drawerLastOpener = opener || null;
    addClass(drawer, 'is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (drawerOverlay) {
      drawerOverlay.removeAttribute('hidden');
      addClass(drawerOverlay, 'is-visible');
      drawerOverlay.setAttribute('aria-hidden', 'false');
    }
    drawerOpeners.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'true');
    });
    lockBodyScroll();
    addClass(document.body, 'drawer-open');
    var target = $('#js-menu-close', drawer) || firstFocusable(drawer);
    if (target) {
      target.focus();
    }
  }
  function closeDrawer() {
    if (!drawer || !drawerIsOpen) {
      return;
    }
    drawerIsOpen = false;
    removeClass(drawer, 'is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (drawerOverlay) {
      removeClass(drawerOverlay, 'is-visible');
      drawerOverlay.setAttribute('aria-hidden', 'true');
      drawerOverlay.setAttribute('hidden', '');
    }
    drawerOpeners.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    unlockBodyScroll();
    removeClass(document.body, 'drawer-open');
    if (drawerLastOpener && document.contains(drawerLastOpener)) {
      drawerLastOpener.focus();
    }
    drawerLastOpener = null;
  }
  function initDrawer() {
    drawer = findDrawer();
    if (!drawer) {
      return;
    }
    drawerOpeners = $$('#js-menu-open, [data-menu-open]');
    if (!drawerOpeners.length) {
      return;
    }
    drawerOverlay = findDrawerOverlay() || createDrawerOverlay();
    drawer.setAttribute('aria-hidden', 'true');
    drawerOpeners.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', drawer.id || 'js-mobile-drawer');
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        if (drawerIsOpen) {
          closeDrawer();
        } else {
          openDrawer(btn);
        }
      });
    });
    $$('#js-menu-close, [data-menu-close]', drawer).forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        closeDrawer();
      });
    });
    drawerOverlay.addEventListener('click', function () {
      closeDrawer();
    });
    drawer.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
      } else {
        trapTabKey(event, drawer);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && drawerIsOpen) {
        closeDrawer();
      }
    });
    $$('a[href]', drawer).forEach(function (link) {
      link.addEventListener('click', function () {
        closeDrawer();
      });
    });
  }
  var dropdownItems = [];
  function dropdownToggleOf(item) {
    return $('[data-dropdown-toggle]', item) ||
      item.querySelector(':scope > a, :scope > button') ||
      $('a, button', item);
  }
  function dropdownMenuOf(item) {
    return $('[data-dropdown-menu]', item) ||
      $('.sub-menu', item) || $('.dropdown-menu', item) ||
      item.querySelector(':scope > ul');
  }
  function closeDropdown(item, returnFocus) {
    if (!item) {
      return;
    }
    removeClass(item, 'is-open');
    var toggle = dropdownToggleOf(item);
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
    var menu = dropdownMenuOf(item);
    if (menu) {
      menu.setAttribute('aria-hidden', 'true');
    }
    if (returnFocus && toggle) {
      toggle.focus();
    }
  }
  function openDropdown(item) {
    if (!item) {
      return;
    }
    dropdownItems.forEach(function (other) {
      if (other !== item) {
        closeDropdown(other, false);
      }
    });
    addClass(item, 'is-open');
    var toggle = dropdownToggleOf(item);
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
    }
    var menu = dropdownMenuOf(item);
    if (menu) {
      menu.setAttribute('aria-hidden', 'false');
    }
  }
  function closeAllDropdowns() {
    dropdownItems.forEach(function (item) {
      closeDropdown(item, false);
    });
  }
  function initDropdowns() {
    dropdownItems = $$('.nav-item--has-children, .has-dropdown, .has-mega, [data-dropdown]');
    if (!dropdownItems.length) {
      return;
    }
    dropdownItems.forEach(function (item) {
      var toggle = dropdownToggleOf(item);
      var menu = dropdownMenuOf(item);
      if (!toggle || !menu) {
        return;
      }
      if (!menu.id) {
        menu.id = 'dropdown-' + Math.random().toString(36).slice(2, 8);
      }
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-controls', menu.id);
      menu.setAttribute('aria-hidden', 'true');
      if (hasFinePointer()) {
        item.addEventListener('mouseenter', function () {
          openDropdown(item);
        });
        item.addEventListener('mouseleave', function () {
          closeDropdown(item, false);
        });
      }
      toggle.addEventListener('click', function (event) {
        var isOpen = item.classList.contains('is-open');
        if (isOpen) {
          closeDropdown(item, false);
          return;
        }
        event.preventDefault();
        openDropdown(item);
      });
      toggle.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key === 'Enter' || key === ' ') {
          event.preventDefault();
          if (item.classList.contains('is-open')) {
            closeDropdown(item, false);
          } else {
            openDropdown(item);
            var first = firstFocusable(menu);
            if (first) {
              first.focus();
            }
          }
        } else if (key === 'ArrowDown') {
          event.preventDefault();
          openDropdown(item);
          var firstItem = firstFocusable(menu);
          if (firstItem) {
            firstItem.focus();
          }
        } else if (key === 'Escape') {
          event.preventDefault();
          closeDropdown(item, true);
        }
      });
      menu.addEventListener('keydown', function (event) {
        var key = event.key;
        if (key === 'Escape') {
          event.preventDefault();
          closeDropdown(item, true);
          return;
        }
        if (key !== 'ArrowDown' && key !== 'ArrowUp') {
          return;
        }
        var links = focusableElements(menu);
        if (!links.length) {
          return;
        }
        event.preventDefault();
        var index = links.indexOf(document.activeElement);
        var nextIndex;
        if (key === 'ArrowDown') {
          nextIndex = index < 0 || index === links.length - 1 ? 0 : index + 1;
        } else {
          nextIndex = index <= 0 ? links.length - 1 : index - 1;
        }
        links[nextIndex].focus();
      });
    });
    document.addEventListener('click', function (event) {
      var inside = false;
      dropdownItems.forEach(function (item) {
        if (item.contains(event.target)) {
          inside = true;
        }
      });
      if (!inside) {
        closeAllDropdowns();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeAllDropdowns();
      }
    });
  }
  var searchOverlay = null;
  var searchOpeners = [];
  var searchLastOpener = null;
  var searchIsOpen = false;
  function openSearch(opener) {
    if (!searchOverlay || searchIsOpen) {
      return;
    }
    searchIsOpen = true;
    searchLastOpener = opener || null;
    addClass(searchOverlay, 'is-open');
    searchOverlay.setAttribute('aria-hidden', 'false');
    searchOpeners.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'true');
    });
    lockBodyScroll();
    addClass(document.body, 'search-open');
    var input = $('#js-search-input', searchOverlay) ||
      $('input[type="search"], input[type="text"]', searchOverlay);
    if (input) {
      input.focus();
      if (typeof input.select === 'function' && input.value) {
        input.select();
      }
    }
  }
  function closeSearch() {
    if (!searchOverlay || !searchIsOpen) {
      return;
    }
    searchIsOpen = false;
    removeClass(searchOverlay, 'is-open');
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchOpeners.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
    });
    unlockBodyScroll();
    removeClass(document.body, 'search-open');
    if (searchLastOpener && document.contains(searchLastOpener)) {
      searchLastOpener.focus();
    }
    searchLastOpener = null;
  }
  function initSearchOverlay() {
    searchOverlay = $('#js-search-overlay') || $('.search-overlay') || null;
    if (!searchOverlay) {
      return;
    }
    searchOpeners = $$('#js-search-open, [data-search-open]');
    if (!searchOpeners.length) {
      return;
    }
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchOpeners.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', searchOverlay.id || 'js-search-overlay');
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        if (searchIsOpen) {
          closeSearch();
        } else {
          openSearch(btn);
        }
      });
    });
    $$('#js-search-close, [data-search-close]', searchOverlay)
      .forEach(function (btn) {
        btn.addEventListener('click', function (event) {
          event.preventDefault();
          closeSearch();
        });
      });
    searchOverlay.addEventListener('click', function (event) {
      if (event.target === searchOverlay) {
        closeSearch();
      }
    });
    searchOverlay.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
      } else {
        trapTabKey(event, searchOverlay);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && searchIsOpen) {
        closeSearch();
      }
    });
    var input = $('#js-search-input', searchOverlay);
    if (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeSearch();
        }
      });
    }
  }
  var siteHeader = null;
  var lastScrollY = 0;
  var headerHidden = false;
  function updateStickyHeader() {
    if (!siteHeader) {
      return;
    }
    var y = scrollY();
    var scrollingDown = y > lastScrollY;
    toggleClass(siteHeader, 'is-scrolled', y > 40);
    toggleClass(siteHeader, 'is-sticky', y > 0);
    if (y <= 160) {
      if (headerHidden) {
        removeClass(siteHeader, 'is-hidden');
        headerHidden = false;
      }
      toggleClass(siteHeader, 'is-visible', y > 0);
    } else if (scrollingDown && !drawerIsOpen && !searchIsOpen) {
      if (!headerHidden) {
        addClass(siteHeader, 'is-hidden');
        headerHidden = true;
      }
      removeClass(siteHeader, 'is-visible');
    } else if (!scrollingDown) {
      if (headerHidden) {
        removeClass(siteHeader, 'is-hidden');
        headerHidden = false;
      }
      addClass(siteHeader, 'is-visible');
    }
    lastScrollY = y;
  }
  function initStickyHeader() {
    siteHeader = $('#js-site-header') || $('.site-header') ||
      $('header') || null;
    if (!siteHeader) {
      return;
    }
    lastScrollY = scrollY();
    updateStickyHeader();
    onScrollThrottled(updateStickyHeader);
  }
  var backToTopBtn = null;
  var backToTopFloating = null;
  function updateBackToTop() {
    if (!backToTopFloating) {
      return;
    }
    toggleClass(backToTopFloating, 'is-visible', scrollY() > 600);
  }
  function initBackToTop() {
    backToTopBtn = $('#js-bottom-top') || $('[data-scroll-top]');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function (event) {
        event.preventDefault();
        scrollToY(0);
      });
    }
    backToTopFloating = $('#js-back-to-top');
    if (!backToTopFloating) {
      backToTopFloating = document.createElement('button');
      backToTopFloating.id = 'js-back-to-top';
      backToTopFloating.type = 'button';
      backToTopFloating.className = 'back-to-top';
      backToTopFloating.setAttribute('aria-label', 'Back to top');
      backToTopFloating.setAttribute('title', 'Back to top');
      backToTopFloating.setAttribute('aria-hidden', 'true');
      backToTopFloating.setAttribute('tabindex', '-1');
      var arrow = document.createElement('span');
      arrow.className = 'back-to-top__icon';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '\u2191';
      backToTopFloating.appendChild(arrow);
      document.body.appendChild(backToTopFloating);
    }
    backToTopFloating.addEventListener('click', function (event) {
      event.preventDefault();
      scrollToY(0);
    });
    updateBackToTop();
    onScrollThrottled(function () {
      updateBackToTop();
      var visible = scrollY() > 600;
      backToTopFloating.setAttribute('aria-hidden', visible ? 'false' : 'true');
      backToTopFloating.setAttribute('tabindex', visible ? '0' : '-1');
    });
  }
  var THEME_STORAGE_KEY = 'pinvibe-theme';
  var themeToggles = [];
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  function applyTheme(theme) {
    var value = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', value);
    themeToggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', value === 'dark' ? 'true' : 'false');
      btn.setAttribute('data-theme-state', value);
      btn.setAttribute('aria-label',
        value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title',
        value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function initDarkMode() {
    themeToggles = $$('#js-theme-toggle, [data-theme-toggle]');
    var saved = storageGet(THEME_STORAGE_KEY);
    var initial = 'light';
    if (saved === 'dark' || saved === 'light') {
      initial = saved;
    } else if (typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initial = 'dark';
    }
    applyTheme(initial);
    themeToggles.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        storageSet(THEME_STORAGE_KEY, next);
      });
    });
    if (!saved && typeof window.matchMedia === 'function') {
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (event) {
        if (!storageGet(THEME_STORAGE_KEY)) {
          applyTheme(event.matches ? 'dark' : 'light');
        }
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(onChange);
      }
    }
  }
  var progressBar = null;
  var progressFill = null;
  function updateReadingProgress() {
    if (!progressFill) {
      return;
    }
    var total = documentHeight() - window.innerHeight;
    var percent = total > 0 ? Math.min(100, Math.max(0, (scrollY() / total) * 100)) : 0;
    progressFill.style.width = percent.toFixed(2) + '%';
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(Math.round(percent)));
    }
  }
  function initReadingProgress() {
    if (!$('.post-body')) {
      return;
    }
    progressBar = $('#js-reading-progress');
    if (progressBar) {
      progressFill = $('.reading-progress__fill', progressBar);
      if (!progressFill) {
        return;
      }
    } else {
      progressBar = document.createElement('div');
      progressBar.id = 'js-reading-progress';
      progressBar.className = 'reading-progress';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-label', 'Reading progress');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');
      progressBar.setAttribute('aria-valuenow', '0');
      progressFill = document.createElement('div');
      progressFill.className = 'reading-progress__fill';
      progressBar.appendChild(progressFill);
      document.body.appendChild(progressBar);
    }
    updateReadingProgress();
    onScrollThrottled(updateReadingProgress);
    window.addEventListener('resize', updateReadingProgress);
  }
  var lightbox = null;
  var lightboxImg = null;
  var lightboxCaption = null;
  var lightboxCounter = null;
  var lightboxImages = [];
  var lightboxIndex = -1;
  var lightboxLastFocus = null;
  function lightboxLargerSrc(src) {
    if (!src || typeof src !== 'string') {
      return src;
    }
    if (/\/s\d+(-[a-z]+)?\//.test(src)) {
      return src.replace(/\/s\d+(-[a-z]+)?\//, '/s1600/');
    }
    return src;
  }
  function buildLightbox() {
    var existing = $('#js-lightbox');
    if (existing) {
      lightbox = existing;
      lightboxImg = $('#js-lightbox-image', lightbox) ||
        $('.lightbox__img', lightbox);
      lightboxCaption = $('#js-lightbox-caption', lightbox) ||
        $('.lightbox__caption', lightbox);
      lightboxCounter = $('.lightbox__counter', lightbox) ||
        $('.lightbox__count', lightbox);
      if (lightboxImg && lightboxImg.getAttribute('src') === '') {
        lightboxImg.removeAttribute('src');
      }
      wireLightbox();
      return;
    }
    lightbox = document.createElement('div');
    lightbox.id = 'js-lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image viewer');
    lightbox.setAttribute('aria-hidden', 'true');
    var backdrop = document.createElement('div');
    backdrop.className = 'lightbox__backdrop';
    backdrop.setAttribute('data-lightbox-close', '');
    lightbox.appendChild(backdrop);
    var figure = document.createElement('figure');
    figure.className = 'lightbox__figure';
    lightboxImg = document.createElement('img');
    lightboxImg.className = 'lightbox__img';
    lightboxImg.alt = '';
    figure.appendChild(lightboxImg);
    lightboxCaption = document.createElement('figcaption');
    lightboxCaption.className = 'lightbox__caption';
    figure.appendChild(lightboxCaption);
    lightbox.appendChild(figure);
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox__close';
    closeBtn.setAttribute('aria-label', 'Close image viewer');
    closeBtn.setAttribute('data-lightbox-close', '');
    closeBtn.textContent = '\u00D7';
    lightbox.appendChild(closeBtn);
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'lightbox__prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.setAttribute('data-lightbox-prev', '');
    prevBtn.textContent = '\u2039';
    lightbox.appendChild(prevBtn);
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'lightbox__next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.setAttribute('data-lightbox-next', '');
    nextBtn.textContent = '\u203A';
    lightbox.appendChild(nextBtn);
    lightboxCounter = document.createElement('div');
    lightboxCounter.className = 'lightbox__counter';
    lightboxCounter.setAttribute('aria-live', 'polite');
    lightbox.appendChild(lightboxCounter);
    document.body.appendChild(lightbox);
    wireLightbox();
  }
  function wireLightbox() {
    $$('[data-lightbox-close]', lightbox).forEach(function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        closeLightbox();
      });
    });
    $('[data-lightbox-prev]', lightbox).addEventListener('click', function (event) {
      event.preventDefault();
      showLightboxImage(lightboxIndex - 1);
    });
    $('[data-lightbox-next]', lightbox).addEventListener('click', function (event) {
      event.preventDefault();
      showLightboxImage(lightboxIndex + 1);
    });
    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showLightboxImage(lightboxIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showLightboxImage(lightboxIndex + 1);
      } else {
        trapTabKey(event, lightbox);
      }
    });
  }
  function collectPostImages() {
    lightboxImages = $$('.post-body img').filter(function (img) {
      var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      return src.length > 0;
    });
  }
  function showLightboxImage(index) {
    if (!lightboxImages.length || !lightboxImg) {
      return;
    }
    var count = lightboxImages.length;
    var wrapped = ((index % count) + count) % count;
    lightboxIndex = wrapped;
    var img = lightboxImages[wrapped];
    var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    lightboxImg.src = lightboxLargerSrc(src);
    lightboxImg.alt = img.getAttribute('alt') || '';
    var captionText = img.getAttribute('alt') ||
      (img.getAttribute('title') || '');
    lightboxCaption.textContent = captionText;
    lightboxCaption.style.display = captionText ? '' : 'none';
    lightboxCounter.textContent = (wrapped + 1) + ' / ' + count;
    var hasMany = count > 1;
    $$('[data-lightbox-prev], [data-lightbox-next]', lightbox)
      .forEach(function (btn) {
        btn.style.display = hasMany ? '' : 'none';
      });
    lightboxCounter.style.display = hasMany ? '' : 'none';
  }
  function openLightbox(img) {
    collectPostImages();
    var index = lightboxImages.indexOf(img);
    if (index < 0) {
      return;
    }
    if (!lightbox) {
      buildLightbox();
    }
    lightboxLastFocus = img;
    showLightboxImage(index);
    addClass(lightbox, 'is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lockBodyScroll();
    var closeBtn = $('.lightbox__close', lightbox);
    if (closeBtn) {
      closeBtn.focus();
    }
  }
  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) {
      return;
    }
    removeClass(lightbox, 'is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
    lightboxIndex = -1;
    if (lightboxLastFocus && document.contains(lightboxLastFocus)) {
      lightboxLastFocus.focus();
    }
    lightboxLastFocus = null;
  }
  function initLightbox() {
    if (!$('.post-body')) {
      return;
    }
    $$('.post-body img').forEach(function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        openLightbox(img);
      });
      img.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(img);
        }
      });
      if (!img.hasAttribute('tabindex')) {
        img.setAttribute('tabindex', '0');
      }
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label',
        'View image enlarged' + (img.alt ? ': ' + img.alt : ''));
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox &&
        lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }
  function copyTextToClipboard(text, onDone) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(function () {
        onDone(true);
      }, function () {
        copyTextFallback(text, onDone);
      });
    } else {
      copyTextFallback(text, onDone);
    }
  }
  function copyTextFallback(text, onDone) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(textarea);
    onDone(ok);
  }
  function canonicalUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    if (link && link.href) {
      return link.href;
    }
    return window.location.href;
  }
  function initCopyLink() {
    var buttons = $$('#js-copy-link, [data-copy-link]');
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var url = btn.getAttribute('data-copy-url') || canonicalUrl();
        copyTextToClipboard(url, function (ok) {
          if (ok) {
            showToast('Link copied');
            var original = btn.getAttribute('data-original-label');
            if (!original) {
              original = btn.textContent;
              btn.setAttribute('data-original-label', original);
            }
            addClass(btn, 'is-copied');
            btn.textContent = 'Copied!';
            window.setTimeout(function () {
              removeClass(btn, 'is-copied');
              btn.textContent = original;
            }, 2000);
          } else {
            showToast('Copy failed — long-press the address bar to copy');
          }
        });
      });
    });
  }
  function initPrintButton() {
    var buttons = $$('#js-print, [data-print]');
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        window.print();
      });
    });
  }
  var NEWSLETTER_NOTE = 'Newsletter launches soon — thanks for your interest!';
  function newsletterNoteElement(form) {
    var note = $('.newsletter-note, [data-newsletter-note]', form);
    if (note) {
      return note;
    }
    note = document.createElement('p');
    note.className = 'newsletter-note';
    note.setAttribute('role', 'status');
    note.setAttribute('aria-live', 'polite');
    form.appendChild(note);
    return note;
  }
  function initNewsletterForms() {
    var forms = $$('.newsletter-form, [data-newsletter-form]');
    if (!forms.length) {
      return;
    }
    forms.forEach(function (form) {
      var note = newsletterNoteElement(form);
      var emailInput = $('input[type="email"]', form);
      var submitBtn = $('button[type="submit"], input[type="submit"]', form);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email) {
          note.textContent = 'Please enter your email address first.';
          addClass(note, 'is-visible');
          addClass(note, 'is-error');
          if (emailInput) {
            emailInput.focus();
          }
          return;
        }
        if (email.indexOf('@') < 1 || email.indexOf('.') < 0) {
          note.textContent = 'That email address does not look right — please check it.';
          addClass(note, 'is-visible');
          addClass(note, 'is-error');
          if (emailInput) {
            emailInput.focus();
          }
          return;
        }
        removeClass(note, 'is-error');
        note.textContent = NEWSLETTER_NOTE;
        addClass(note, 'is-visible');
        addClass(form, 'is-submitted');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Thanks!';
        }
        showToast(NEWSLETTER_NOTE);
      });
    });
  }
  var HERO_AUTO_MS = 6000;
  var HERO_SWIPE_MIN = 40;
  var heroSlider = null;
  var heroSlides = [];
  var heroDots = [];
  var heroIndex = 0;
  var heroTimer = null;
  var heroPauseBtn = null;
  var heroButtonPaused = false;
  var heroHoverPaused = false;
  var heroTouchStartX = null;
  function heroStopTimer() {
    if (heroTimer !== null) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
  }
  function heroStartTimer() {
    if (prefersReducedMotion() || heroButtonPaused || heroHoverPaused ||
      heroSlides.length < 2) {
      return;
    }
    heroStopTimer();
    heroTimer = window.setInterval(function () {
      heroGoTo(heroIndex + 1);
    }, HERO_AUTO_MS);
  }
  function heroRefreshPause() {
    var paused = heroButtonPaused || heroHoverPaused;
    toggleClass(heroSlider, 'is-paused', paused);
    if (paused) {
      heroStopTimer();
    } else {
      heroStartTimer();
    }
    heroSyncPauseButton();
  }
  function heroSyncPauseButton() {
    if (!heroPauseBtn) {
      return;
    }
    heroPauseBtn.textContent = heroButtonPaused ? 'Play' : 'Pause';
    heroPauseBtn.setAttribute('aria-pressed',
      heroButtonPaused ? 'true' : 'false');
    heroPauseBtn.setAttribute('aria-label', heroButtonPaused ?
      'Resume featured posts' : 'Pause featured posts');
  }
  function heroGoTo(index) {
    if (!heroSlides.length) {
      return;
    }
    var count = heroSlides.length;
    var next = ((index % count) + count) % count;
    heroIndex = next;
    heroSlides.forEach(function (slide, i) {
      var active = i === next;
      toggleClass(slide, 'is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    heroDots.forEach(function (dot, i) {
      var active = i === next;
      toggleClass(dot, 'is-active', active);
      if (active) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
    var counter = $('#js-hero-counter', heroSlider);
    if (counter) {
      counter.textContent = (next + 1) + ' / ' + count;
    }
    var progress = $('.hero-progress', heroSlider);
    if (progress) {
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = '';
    }
  }
  function heroBuildDots() {
    var dotsWrap = $('.hero-dots, [data-hero-dots]', heroSlider);
    if (!dotsWrap) {
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'hero-dots';
      heroSlider.appendChild(dotsWrap);
    }
    dotsWrap.innerHTML = '';
    heroDots = [];
    heroSlides.forEach(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1) +
        ' of ' + heroSlides.length);
      dot.setAttribute('data-hero-dot', String(i));
      dot.addEventListener('click', function (event) {
        event.preventDefault();
        heroGoTo(i);
        heroStartTimer();
      });
      dotsWrap.appendChild(dot);
      heroDots.push(dot);
    });
  }
  function initHeroSlider() {
    heroSlider = $('#js-hero-slider') || $('.hero-slider') || null;
    if (!heroSlider) {
      return;
    }
    heroSlides = $$('.hero-slide, [data-hero-slide]', heroSlider);
    if (!heroSlides.length) {
      return;
    }
    heroSlides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
      if (i === 0) {
        addClass(slide, 'is-active');
      }
    });
    heroIndex = 0;
    var counter = $('#js-hero-counter', heroSlider);
    if (counter) {
      counter.textContent = '1 / ' + heroSlides.length;
    }
    if (heroSlides.length < 2) {
      return;
    }
    heroBuildDots();
    heroPauseBtn = $('#js-hero-pause', heroSlider) ||
      $('[data-hero-pause]', heroSlider);
    if (heroPauseBtn) {
      heroPauseBtn.addEventListener('click', function (event) {
        event.preventDefault();
        heroButtonPaused = !heroButtonPaused;
        heroRefreshPause();
      });
    }
    var prevBtn = $('#js-hero-prev', heroSlider) ||
      $('[data-hero-prev]', heroSlider);
    var nextBtn = $('#js-hero-next', heroSlider) ||
      $('[data-hero-next]', heroSlider);
    if (prevBtn) {
      prevBtn.addEventListener('click', function (event) {
        event.preventDefault();
        heroGoTo(heroIndex - 1);
        heroStartTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (event) {
        event.preventDefault();
        heroGoTo(heroIndex + 1);
        heroStartTimer();
      });
    }
    heroSlider.addEventListener('mouseenter', function () {
      heroHoverPaused = true;
      heroRefreshPause();
    });
    heroSlider.addEventListener('mouseleave', function () {
      heroHoverPaused = false;
      heroRefreshPause();
    });
    heroSlider.addEventListener('focusin', function () {
      heroHoverPaused = true;
      heroRefreshPause();
    });
    heroSlider.addEventListener('focusout', function () {
      heroHoverPaused = false;
      heroRefreshPause();
    });
    heroSlider.addEventListener('touchstart', function (event) {
      if (event.touches.length === 1) {
        heroTouchStartX = event.touches[0].clientX;
      }
    }, { passive: true });
    heroSlider.addEventListener('touchend', function (event) {
      if (heroTouchStartX === null || !event.changedTouches.length) {
        return;
      }
      var dx = event.changedTouches[0].clientX - heroTouchStartX;
      heroTouchStartX = null;
      if (Math.abs(dx) < HERO_SWIPE_MIN) {
        return;
      }
      if (dx < 0) {
        heroGoTo(heroIndex + 1);
      } else {
        heroGoTo(heroIndex - 1);
      }
      heroStartTimer();
    }, { passive: true });
    heroSlider.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        heroGoTo(heroIndex - 1);
        heroStartTimer();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        heroGoTo(heroIndex + 1);
        heroStartTimer();
      }
    });
    heroGoTo(0);
    heroStartTimer();
  }
  function safeInit(name, fn) {
    try {
      fn();
    } catch (err) {
      void name;
      void err;
    }
  }
  function init() {
    safeInit('topbar', initTopbar);
    safeInit('drawer', initDrawer);
    safeInit('dropdowns', initDropdowns);
    safeInit('search', initSearchOverlay);
    safeInit('sticky-header', initStickyHeader);
    safeInit('back-to-top', initBackToTop);
    safeInit('dark-mode', initDarkMode);
    safeInit('reading-progress', initReadingProgress);
    safeInit('lightbox', initLightbox);
    safeInit('copy-link', initCopyLink);
    safeInit('print', initPrintButton);
    safeInit('newsletter', initNewsletterForms);
    safeInit('hero-slider', initHeroSlider);
    if (typeof console !== 'undefined' &&
      typeof console.log === 'function') {
      console.log('PinVibe theme: JS core initialised.');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

'use strict';
(function () {
  function $(selector, context) {
    var root = context || document;
    try {
      return root.querySelector(selector);
    } catch (err) {
      return null;
    }
  }
  function $$(selector, context) {
    var root = context || document;
    var list;
    try {
      list = root.querySelectorAll(selector);
    } catch (err) {
      return [];
    }
    return Array.prototype.slice.call(list);
  }
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }
  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      return false;
    }
  }
  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        timer = null;
        fn.apply(context, args);
      }, wait);
    };
  }
  function escapeHtml(value) {
    var text = String(value == null ? '' : value);
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function cleanText(value) {
    return String(value == null ? '' : value)
      .replace(/\s+/g, ' ')
      .trim();
  }
  function stripHtml(value) {
    var text = String(value == null ? '' : value);
    return cleanText(text.replace(/<[^>]*>/g, ' '));
  }
  function truncateWords(text, max) {
    var clean = cleanText(text);
    if (clean.length <= max) {
      return clean;
    }
    var cut = clean.slice(0, max);
    var lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > max * 0.5) {
      cut = cut.slice(0, lastSpace);
    }
    return cut + '…';
  }
  function slugify(text) {
    var slug = cleanText(text).toLowerCase();
    try {
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    } catch (err) {
    }
    slug = slug
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'section';
  }
  function getCanonicalUrl() {
    var link = $('link[rel="canonical"]');
    if (link && link.href) {
      return link.href;
    }
    return window.location.href.split('#')[0];
  }
  function getPostTitle() {
    var heading = $('.post-title') || $('h1');
    var title = heading ? cleanText(heading.textContent) : '';
    if (!title) {
      title = cleanText(document.title);
    }
    return title || 'PinVibe';
  }
  function normaliseUrl(url) {
    var clean = String(url || '').split('#')[0];
    clean = clean.replace(/[?&]m=[01](&|$)/, function (match, tail) {
      return tail === '&' ? '?' : '';
    });
    clean = clean.replace(/[?&]$/, '');
    if (clean.length > 1) {
      clean = clean.replace(/\/+$/, '');
    }
    return clean;
  }
  function fetchJson(url) {
    if (typeof fetch !== 'function') {
      return Promise.resolve(null);
    }
    return fetch(url, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response || !response.ok) {
          return null;
        }
        return response.json();
      })
      .then(function (data) {
        return data && typeof data === 'object' ? data : null;
      })
      .catch(function () {
        return null;
      });
  }
  function entryUrl(entry) {
    var links = entry && entry.link ? entry.link : [];
    var i;
    var fallback = '';
    for (i = 0; i < links.length; i++) {
      if (links[i] && links[i].href) {
        if (links[i].rel === 'alternate') {
          return links[i].href;
        }
        if (!fallback) {
          fallback = links[i].href;
        }
      }
    }
    return fallback;
  }
  function entryThumbnail(entry, size) {
    var thumb = entry && entry.media$thumbnail ? entry.media$thumbnail.url : '';
    if (!thumb) {
      return '';
    }
    var target = 's' + (size || 400);
    return thumb.replace(/\/s\d+(-c)?\//, '/' + target + '/');
  }
  function entrySummary(entry) {
    if (!entry) {
      return '';
    }
    if (entry.summary && entry.summary.$t) {
      return stripHtml(entry.summary.$t);
    }
    if (entry.content && entry.content.$t) {
      return stripHtml(entry.content.$t);
    }
    return '';
  }
  function hideElement(element) {
    if (!element) {
      return;
    }
    try {
      element.setAttribute('hidden', '');
    } catch (err) {
    }
    element.style.display = 'none';
  }
  function showElement(element) {
    if (!element) {
      return;
    }
    try {
      element.removeAttribute('hidden');
    } catch (err) {
    }
    element.style.display = '';
  }
  var READING_WORDS_PER_MINUTE = 200;
  var READING_MINIMUM_MINUTES = 1;
  function countPostWords() {
    var body = $('.post-body') || $('.post-content');
    if (!body) {
      return 0;
    }
    var text = cleanText(body.textContent);
    if (!text) {
      return 0;
    }
    var words = text.split(' ');
    var count = 0;
    var i;
    for (i = 0; i < words.length; i++) {
      if (words[i].length > 0) {
        count++;
      }
    }
    return count;
  }
  function initReadingTime() {
    var target = $('#js-reading-time');
    if (!target) {
      return;
    }
    var wordCount = countPostWords();
    if (wordCount <= 0) {
      return;
    }
    var minutes = Math.ceil(wordCount / READING_WORDS_PER_MINUTE);
    if (minutes < READING_MINIMUM_MINUTES) {
      minutes = READING_MINIMUM_MINUTES;
    }
    target.textContent = minutes + ' min read';
    try {
      target.setAttribute('data-words', String(wordCount));
      target.setAttribute('data-minutes', String(minutes));
    } catch (err) {
    }
  }
  var TOC_MIN_HEADINGS = 2;
  var TOC_ACTIVE_CLASS = 'toc-active';
  function collectTocHeadings(body) {
    var candidates = $$('h2, h3', body);
    var headings = [];
    var i;
    var el;
    for (i = 0; i < candidates.length; i++) {
      el = candidates[i];
      if (!el || !cleanText(el.textContent)) {
        continue;
      }
      if (el.closest('.recipe-card, blockquote, [data-no-toc]')) {
        continue;
      }
      if (el.offsetParent === null && el.offsetHeight === 0) {
        continue;
      }
      headings.push(el);
    }
    return headings;
  }
  function assignHeadingIds(headings) {
    var used = {};
    var i;
    var heading;
    var id;
    var base;
    var suffix;
    $$('[id]').forEach(function (el) {
      if (el.id) {
        used[el.id] = true;
      }
    });
    for (i = 0; i < headings.length; i++) {
      heading = headings[i];
      id = heading.id ? cleanText(heading.id) : '';
      if (id) {
        if (used[id]) {
          suffix = 2;
          base = id;
          while (used[base + '-' + suffix]) {
            suffix++;
          }
          id = base + '-' + suffix;
        }
        heading.id = id;
        used[id] = true;
        continue;
      }
      base = slugify(heading.textContent);
      id = base;
      suffix = 2;
      while (used[id]) {
        id = base + '-' + suffix;
        suffix++;
      }
      heading.id = id;
      used[id] = true;
    }
  }
  function buildTocList(headings) {
    if (!headings || headings.length === 0) {
      return null;
    }
    var root = document.createElement('ul');
    root.className = 'toc-list';
    var currentParent = root;
    var currentSubList = null;
    var i;
    var heading;
    var item;
    var link;
    for (i = 0; i < headings.length; i++) {
      heading = headings[i];
      item = document.createElement('li');
      item.className = heading.tagName.toLowerCase() === 'h3'
        ? 'toc-item toc-item-h3'
        : 'toc-item toc-item-h2';
      link = document.createElement('a');
      link.className = 'toc-link';
      link.href = '#' + heading.id;
      link.textContent = cleanText(heading.textContent);
      link.setAttribute('data-heading-id', heading.id);
      item.appendChild(link);
      if (heading.tagName.toLowerCase() === 'h2') {
        root.appendChild(item);
        currentParent = item;
        currentSubList = null;
      } else {
        if (!currentSubList) {
          currentSubList = document.createElement('ul');
          currentSubList.className = 'toc-sublist';
          currentParent.appendChild(currentSubList);
        }
        currentSubList.appendChild(item);
      }
    }
    return root;
  }
  function bindTocClicks(tocContainer) {
    var links = $$('a.toc-link', tocContainer);
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('data-heading-id') || '';
        var target = id ? document.getElementById(id) : null;
        if (!target) {
          return;
        }
        event.preventDefault();
        var behaviour = prefersReducedMotion() ? 'auto' : 'smooth';
        try {
          target.scrollIntoView({ behavior: behaviour, block: 'start' });
        } catch (err) {
          target.scrollIntoView();
        }
        try {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#' + id);
          }
        } catch (err) {
        }
      });
    });
  }
  function initTocScrollSpy(tocContainer, headings) {
    var links = $$('a.toc-link', tocContainer);
    if (links.length === 0 || headings.length === 0) {
      return;
    }
    var byId = {};
    links.forEach(function (link) {
      var id = link.getAttribute('data-heading-id');
      if (id) {
        byId[id] = link;
      }
    });
    function setActive(id) {
      links.forEach(function (link) {
        if (link.getAttribute('data-heading-id') === id) {
          link.classList.add(TOC_ACTIVE_CLASS);
          link.setAttribute('aria-current', 'true');
        } else {
          link.classList.remove(TOC_ACTIVE_CLASS);
          link.removeAttribute('aria-current');
        }
      });
    }
    if (typeof IntersectionObserver === 'function') {
      var visible = {};
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        var current = null;
        var i;
        for (i = 0; i < headings.length; i++) {
          if (visible[headings[i].id]) {
            current = headings[i].id;
            break;
          }
        }
        if (!current) {
          var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
          for (i = headings.length - 1; i >= 0; i--) {
            if (headings[i].getBoundingClientRect().top + scrollTop <= scrollTop + 140) {
              current = headings[i].id;
              break;
            }
          }
        }
        if (current) {
          setActive(current);
        }
      }, { rootMargin: '-10% 0px -75% 0px', threshold: 0 });
      headings.forEach(function (heading) {
        observer.observe(heading);
      });
      return;
    }
    var ticking = false;
    function onScroll() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var current = null;
        var i;
        for (i = headings.length - 1; i >= 0; i--) {
          if (headings[i].getBoundingClientRect().top <= 140) {
            current = headings[i].id;
            break;
          }
        }
        if (current) {
          setActive(current);
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  function initTocToggle(tocContainer) {
    var toggle = $('#js-toc-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      var box = null;
      try {
        box = tocContainer.closest('.post-toc, [data-toc-box]');
      } catch (err) {
        box = null;
      }
      if (!box) {
        box = tocContainer;
      }
      var collapsed = box.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.textContent = collapsed ? 'Show' : 'Hide';
    });
  }
  function initToc() {
    var tocContainer = $('#js-toc');
    if (!tocContainer) {
      return;
    }
    initTocToggle(tocContainer);
    var body = $('.post-body');
    if (!body) {
      hideTocBox(tocContainer);
      return;
    }
    var headings = collectTocHeadings(body);
    if (headings.length < TOC_MIN_HEADINGS) {
      hideTocBox(tocContainer);
      return;
    }
    assignHeadingIds(headings);
    var list = buildTocList(headings);
    if (!list) {
      hideTocBox(tocContainer);
      return;
    }
    tocContainer.innerHTML = '';
    tocContainer.appendChild(list);
    showTocBox(tocContainer);
    bindTocClicks(tocContainer);
    initTocScrollSpy(tocContainer, headings);
  }
  function hideTocBox(tocContainer) {
    var box = null;
    try {
      box = tocContainer.closest('.toc-box, [data-toc-box], aside, section');
    } catch (err) {
      box = null;
    }
    if (box && box !== tocContainer && box.querySelector('#js-toc')) {
      hideElement(box);
    } else {
      hideElement(tocContainer);
    }
  }
  function showTocBox(tocContainer) {
    var box = null;
    try {
      box = tocContainer.closest('.toc-box, [data-toc-box], aside, section');
    } catch (err) {
      box = null;
    }
    if (box && box !== tocContainer && box.querySelector('#js-toc')) {
      showElement(box);
    }
    showElement(tocContainer);
  }
  var RELATED_MAX_RESULTS = 4;
  var RELATED_MAX_CARDS = 3;
  var RELATED_THUMB_SIZE = 400;
  function getFirstPostLabel(container) {
    var label = container.getAttribute('data-label');
    if (label) {
      return cleanText(label);
    }
    var firstLink = $('.post-labels a');
    if (firstLink) {
      return cleanText(firstLink.textContent);
    }
    return '';
  }
  function relatedFeedUrl(label) {
    return '/feeds/posts/default/-/' + encodeURIComponent(label) +
      '?alt=json&max-results=' + RELATED_MAX_RESULTS;
  }
  function buildRelatedCard(entry, label) {
    var url = entryUrl(entry);
    var title = entry && entry.title && entry.title.$t
      ? cleanText(entry.title.$t)
      : 'Untitled post';
    var thumb = entryThumbnail(entry, RELATED_THUMB_SIZE);
    var card = document.createElement('a');
    card.className = 'related-card';
    card.href = url;
    if (thumb) {
      var thumbWrap = document.createElement('div');
      thumbWrap.className = 'related-card__thumb';
      var img = document.createElement('img');
      img.src = thumb;
      img.alt = '';
      img.loading = 'lazy';
      img.setAttribute('decoding', 'async');
      thumbWrap.appendChild(img);
      card.appendChild(thumbWrap);
    }
    var body = document.createElement('div');
    body.className = 'related-card__body';
    if (label) {
      var labelEl = document.createElement('span');
      labelEl.className = 'related-card__label';
      labelEl.textContent = label;
      body.appendChild(labelEl);
    }
    var titleEl = document.createElement('h3');
    titleEl.className = 'related-card__title';
    titleEl.textContent = title;
    body.appendChild(titleEl);
    card.appendChild(body);
    return card;
  }
  function hideRelatedSection(container) {
    var section = null;
    try {
      section = container.closest('[data-related-section], section, aside, div');
    } catch (err) {
      section = null;
    }
    if (section && section !== container && section.querySelector('#js-related-posts')) {
      hideElement(section);
    } else {
      hideElement(container);
    }
  }
  function initRelatedPosts() {
    var container = $('#js-related-posts');
    if (!container) {
      return;
    }
    var label = getFirstPostLabel(container);
    if (!label) {
      hideRelatedSection(container);
      return;
    }
    if (typeof fetch !== 'function') {
      hideRelatedSection(container);
      return;
    }
    var currentUrl = normaliseUrl(getCanonicalUrl());
    fetchJson(relatedFeedUrl(label)).then(function (data) {
      var entries = data && data.feed && data.feed.entry ? data.feed.entry : [];
      var cards = [];
      var i;
      var entry;
      for (i = 0; i < entries.length && cards.length < RELATED_MAX_CARDS; i++) {
        entry = entries[i];
        var url = entryUrl(entry);
        if (!url || normaliseUrl(url) === currentUrl) {
          continue;
        }
        cards.push(buildRelatedCard(entry, label));
      }
      if (cards.length < 1) {
        hideRelatedSection(container);
        return;
      }
      container.innerHTML = '';
      cards.forEach(function (card) {
        container.appendChild(card);
      });
      showElement(container);
    }).catch(function () {
      hideRelatedSection(container);
    });
  }
  var SEARCH_DEBOUNCE_MS = 300;
  var SEARCH_MAX_RESULTS = 6;
  var SEARCH_SNIPPET_LENGTH = 120;
  function searchFeedUrl(query) {
    return '/feeds/posts/default?q=' + encodeURIComponent(query) +
      '&alt=json&max-results=' + SEARCH_MAX_RESULTS;
  }
  function renderSearchResults(container, entries, query) {
    container.innerHTML = '';
    if (!entries || entries.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'search-no-results';
      empty.textContent = 'No posts found for "' + query + '". Try a different word.';
      container.appendChild(empty);
      return;
    }
    var list = document.createElement('ul');
    list.className = 'search-results-list';
    entries.forEach(function (entry) {
      var url = entryUrl(entry);
      if (!url) {
        return;
      }
      var title = entry && entry.title && entry.title.$t
        ? cleanText(entry.title.$t)
        : 'Untitled post';
      var snippet = truncateWords(entrySummary(entry), SEARCH_SNIPPET_LENGTH);
      var item = document.createElement('li');
      item.className = 'search-result-item';
      var link = document.createElement('a');
      link.className = 'search-result-link';
      link.href = url;
      var titleEl = document.createElement('span');
      titleEl.className = 'search-result-title';
      titleEl.textContent = title;
      link.appendChild(titleEl);
      if (snippet) {
        var snippetEl = document.createElement('span');
        snippetEl.className = 'search-result-snippet';
        snippetEl.textContent = snippet;
        link.appendChild(snippetEl);
      }
      item.appendChild(link);
      list.appendChild(item);
    });
    container.appendChild(list);
  }
  function renderSearchError(container) {
    container.innerHTML = '';
    var note = document.createElement('p');
    note.className = 'search-no-results search-error';
    note.textContent = 'Search is unavailable right now. Please try again in a moment.';
    container.appendChild(note);
  }
  function initLiveSearch() {
    var input = $('#js-search-input');
    var results = $('#js-search-results');
    if (!input || !results) {
      return;
    }
    if (typeof fetch !== 'function') {
      return;
    }
    try {
      results.setAttribute('aria-live', 'polite');
    } catch (err) {
    }
    var requestId = 0;
    var lastQuery = '';
    function runSearch(query) {
      var myId = ++requestId;
      fetchJson(searchFeedUrl(query)).then(function (data) {
        if (myId !== requestId) {
          return;
        }
        var entries = data && data.feed && data.feed.entry ? data.feed.entry : [];
        renderSearchResults(results, entries, query);
      }).catch(function () {
        if (myId !== requestId) {
          return;
        }
        renderSearchError(results);
      });
    }
    var debouncedSearch = debounce(function () {
      var query = cleanText(input.value);
      if (!query) {
        results.innerHTML = '';
        lastQuery = '';
        return;
      }
      if (query === lastQuery) {
        return;
      }
      lastQuery = query;
      runSearch(query);
    }, SEARCH_DEBOUNCE_MS);
    input.addEventListener('input', debouncedSearch);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' || event.keyCode === 27) {
        input.value = '';
        results.innerHTML = '';
        lastQuery = '';
        requestId++;
        input.blur();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' || event.keyCode === 27) {
        if (results.innerHTML) {
          results.innerHTML = '';
          lastQuery = '';
          requestId++;
        }
      }
    });
  }
  function initLazyLoad() {
    var images = $$('img');
    if (images.length === 0) {
      return;
    }
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    images.forEach(function (img) {
      if (!img || img.getAttribute('loading')) {
        return;
      }
      if (img.closest('.post-hero, #js-hero, [data-hero], header, .site-header, .logo, nav, [data-no-lazy]')) {
        return;
      }
      var rect = null;
      try {
        rect = img.getBoundingClientRect();
      } catch (err) {
        rect = null;
      }
      if (rect && rect.top <= viewportHeight) {
        return;
      }
      img.setAttribute('loading', 'lazy');
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }
  function buildShareUrls() {
    var url = getCanonicalUrl();
    var title = getPostTitle();
    var encodedUrl = encodeURIComponent(url);
    var encodedTitle = encodeURIComponent(title);
    var targets = {
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl,
      x: 'https://twitter.com/intent/tweet?url=' + encodedUrl +
        '&text=' + encodedTitle,
      twitter: 'https://twitter.com/intent/tweet?url=' + encodedUrl +
        '&text=' + encodedTitle,
      whatsapp: 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url)
    };
    var byId = {
      '#js-share-facebook': targets.facebook,
      '#js-share-x': targets.x,
      '#js-share-twitter': targets.twitter,
      '#js-share-whatsapp': targets.whatsapp
    };
    var selector;
    for (selector in byId) {
      if (Object.prototype.hasOwnProperty.call(byId, selector)) {
        var link = $(selector);
        if (link && link.tagName && link.tagName.toLowerCase() === 'a') {
          link.href = byId[selector];
          if (!link.getAttribute('rel')) {
            link.setAttribute('rel', 'noopener nofollow');
          }
          if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
          }
        }
      }
    }
    $$('[data-share]').forEach(function (link) {
      var network = (link.getAttribute('data-share') || '').toLowerCase();
      var href = targets[network];
      if (!href) {
        return;
      }
      link.href = href;
      if (!link.getAttribute('rel')) {
        link.setAttribute('rel', 'noopener nofollow');
      }
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
      }
    });
  }
  function initShareUrls() {
    buildShareUrls();
  }
  function initJumpToRecipe() {
    var button = $('.jump-to-recipe');
    if (!button) {
      return;
    }
    if (!document.getElementById('recipe-card')) {
      hideElement(button);
    }
  }
  function boot() {
    var features = [
      initReadingTime,
      initToc,
      initJumpToRecipe,
      initRelatedPosts,
      initLiveSearch,
      initLazyLoad,
      initShareUrls
    ];
    features.forEach(function (feature) {
      try {
        feature();
      } catch (err) {
      }
    });
  }
  onReady(boot);
})();
