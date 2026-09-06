var BookmarksScreen = {
  currentTab: 'watching',
  tabs: [
    { id: 'watching', label: 'Смотрю', status: 1 },
    { id: 'planned', label: 'В планах', status: 2 },
    { id: 'watched', label: 'Просмотрено', status: 3 },
    { id: 'delayed', label: 'Отложено', status: 4 },
    { id: 'dropped', label: 'Брошено', status: 5 }
  ],
  items: [],
  page: 0,
  loading: false,
  hasMore: true,

  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-bookmarks';

    if (!Storage.isLoggedIn()) {
      this.renderNotLoggedIn(container);
      return;
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'bookmarks-toolbar';

    var title = document.createElement('div');
    title.className = 'bookmarks-title';
    title.textContent = 'Закладки';
    toolbar.appendChild(title);
    container.appendChild(toolbar);

    var tabsWrap = document.createElement('div');
    tabsWrap.className = 'bookmarks-tabs';
    tabsWrap.id = 'bookmarks-tabs';

    for (var i = 0; i < this.tabs.length; i++) {
      var tab = this.tabs[i];
      var btn = document.createElement('button');
      btn.className = 'bookmarks-tab' + (tab.id === this.currentTab ? ' active' : '');
      btn.setAttribute('data-focusable', 'true');
      btn.setAttribute('data-tab-id', tab.id);
      btn.textContent = tab.label;

      (function(tabId) {
        btn.addEventListener('click', function() {
          BookmarksScreen.switchTab(tabId);
        });
      })(tab.id);

      tabsWrap.appendChild(btn);
    }
    container.appendChild(tabsWrap);

    var content = document.createElement('div');
    content.className = 'bookmarks-content';
    content.id = 'bookmarks-content';
    container.appendChild(content);

    var bottomNav = BottomNav.render('bookmarks');
    container.appendChild(bottomNav);

    this.page = 0;
    this.items = [];
    this.hasMore = true;
    this.loadList();
  },

  renderNotLoggedIn: function(container) {
    var msg = document.createElement('div');
    msg.className = 'bookmarks-not-logged';

    var icon = document.createElement('div');
    icon.className = 'bookmarks-not-logged-icon';
    icon.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor" opacity="0.3"/></svg>';
    msg.appendChild(icon);

    var text = document.createElement('div');
    text.className = 'bookmarks-not-logged-text';
    text.textContent = 'Войдите, чтобы видеть закладки';
    msg.appendChild(text);

    var loginBtn = document.createElement('button');
    loginBtn.className = 'bookmarks-login-btn';
    loginBtn.setAttribute('data-focusable', 'true');
    loginBtn.textContent = 'Войти';
    loginBtn.addEventListener('click', function() { App.showScreen('login'); });
    msg.appendChild(loginBtn);

    container.appendChild(msg);

    var bottomNav = BottomNav.render('bookmarks');
    container.appendChild(bottomNav);

    setTimeout(function() { FocusManager.setFocus(loginBtn); }, 100);
  },

  switchTab: function(tabId) {
    this.currentTab = tabId;
    this.page = 0;
    this.items = [];
    this.hasMore = true;

    var tabs = document.querySelectorAll('.bookmarks-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab-id') === tabId);
    }

    this.loadList();
  },

  getStatusForTab: function(tabId) {
    for (var i = 0; i < this.tabs.length; i++) {
      if (this.tabs[i].id === tabId) return this.tabs[i].status;
    }
    return 1;
  },

  loadList: function() {
    if (this.loading) return;
    this.loading = true;

    var content = document.getElementById('bookmarks-content');
    if (!content) return;

    if (this.page === 0) {
      content.innerHTML = '<div class="bookmarks-loading"><div class="spinner"></div></div>';
    }

    var token = Storage.getToken();
    var profile = Storage.getProfile();
    var profileId = profile ? (profile.id || profile.profile_id) : null;
    var status = this.getStatusForTab(this.currentTab);

    if (!profileId) {
      content.innerHTML = '<div class="bookmarks-empty">Профиль не найден</div>';
      this.loading = false;
      return;
    }

    var self = this;
    ProfileApi.getList(profileId, status, this.page, token).then(function(response) {
      var items = response.content || [];
      self.loading = false;

      if (items.length === 0 && self.page === 0) {
        content.innerHTML = '<div class="bookmarks-empty">Список пуст</div>';
        self.hasMore = false;
        return;
      }

      if (items.length === 0) {
        self.hasMore = false;
        return;
      }

      self.items = self.items.concat(items);
      self.renderItems();
    }).catch(function(err) {
      self.loading = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Bookmarks: load failed', err);
      if (self.page === 0) {
        content.innerHTML = '<div class="bookmarks-empty">Ошибка загрузки</div>';
      }
    });
  },

  renderItems: function() {
    var content = document.getElementById('bookmarks-content');
    if (!content) return;
    content.innerHTML = '';

    var grid = document.createElement('div');
    grid.className = 'bookmarks-grid';

    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var release = item.release || item;
      var card = this.createCard(release);
      grid.appendChild(card);
    }

    content.appendChild(grid);

    setTimeout(function() {
      var first = grid.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  createCard: function(release) {
    var card = document.createElement('div');
    card.className = 'bookmark-card';
    card.setAttribute('data-focusable', 'true');

    var poster = document.createElement('div');
    poster.className = 'bookmark-card-poster';
    var img = document.createElement('img');
    img.src = release.image || release.poster || '';
    img.alt = release.title_ru || release.title || '';
    img.loading = 'lazy';
    img.onerror = function() { this.style.background = 'var(--color-surface)'; };
    poster.appendChild(img);

    if (release.status) {
      var statusTexts = { 1: 'Онгоинг', 2: 'Вышел', 3: 'Анонс' };
      if (statusTexts[release.status]) {
        var badge = document.createElement('div');
        badge.className = 'release-status';
        badge.textContent = statusTexts[release.status];
        poster.appendChild(badge);
      }
    }
    card.appendChild(poster);

    var info = document.createElement('div');
    info.className = 'bookmark-card-info';

    var title = document.createElement('div');
    title.className = 'bookmark-card-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'bookmark-card-meta';
    var parts = [];
    if (release.year) parts.push(release.year);
    if (release.episodes_total) parts.push(release.episodes_total + ' эп.');
    meta.textContent = parts.join(' · ');
    info.appendChild(meta);

    card.appendChild(info);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
    });

    return card;
  }
};
