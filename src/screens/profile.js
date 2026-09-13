var ProfileScreen = {
  profileData: null,
  viewedProfileId: null,

  render: function(params) {
    params = params || {};
    var ownId = Storage.getTokenId();
    this.viewedProfileId = (params.profileId && String(params.profileId) !== String(ownId)) ? params.profileId : null;

    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-profile';

    if (!Storage.isLoggedIn()) {
      this.renderNotLoggedIn(container);
      return;
    }

    if (this.viewedProfileId) {
      var toolbar = document.createElement('div');
      toolbar.className = 'bookmarks-toolbar';

      var backBtn = document.createElement('button');
      backBtn.className = 'search-back-btn';
      backBtn.setAttribute('data-focusable', 'true');
      backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
      backBtn.addEventListener('click', function() { App.goBack(); });
      toolbar.appendChild(backBtn);

      container.appendChild(toolbar);
    }

    var content = document.createElement('div');
    content.className = 'profile-content' + (this.viewedProfileId ? ' profile-content-viewing' : '');
    content.id = 'profile-content';
    content.innerHTML = '<div class="profile-loading"><div class="spinner"></div></div>';
    container.appendChild(content);

    if (!this.viewedProfileId) {
      var bottomNav = BottomNav.render('profile');
      container.appendChild(bottomNav);
    }

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
    var self = this;

    if (this.viewedProfileId) {
      ProfileApi.getProfile(this.viewedProfileId, token).then(function(response) {
        var prof = response.profile || response;
        self.renderProfile(prof, false);
      }).catch(function(err) {
        if (typeof Debug !== 'undefined') Debug.log('error', 'Profile: load other failed', err);
        var content = document.getElementById('profile-content');
        if (content) content.innerHTML = '<div class="bookmarks-empty">Не удалось загрузить профиль</div>';
      });
      return;
    }

    var profile = Storage.getProfile();
    if (profile) {
      this.profileData = profile;
      this.renderProfile(profile, true);
      return;
    }

    var tokenId = Storage.getTokenId();
    if (!tokenId) {
      this.renderProfile({ login: 'Пользователь' }, true);
      return;
    }

    ProfileApi.getProfile(tokenId, token).then(function(response) {
      var prof = response.profile || response;
      self.profileData = prof;
      Storage.setProfile(prof);
      self.renderProfile(prof, true);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Profile: load failed', err);
      self.renderProfile({ login: 'Пользователь' }, true);
    });
  },

  renderProfile: function(profile, isOwn) {
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

    var nameRow = document.createElement('div');
    nameRow.className = 'profile-name-row';

    var name = document.createElement('div');
    name.className = 'profile-name';
    name.textContent = profile.login || 'Пользователь';
    nameRow.appendChild(name);

    if (profile.badge && profile.badge.image_url) {
      var badgeImg = document.createElement('img');
      badgeImg.className = 'profile-badge-icon';
      badgeImg.src = profile.badge.image_url;
      badgeImg.alt = profile.badge.name || '';
      badgeImg.title = profile.badge.name || '';
      nameRow.appendChild(badgeImg);
    }

    info.appendChild(nameRow);

    if (profile.status) {
      var status = document.createElement('div');
      status.className = 'profile-status';
      status.textContent = profile.status;
      info.appendChild(status);
    }

    var metaRow = document.createElement('div');
    metaRow.className = 'profile-meta-row';
    var metaParts = [];
    if (profile.friend_count != null) {
      metaParts.push((profile.friend_count || 0) + ' ' + this.pluralize(profile.friend_count || 0, 'друг', 'друга', 'друзей'));
    }
    if (profile.register_date) {
      metaParts.push('на проекте с ' + this.formatJoinDate(profile.register_date));
    }
    metaRow.textContent = metaParts.join(' • ');
    info.appendChild(metaRow);

    header.appendChild(info);
    content.appendChild(header);

    this.renderWatchStats(content, profile);

    var focusTarget = null;

    if (isOwn) {
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
      focusTarget = menu;
    } else {
      focusTarget = document.getElementById('app');
    }

    setTimeout(function() {
      var first = focusTarget && focusTarget.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  pluralize: function(n, one, few, many) {
    var mod10 = n % 10;
    var mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  },

  formatJoinDate: function(timestamp) {
    var months = ['янв.', 'февр.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'];
    var d = new Date(timestamp * 1000);
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatWatchTime: function(minutes) {
    var days = Math.floor(minutes / 1440);
    var hours = Math.floor((minutes % 1440) / 60);
    var parts = [];
    if (days > 0) parts.push(days + ' ' + this.pluralize(days, 'день', 'дня', 'дней'));
    parts.push(hours + ' ' + this.pluralize(hours, 'час', 'часа', 'часов'));
    return '~' + parts.join(' ');
  },

  renderDonut: function(segments) {
    var total = 0;
    for (var i = 0; i < segments.length; i++) total += segments[i].value;

    var r = 44, cx = 60, cy = 60, strokeWidth = 16;
    var circumference = 2 * Math.PI * r;
    var circles = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#2c2c2c" stroke-width="' + strokeWidth + '"></circle>';

    if (total > 0) {
      var offset = 0;
      for (var j = 0; j < segments.length; j++) {
        var seg = segments[j];
        if (seg.value <= 0) continue;
        var length = (seg.value / total) * circumference;
        circles += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + seg.color + '" stroke-width="' + strokeWidth +
          '" stroke-dasharray="' + length + ' ' + circumference + '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"></circle>';
        offset += length;
      }
    }

    return '<svg width="140" height="140" viewBox="0 0 120 120">' + circles + '</svg>';
  },

  renderWatchStats: function(content, profile) {
    var section = document.createElement('div');
    section.className = 'profile-watch-stats';

    var title = document.createElement('div');
    title.className = 'profile-section-title';
    title.textContent = 'Статистика';
    section.appendChild(title);

    var items = [
      { label: 'Смотрю', value: profile.watching_count || 0, color: '#73c978' },
      { label: 'В планах', value: profile.plan_count || 0, color: '#c373c9' },
      { label: 'Просмотрено', value: profile.completed_count || 0, color: '#6979ce' },
      { label: 'Отложено', value: profile.hold_on_count || 0, color: '#ffd468' },
      { label: 'Брошено', value: profile.dropped_count || 0, color: '#ff605b' }
    ];

    var row = document.createElement('div');
    row.className = 'profile-stats-row';

    var legend = document.createElement('div');
    legend.className = 'profile-stats-legend';
    for (var i = 0; i < items.length; i++) {
      var entry = document.createElement('div');
      entry.className = 'profile-stats-legend-item';
      var dot = document.createElement('span');
      dot.className = 'profile-stats-legend-dot';
      dot.style.background = items[i].color;
      entry.appendChild(dot);
      var text = document.createElement('span');
      text.textContent = items[i].label + ' ' + items[i].value;
      entry.appendChild(text);
      legend.appendChild(entry);
    }
    row.appendChild(legend);

    var donutWrap = document.createElement('div');
    donutWrap.className = 'profile-donut-wrap';
    donutWrap.innerHTML = this.renderDonut(items);
    row.appendChild(donutWrap);

    section.appendChild(row);

    var totals = document.createElement('div');
    totals.className = 'profile-watch-totals';

    var epRow = document.createElement('div');
    epRow.textContent = 'Просмотрено серий: ';
    var epVal = document.createElement('b');
    epVal.textContent = (profile.watched_episode_count || 0).toLocaleString('ru-RU');
    epRow.appendChild(epVal);
    totals.appendChild(epRow);

    var timeRow = document.createElement('div');
    timeRow.textContent = 'Время просмотра: ';
    var timeVal = document.createElement('b');
    timeVal.textContent = this.formatWatchTime(profile.watched_time || 0);
    timeRow.appendChild(timeVal);
    totals.appendChild(timeRow);

    section.appendChild(totals);
    content.appendChild(section);
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
