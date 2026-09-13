var BookmarksScreen = {
  currentTab: 'favorites',
  tabs: [
    { id: 'favorites', label: 'Избранное' },
    { id: 'watching', label: 'Смотрю', status: 1 },
    { id: 'planned', label: 'В планах', status: 2 },
    { id: 'watched', label: 'Просмотрено', status: 3 },
    { id: 'delayed', label: 'Отложено', status: 4 },
    { id: 'dropped', label: 'Брошено', status: 5 }
  ],
  STATUS_COLORS: { 1: '#73c978', 2: '#c373c9', 3: '#6979ce', 4: '#ffd468', 5: '#ff605b' },
  STATUS_LABELS: { 1: 'Смотрю', 2: 'В планах', 3: 'Просмотрено', 4: 'Отложено', 5: 'Брошено' },
  items: [],
  page: 0,
  loading: false,
  hasMore: true,
  totalCount: 0,
  sortMode: 'added',

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

    var subToolbar = document.createElement('div');
    subToolbar.className = 'bookmarks-subtoolbar';

    var countEl = document.createElement('div');
    countEl.className = 'bookmarks-count';
    countEl.id = 'bookmarks-count';
    subToolbar.appendChild(countEl);

    var sortBtn = document.createElement('button');
    sortBtn.className = 'bookmarks-sort-btn';
    sortBtn.id = 'bookmarks-sort-btn';
    sortBtn.setAttribute('data-focusable', 'true');
    sortBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" fill="currentColor"/></svg><span>' + (this.sortMode === 'alpha' ? 'По алфавиту' : 'По добавлению') + '</span>';
    sortBtn.addEventListener('click', function() { BookmarksScreen.toggleSort(); });
    subToolbar.appendChild(sortBtn);

    var shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'bookmarks-shuffle-btn';
    shuffleBtn.setAttribute('data-focusable', 'true');
    shuffleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" fill="currentColor"/></svg>';
    shuffleBtn.addEventListener('click', function() { BookmarksScreen.shuffleItems(); });
    subToolbar.appendChild(shuffleBtn);

    container.appendChild(subToolbar);

    var content = document.createElement('div');
    content.className = 'bookmarks-content';
    content.id = 'bookmarks-content';
    content.addEventListener('scroll', function() {
      BookmarksScreen.onScroll(content);
    });
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

  onScroll: function(container) {
    if (this.loading || !this.hasMore) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
      this.page++;
      this.loadList();
    }
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
    var self = this;
    var request;

    if (this.currentTab === 'favorites') {
      request = ApiClient.get('favorite/all/' + this.page, { token: token });
    } else {
      var profile = Storage.getProfile();
      var profileId = profile ? (profile.id || profile.profile_id) : null;
      var status = this.getStatusForTab(this.currentTab);

      if (!profileId) {
        content.innerHTML = '<div class="bookmarks-empty">Профиль не найден</div>';
        this.loading = false;
        return;
      }

      request = ProfileApi.getList(profileId, status, this.page, token);
    }

    request.then(function(response) {
      var items = response.content || [];
      self.loading = false;
      self.totalCount = response.total_count || 0;

      var countEl = document.getElementById('bookmarks-count');
      if (countEl) countEl.textContent = self.totalCount + ' всего';

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

  toggleSort: function() {
    this.sortMode = this.sortMode === 'alpha' ? 'added' : 'alpha';
    var btn = document.getElementById('bookmarks-sort-btn');
    if (btn) {
      var span = btn.querySelector('span');
      if (span) span.textContent = this.sortMode === 'alpha' ? 'По алфавиту' : 'По добавлению';
    }
    this.renderItems();
  },

  shuffleItems: function() {
    for (var i = this.items.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = this.items[i];
      this.items[i] = this.items[j];
      this.items[j] = tmp;
    }

    this.sortMode = 'added';
    var btn = document.getElementById('bookmarks-sort-btn');
    if (btn) {
      var span = btn.querySelector('span');
      if (span) span.textContent = 'По добавлению';
    }

    this.renderItems();
  },

  renderItems: function() {
    var content = document.getElementById('bookmarks-content');
    if (!content) return;
    content.innerHTML = '';

    var grid = document.createElement('div');
    grid.className = 'bookmarks-grid';

    var displayItems = this.items.slice();
    if (this.sortMode === 'alpha') {
      displayItems.sort(function(a, b) {
        var ra = a.release || a, rb = b.release || b;
        return (ra.title_ru || ra.title || '').localeCompare(rb.title_ru || rb.title || '', 'ru');
      });
    }

    for (var i = 0; i < displayItems.length; i++) {
      var item = displayItems[i];
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
    img.onerror = function() { this.style.background = '#252525'; };
    poster.appendChild(img);

    var listStatus = release.profile_list_status || this.getStatusForTab(this.currentTab);
    if (listStatus && this.STATUS_LABELS[listStatus]) {
      var badge = document.createElement('div');
      badge.className = 'bookmark-card-status-badge';
      badge.style.background = this.STATUS_COLORS[listStatus];
      badge.textContent = this.STATUS_LABELS[listStatus];
      poster.appendChild(badge);
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
