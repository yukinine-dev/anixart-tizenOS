var App = {
  history: [],
  currentScreen: null,

  init: function() {
    document.documentElement.setAttribute('data-theme', Storage.getTheme());

    if (typeof Debug !== 'undefined') Debug.init();
    FocusManager.init();

    if (typeof tizen !== 'undefined') {
      try {
        tizen.tvinputdevice.registerKeyBatch([
          'MediaPlay', 'MediaPause', 'MediaPlayPause',
          'MediaStop', 'MediaFastForward', 'MediaRewind',
          'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
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
    if (typeof Debug !== 'undefined') Debug.logNav('screen', name + (params ? ' ' + JSON.stringify(params) : ''));
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
      case 'profile':
        ProfileScreen.render();
        break;
    }
  },

  goBack: function() {
    if (typeof Debug !== 'undefined') Debug.logNav('back', 'from ' + this.currentScreen);
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
        case 'profile':
          ProfileScreen.render();
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
