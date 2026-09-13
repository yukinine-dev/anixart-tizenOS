var FocusManager = {
  currentFocused: null,
  sections: [],
  inputActive: false,

  init: function() {
    var self = this;
    var handled = {};
    var handler = function(e) {
      if (handled[e.timeStamp]) return;
      handled[e.timeStamp] = true;
      self.handleKey(e);
    };
    document.addEventListener('keydown', handler);
    window.addEventListener('keydown', handler);

    document.body.setAttribute('tabindex', '0');
    document.body.focus();

    if (typeof Debug !== 'undefined') Debug.log('info', 'FocusManager.init() done');
  },

  isInputActive: function() {
    var ae = document.activeElement;
    return ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
  },

  handleKey: function(e) {
    var keyCode = e.keyCode;

    if (typeof PlayerScreen !== 'undefined' && App.currentScreen === 'player') {
      if (PlayerScreen.handleKey(keyCode)) {
        e.preventDefault();
        return;
      }
    }

    if (this.isInputActive()) {
      if (keyCode === 40) {
        e.preventDefault();
        document.activeElement.blur();
        document.body.focus();
        this.moveFocus('down');
        return;
      }
      if (keyCode === 10009) {
        e.preventDefault();
        document.activeElement.blur();
        document.body.focus();
        return;
      }
      return;
    }

    switch (keyCode) {
      case 37: // Left
        e.preventDefault();
        this.moveFocus('left');
        break;
      case 38: // Up
        e.preventDefault();
        this.moveFocus('up');
        break;
      case 39: // Right
        e.preventDefault();
        this.moveFocus('right');
        break;
      case 40: // Down
        e.preventDefault();
        this.moveFocus('down');
        break;
      case 13: // OK/Enter
        e.preventDefault();
        this.select();
        break;
      case 10009: // Back (Tizen)
      case 8:     // Backspace
        e.preventDefault();
        var popup = document.getElementById('exit-dialog') || document.getElementById('tab-settings-picker') || document.getElementById('bookmark-picker') || document.getElementById('share-dialog') || document.getElementById('voiceover-picker') || document.getElementById('screenshot-viewer') || document.getElementById('player-ep-list');
        if (popup) {
          if (popup.closeDialog) popup.closeDialog();
          else popup.remove();
          return;
        }
        if (typeof App !== 'undefined') {
          App.goBack();
        }
        break;
      case 415: // Play
      case 10252: // Play/Pause (Tizen)
        break;
      case 73: // 'i' key
        if (typeof Debug !== 'undefined') {
          e.preventDefault();
          Debug.toggle();
        }
        break;
      case 403: // Green button (Tizen remote)
        if (typeof Debug !== 'undefined') {
          e.preventDefault();
          Debug.toggle();
        }
        break;
    }
  },

  setFocus: function(el) {
    if (this.currentFocused) {
      this.currentFocused.classList.remove('focused');
    }
    this.currentFocused = el;
    if (el) {
      el.classList.add('focused');
      if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
        if (!el.getAttribute('tabindex')) {
          el.setAttribute('tabindex', '0');
        }
        el.focus();
      }
      this.scrollIntoViewSmart(el);
    }
  },

  scrollIntoViewSmart: function(el) {
    // Element.scrollTo()/scrollBy() aren't implemented on this TV's WebKit --
    // setting scrollTop/scrollLeft directly is the form it actually supports.
    var scrollContainer = el.closest('.section-scroll');
    if (scrollContainer) {
      var elRect = el.getBoundingClientRect();
      var contRect = scrollContainer.getBoundingClientRect();
      if (elRect.left < contRect.left || elRect.right > contRect.right) {
        scrollContainer.scrollLeft = el.offsetLeft - scrollContainer.offsetLeft - 16;
      }
    }

    var mainScroll = document.getElementById('main-scroll');
    if (mainScroll) {
      var elRect2 = el.getBoundingClientRect();
      var viewHeight = window.innerHeight;
      var navHeight = 72;
      if (elRect2.bottom > viewHeight - navHeight || elRect2.top < 0) {
        mainScroll.scrollTop = el.offsetTop - mainScroll.offsetTop - 100;
      }
    }
  },

  getFocusables: function(container) {
    if (!container) {
      var dialog = document.getElementById('exit-dialog') || document.getElementById('voiceover-picker') || document.getElementById('screenshot-viewer') || document.getElementById('player-speed-list') || document.getElementById('player-quality-list') || document.getElementById('player-ep-list');
      container = dialog || document.getElementById('app');
    }
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll('[data-focusable]'));
  },

  focusFirst: function(container) {
    var items = this.getFocusables(container);
    if (items.length > 0) {
      this.setFocus(items[0]);
    }
  },

  moveFocus: function(direction) {
    if (!this.currentFocused) {
      this.focusFirst();
      return;
    }

    var focusables = this.getFocusables();
    if (focusables.length === 0) return;

    var current = this.currentFocused;
    var currentRect = current.getBoundingClientRect();
    var cx = currentRect.left + currentRect.width / 2;
    var cy = currentRect.top + currentRect.height / 2;
    var horizontal = (direction === 'left' || direction === 'right');
    var sign = (direction === 'right' || direction === 'down') ? 1 : -1;

    var best = null;
    var bestScore = Infinity;
    // Candidates whose perpendicular range overlaps the current element's
    // (same row for left/right, same column for up/down) are preferred over
    // the raw nearest-center match. Without this, a very wide element (like
    // the full-width search bar) can have its center closer to a card in the
    // row below than to a button sitting right next to it in its own row.
    var ahead = null;
    var aheadScore = Infinity;
    // If nothing lies ahead in the same row, wrap to the far end of that row
    // instead of falling through to unrelated content elsewhere on the
    // screen (e.g. pressing right past the last toolbar icon should cycle
    // back to the search bar, not jump down into a content carousel).
    var wrapTarget = null;
    var wrapExtreme = -Infinity;

    for (var i = 0; i < focusables.length; i++) {
      var el = focusables[i];
      if (el === current) continue;
      if (el.offsetParent === null) continue;

      var rect = el.getBoundingClientRect();
      var ex = rect.left + rect.width / 2;
      var ey = rect.top + rect.height / 2;

      var dx = ex - cx;
      var dy = ey - cy;
      var signedPrimary = horizontal ? dx : dy;
      var primary = Math.abs(signedPrimary);
      var secondary = horizontal ? Math.abs(dy) : Math.abs(dx);
      var valid = signedPrimary * sign > 5;

      var overlaps;
      if (horizontal) {
        overlaps = Math.min(currentRect.top + currentRect.height, rect.top + rect.height) - Math.max(currentRect.top, rect.top) > 0;
      } else {
        overlaps = Math.min(currentRect.left + currentRect.width, rect.left + rect.width) - Math.max(currentRect.left, rect.left) > 0;
      }

      if (valid) {
        var score = secondary * 3 + primary;
        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
        if (overlaps && primary < aheadScore) {
          aheadScore = primary;
          ahead = el;
        }
      } else if (overlaps) {
        var behindExtreme = -signedPrimary * sign;
        if (behindExtreme > wrapExtreme) {
          wrapExtreme = behindExtreme;
          wrapTarget = el;
        }
      }
    }

    var winner = ahead || (horizontal ? wrapTarget : null) || best;
    if (winner) {
      this.setFocus(winner);
    } else if (direction === 'up' || direction === 'down') {
      // Nothing focusable further in that direction (e.g. static content
      // like descriptions, ratings, comments) -- scroll the page manually
      // so it stays reachable with a D-pad instead of getting stuck.
      var scrollEl = document.getElementById('main-scroll');
      if (scrollEl) {
        scrollEl.scrollTop += (direction === 'down' ? 300 : -300);
      }
    }
  },

  select: function() {
    if (this.currentFocused) {
      var el = this.currentFocused;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.focus();
      } else {
        el.click();
      }
    }
  }
};
