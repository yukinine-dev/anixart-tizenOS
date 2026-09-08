var ProfileScreen = {
  profileData: null,

  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-profile';

    if (!Storage.isLoggedIn()) {
      this.renderNotLoggedIn(container);
      return;
    }

    var content = document.createElement('div');
    content.className = 'profile-content';
    content.id = 'profile-content';
    content.innerHTML = '<div class="profile-loading"><div class="spinner"></div></div>';
    container.appendChild(content);

    var bottomNav = BottomNav.render('profile');
    container.appendChild(bottomNav);

    this.loadProfile();
  },

  renderNotLoggedIn: function(container) {
    var msg = document.createElement('div');
    msg.className = 'profile-not-logged';

    var icon = document.createElement('div');
    icon.className = 'profile-not-logged-icon';
    icon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" opacity="0.3"/></svg>';
    msg.appendChild(icon);

    var text = document.createElement('div');
    text.className = 'profile-not-logged-text';
    text.textContent = 'Войдите в аккаунт';
    msg.appendChild(text);

    var loginBtn = document.createElement('button');
    loginBtn.className = 'profile-login-btn';
    loginBtn.setAttribute('data-focusable', 'true');
    loginBtn.textContent = 'Войти';
    loginBtn.addEventListener('click', function() { App.showScreen('login'); });
    msg.appendChild(loginBtn);

    container.appendChild(msg);

    var bottomNav = BottomNav.render('profile');
    container.appendChild(bottomNav);

    setTimeout(function() { FocusManager.setFocus(loginBtn); }, 100);
  },

  loadProfile: function() {
    var token = Storage.getToken();
    var profile = Storage.getProfile();

    if (profile) {
      this.profileData = profile;
      this.renderProfile(profile);
      return;
    }

    var tokenId = Storage.getTokenId();
    if (!tokenId) {
      this.renderProfile({ login: 'Пользователь' });
      return;
    }

    var self = this;
    ProfileApi.getProfile(tokenId, token).then(function(response) {
      var prof = response.profile || response;
      self.profileData = prof;
      Storage.setProfile(prof);
      self.renderProfile(prof);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Profile: load failed', err);
      self.renderProfile({ login: 'Пользователь' });
    });
  },

  renderProfile: function(profile) {
    var content = document.getElementById('profile-content');
    if (!content) return;
    content.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'profile-header';

    var avatarWrap = document.createElement('div');
    avatarWrap.className = 'profile-avatar-wrap';

    if (profile.avatar) {
      var avatarImg = document.createElement('img');
      avatarImg.className = 'profile-avatar';
      avatarImg.src = profile.avatar;
      avatarImg.alt = '';
      avatarImg.onerror = function() { this.style.display = 'none'; };
      avatarWrap.appendChild(avatarImg);
    } else {
      var avatarPlaceholder = document.createElement('div');
      avatarPlaceholder.className = 'profile-avatar-placeholder';
      avatarPlaceholder.textContent = (profile.login || 'U').charAt(0).toUpperCase();
      avatarWrap.appendChild(avatarPlaceholder);
    }
    header.appendChild(avatarWrap);

    var info = document.createElement('div');
    info.className = 'profile-info';

    var name = document.createElement('div');
    name.className = 'profile-name';
    name.textContent = profile.login || 'Пользователь';
    info.appendChild(name);

    if (profile.status) {
      var status = document.createElement('div');
      status.className = 'profile-status';
      status.textContent = profile.status;
      info.appendChild(status);
    }

    header.appendChild(info);
    content.appendChild(header);

    var stats = document.createElement('div');
    stats.className = 'profile-stats';

    var statItems = [
      { label: 'Комментарии', value: profile.comments_count || 0 },
      { label: 'Видео', value: profile.video_count || 0 },
      { label: 'Коллекции', value: profile.collections_count || 0 }
    ];

    for (var i = 0; i < statItems.length; i++) {
      var stat = document.createElement('div');
      stat.className = 'profile-stat';

      var val = document.createElement('div');
      val.className = 'profile-stat-value';
      val.textContent = statItems[i].value;
      stat.appendChild(val);

      var label = document.createElement('div');
      label.className = 'profile-stat-label';
      label.textContent = statItems[i].label;
      stat.appendChild(label);

      stats.appendChild(stat);
    }
    content.appendChild(stats);

    var menu = document.createElement('div');
    menu.className = 'profile-menu';

    var menuItems = [
      { id: 'theme', label: 'Тема', sublabel: Storage.getTheme() === 'dark' ? 'Тёмная' : 'Светлая', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="currentColor"/></svg>' },
      { id: 'logout', label: 'Выйти', sublabel: '', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>' }
    ];

    for (var j = 0; j < menuItems.length; j++) {
      var item = menuItems[j];
      var menuItem = document.createElement('button');
      menuItem.className = 'profile-menu-item';
      menuItem.setAttribute('data-focusable', 'true');
      menuItem.setAttribute('data-action', item.id);

      var menuIcon = document.createElement('span');
      menuIcon.className = 'profile-menu-icon';
      menuIcon.innerHTML = item.icon;
      menuItem.appendChild(menuIcon);

      var menuText = document.createElement('div');
      menuText.className = 'profile-menu-text';

      var menuLabel = document.createElement('div');
      menuLabel.className = 'profile-menu-label';
      menuLabel.textContent = item.label;
      menuText.appendChild(menuLabel);

      if (item.sublabel) {
        var menuSub = document.createElement('div');
        menuSub.className = 'profile-menu-sublabel';
        menuSub.textContent = item.sublabel;
        menuText.appendChild(menuSub);
      }

      menuItem.appendChild(menuText);

      (function(actionId) {
        menuItem.addEventListener('click', function() {
          ProfileScreen.onMenuAction(actionId);
        });
      })(item.id);

      menu.appendChild(menuItem);
    }

    content.appendChild(menu);

    setTimeout(function() {
      var first = menu.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  onMenuAction: function(action) {
    switch (action) {
      case 'theme':
        var current = Storage.getTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        Storage.setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
        var sublabel = document.querySelector('[data-action="theme"] .profile-menu-sublabel');
        if (sublabel) sublabel.textContent = next === 'dark' ? 'Тёмная' : 'Светлая';
        break;
      case 'logout':
        Storage.clearAuth();
        App.history = [];
        App.showScreen('login');
        break;
    }
  }
};
