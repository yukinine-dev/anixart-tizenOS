var App = {
  history: [],
  currentScreen: null,

  init: function() {
    document.documentElement.setAttribute('data-theme', Storage.getTheme());

    FocusManager.init();

    if (typeof tizen !== 'undefined') {
      try {
        tizen.tvinputdevice.registerKeyBatch([
          'MediaPlay', 'MediaPause', 'MediaPlayPause',
          'MediaStop', 'MediaFastForward', 'MediaRewind'
        ]);
      } catch (e) {}
    }

    if (Storage.isLoggedIn()) {
      this.showScreen('home');
    } else {
      this.showScreen('login');
    }
  },

  showScreen: function(name, params) {
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
    }
  },

  goBack: function() {
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
      }
    } else if (this.currentScreen !== 'home' && Storage.isLoggedIn()) {
      this.currentScreen = 'home';
      HomeScreen.render();
    } else {
      if (typeof tizen !== 'undefined') {
        tizen.application.getCurrentApplication().exit();
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
