var Storage = {
  TOKEN_KEY: 'anixart_token',
  TOKEN_ID_KEY: 'anixart_token_id',
  PROFILE_KEY: 'anixart_profile',
  THEME_KEY: 'anixart_theme',

  setToken: function(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  getToken: function() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setTokenId: function(id) {
    localStorage.setItem(this.TOKEN_ID_KEY, String(id));
  },

  getTokenId: function() {
    var val = localStorage.getItem(this.TOKEN_ID_KEY);
    return val ? parseInt(val, 10) : null;
  },

  setProfile: function(profile) {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  },

  getProfile: function() {
    var val = localStorage.getItem(this.PROFILE_KEY);
    return val ? JSON.parse(val) : null;
  },

  getTheme: function() {
    return localStorage.getItem(this.THEME_KEY) || 'dark';
  },

  setTheme: function(theme) {
    localStorage.setItem(this.THEME_KEY, theme);
  },

  isLoggedIn: function() {
    return !!this.getToken();
  },

  clearAuth: function() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_ID_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
  }
};
