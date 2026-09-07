var BottomNav = {
  tabs: [
    { id: 'home', label: 'Главная', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/></svg>' },
    { id: 'discover', label: 'Обзор', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" fill="currentColor"/></svg>' },
    { id: 'bookmarks', label: 'Закладки', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>' },
    { id: 'feed', label: 'Лента', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="currentColor"/></svg>' },
    { id: 'profile', label: 'Профиль', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>' }
  ],

  render: function(activeTab) {
    var nav = document.createElement('div');
    nav.className = 'bottom-nav';

    for (var i = 0; i < this.tabs.length; i++) {
      var tab = this.tabs[i];
      var btn = document.createElement('button');
      btn.className = 'nav-tab' + (tab.id === activeTab ? ' active' : '');
      btn.setAttribute('data-focusable', 'true');
      btn.setAttribute('data-tab', tab.id);

      var indicator = document.createElement('div');
      indicator.className = 'nav-indicator';

      var iconWrap = document.createElement('span');
      iconWrap.className = 'nav-icon';
      iconWrap.innerHTML = tab.icon;
      indicator.appendChild(iconWrap);
      btn.appendChild(indicator);

      var label = document.createElement('span');
      label.className = 'nav-label';
      label.textContent = tab.label;
      btn.appendChild(label);

      (function(tabId) {
        btn.addEventListener('click', function() {
          BottomNav.onTabClick(tabId);
        });
      })(tab.id);

      nav.appendChild(btn);
    }

    return nav;
  },

  onTabClick: function(tabId) {
    switch (tabId) {
      case 'home':
        App.showScreen('home');
        break;
      case 'discover':
        App.showScreen('search');
        break;
      case 'bookmarks':
        App.showScreen('bookmarks');
        break;
      case 'feed':
        App.showScreen('feed');
        break;
      case 'profile':
        App.showScreen('profile');
        break;
    }
  }
};
