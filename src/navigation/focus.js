var FocusManager = {
  currentFocused: null,
  sections: [],

  init: function() {
    var self = this;
    document.addEventListener('keydown', function(e) {
      self.handleKey(e);
    });
  },

  handleKey: function(e) {
    var keyCode = e.keyCode;

    if (typeof PlayerScreen !== 'undefined' && App.currentScreen === 'player') {
      if (PlayerScreen.handleKey(keyCode)) {
        e.preventDefault();
        return;
      }
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
        var popup = document.getElementById('bookmark-picker') || document.getElementById('share-dialog') || document.getElementById('player-ep-list');
        if (popup) {
          popup.remove();
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
      this.scrollIntoViewSmart(el);
    }
  },

  scrollIntoViewSmart: function(el) {
    var scrollContainer = el.closest('.section-scroll');
    if (scrollContainer) {
      var elRect = el.getBoundingClientRect();
      var contRect = scrollContainer.getBoundingClientRect();
      if (elRect.left < contRect.left || elRect.right > contRect.right) {
        var scrollLeft = el.offsetLeft - scrollContainer.offsetLeft - 16;
        scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }

    var mainScroll = document.getElementById('main-scroll');
    if (mainScroll) {
      var elRect = el.getBoundingClientRect();
      var viewHeight = window.innerHeight;
      var navHeight = 72;
      if (elRect.bottom > viewHeight - navHeight || elRect.top < 0) {
        var scrollTop = el.offsetTop - mainScroll.offsetTop - 100;
        mainScroll.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }
  },

  getFocusables: function(container) {
    container = container || document.getElementById('app');
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

    var best = null;
    var bestScore = Infinity;

    for (var i = 0; i < focusables.length; i++) {
      var el = focusables[i];
      if (el === current) continue;
      if (el.offsetParent === null) continue;

      var rect = el.getBoundingClientRect();
      var ex = rect.left + rect.width / 2;
      var ey = rect.top + rect.height / 2;

      var dx = ex - cx;
      var dy = ey - cy;

      var valid = false;
      var primary, secondary;

      switch (direction) {
        case 'left':
          valid = dx < -5;
          primary = Math.abs(dx);
          secondary = Math.abs(dy);
          break;
        case 'right':
          valid = dx > 5;
          primary = Math.abs(dx);
          secondary = Math.abs(dy);
          break;
        case 'up':
          valid = dy < -5;
          primary = Math.abs(dy);
          secondary = Math.abs(dx);
          break;
        case 'down':
          valid = dy > 5;
          primary = Math.abs(dy);
          secondary = Math.abs(dx);
          break;
      }

      if (!valid) continue;

      var score = secondary * 3 + primary;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (best) {
      this.setFocus(best);
    }
  },

  select: function() {
    if (this.currentFocused) {
      this.currentFocused.click();
    }
  }
};
