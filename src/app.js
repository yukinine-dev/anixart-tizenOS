var App = {
  history: [],
  currentScreen: null,

  init: function() {
    var theme = 'dark';
    try { theme = Storage.getTheme() || 'dark'; } catch(e) {}
    document.documentElement.setAttribute('data-theme', theme);

    if (typeof Debug !== 'undefined') Debug.init();
    FocusManager.init();

    if (typeof tizen !== 'undefined') {
      var keys = [
        'MediaPlay', 'MediaPause', 'MediaPlayPause',
        'MediaStop', 'MediaFastForward', 'MediaRewind',
        'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'
      ];
      try {
        tizen.tvinputdevice.registerKeyBatch(keys);
      } catch (e1) {
        for (var i = 0; i < keys.length; i++) {
          try { tizen.tvinputdevice.registerKey(keys[i]); } catch (e2) {}
        }
      }
      if (typeof Debug !== 'undefined') Debug.log('info', 'Tizen keys registered');
    } else {
      if (typeof Debug !== 'undefined') Debug.log('warn', 'tizen object not found');
    }

    if (Storage.isLoggedIn()) {
      this.showScreen('home');
    } else {
      this.showScreen('login');
    }
  },

  showScreen: function(name, params) {
    if (typeof Debug !== 'undefined') Debug.logNav('screen', name + (params ? ' ' + JSON.stringify(params) : ''));

    if (this.currentScreen === 'player' && name !== 'player') {
      PlayerScreen.destroy();
    }

    if (this.currentScreen && this.currentScreen !== name) {
      this.history.push({ name: this.currentScreen, params: this.currentParams });
    }
    this.currentScreen = name;
    this.currentParams = params;

    switch (name) {
      case 'login':
        LoginScreen.render();
        break;
      case 'home':
        HomeScreen.render();
        break;
      case 'details':
        DetailsScreen.render(params);
        break;
      case 'search':
        SearchScreen.render();
        break;
      case 'player':
        PlayerScreen.render(params);
        break;
      case 'bookmarks':
        BookmarksScreen.render();
        break;
      case 'feed':
        FeedScreen.render();
        break;
      case 'profile':
        ProfileScreen.render();
        break;
    }
  },

  goBack: function() {
    if (typeof Debug !== 'undefined') Debug.logNav('back', 'from ' + this.currentScreen);

    if (this.currentScreen === 'player') {
      PlayerScreen.destroy();
    }

    if (this.history.length > 0) {
      var prev = this.history.pop();
      this.currentScreen = prev.name;
      this.currentParams = prev.params;
      switch (prev.name) {
        case 'login':
          LoginScreen.render();
          break;
        case 'home':
          HomeScreen.render();
          break;
        case 'details':
          DetailsScreen.render(prev.params);
          break;
        case 'search':
          SearchScreen.render();
          break;
        case 'player':
          PlayerScreen.render(prev.params);
          break;
        case 'bookmarks':
          BookmarksScreen.render();
          break;
        case 'feed':
          FeedScreen.render();
          break;
        case 'profile':
          ProfileScreen.render();
          break;
      }
    } else if (this.currentScreen !== 'home' && Storage.isLoggedIn()) {
      this.currentScreen = 'home';
      HomeScreen.render();
    } else {
      this.showExitDialog();
    }
  },

  showExitDialog: function() {
    if (document.getElementById('exit-dialog')) return;

    var prevFocused = FocusManager.currentFocused;

    var overlay = document.createElement('div');
    overlay.id = 'exit-dialog';
    overlay.className = 'exit-overlay';

    var closeDialog = function() {
      overlay.remove();
      if (prevFocused) FocusManager.setFocus(prevFocused);
    };
    overlay.closeDialog = closeDialog;

    var box = document.createElement('div');
    box.className = 'exit-box';

    var title = document.createElement('div');
    title.className = 'exit-title';
    title.textContent = 'Выйти из приложения?';
    box.appendChild(title);

    var buttons = document.createElement('div');
    buttons.className = 'exit-buttons';

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'exit-btn exit-btn-cancel';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.setAttribute('data-focusable', 'true');
    cancelBtn.addEventListener('click', closeDialog);
    buttons.appendChild(cancelBtn);

    var exitBtn = document.createElement('button');
    exitBtn.className = 'exit-btn exit-btn-confirm';
    exitBtn.textContent = 'Выйти';
    exitBtn.setAttribute('data-focusable', 'true');
    exitBtn.addEventListener('click', function() {
      if (typeof tizen !== 'undefined') {
        tizen.application.getCurrentApplication().exit();
      }
    });
    buttons.appendChild(exitBtn);

    box.appendChild(buttons);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    FocusManager.setFocus(cancelBtn);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
