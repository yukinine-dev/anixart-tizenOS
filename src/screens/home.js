var HomeScreen = {
  FILTER_DEFAULT: {
    country: null, season: null, sort: 0, source: null, studio: null,
    age_ratings: [], category_id: null, end_year: null,
    episode_duration_from: null, episode_duration_to: null,
    episodes_from: null, episodes_to: null, genres: [],
    is_genres_exclude_mode_enabled: false, profile_list_exclusions: [],
    start_year: null, status_id: null, types: []
  },

  CATEGORY_TABS: [
    { id: 'my', label: 'Моя вкладка' },
    { id: 'anime', label: 'Аниме', filter: { country: 'Япония' } },
    { id: 'donghua', label: 'Дунхуа', filter: { country: 'Китай' } },
    { id: 'latest', label: 'Последнее', filter: {} },
    { id: 'ongoing', label: 'Онгоинги', filter: { status_id: 2 } },
    { id: 'announced', label: 'Анонсы', filter: { status_id: 3 } },
    { id: 'finished', label: 'Завершенные', filter: { status_id: 1 } },
    { id: 'films', label: 'Фильмы', filter: { category_id: 2 } },
    { id: 'ova', label: 'OVA', filter: { category_id: 3 } }
  ],

  MONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],

  currentTab: 'anime',
  page: 0,
  items: [],
  loading: false,
  hasMore: true,

  render: function() {
    // currentTab is intentionally not reset here -- coming back via the
    // back button (e.g. from a title opened while on "Дунхуа") should land
    // on that same tab, not jump back to "Моя вкладка".
    this.page = 0;
    this.items = [];
    this.hasMore = true;

    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-home';

    var toolbar = this.createToolbar();
    container.appendChild(toolbar);

    var tabsWrap = document.createElement('div');
    tabsWrap.className = 'home-tabs';
    tabsWrap.id = 'home-tabs';

    for (var i = 0; i < this.CATEGORY_TABS.length; i++) {
      var tab = this.CATEGORY_TABS[i];
      var btn = document.createElement('button');
      btn.className = 'home-tab' + (tab.id === this.currentTab ? ' active' : '');
      btn.setAttribute('data-focusable', 'true');
      btn.setAttribute('data-tab-id', tab.id);
      btn.textContent = tab.label;
      (function(tabId) {
        btn.addEventListener('click', function() { HomeScreen.switchTab(tabId); });
      })(tab.id);
      tabsWrap.appendChild(btn);
    }
    container.appendChild(tabsWrap);

    var mainScroll = document.createElement('div');
    mainScroll.id = 'main-scroll';
    mainScroll.className = 'main-scroll home-main-scroll';
    mainScroll.addEventListener('scroll', function() {
      HomeScreen.onScroll(mainScroll);
    });

    var content = document.createElement('div');
    content.className = 'home-content';
    content.id = 'home-content';

    mainScroll.appendChild(content);
    container.appendChild(mainScroll);

    var bottomNav = BottomNav.render('home');
    container.appendChild(bottomNav);

    if (this.currentTab === 'my' && !this.hasMyTabFilter()) {
      this.renderMyTab(content);
    } else {
      content.appendChild(this.createSkeleton());
      this.loadPage();
    }
  },

  switchTab: function(tabId) {
    this.currentTab = tabId;
    this.page = 0;
    this.items = [];
    this.hasMore = true;

    var tabs = document.querySelectorAll('#home-tabs .home-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab-id') === tabId);
    }

    var content = document.getElementById('home-content');
    content.innerHTML = '';

    if (tabId === 'my' && !this.hasMyTabFilter()) {
      this.renderMyTab(content);
      return;
    }

    content.appendChild(this.createSkeleton());
    this.loadPage();
  },

  renderMyTab: function(content) {
    var self = this;
    var empty = document.createElement('div');
    empty.className = 'home-my-tab-empty';

    var icon = document.createElement('div');
    icon.className = 'home-my-tab-icon';
    icon.innerHTML = '<svg width="72" height="72" viewBox="0 0 24 24"><path d="M3 5c0-1.1.9-2 2-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" fill="currentColor" opacity="0.25"/><path d="M3 5c0-1.1.9-2 2-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
    empty.appendChild(icon);

    var title = document.createElement('div');
    title.className = 'home-my-tab-title';
    title.textContent = 'Это ваша вкладка';
    empty.appendChild(title);

    var desc = document.createElement('div');
    desc.className = 'home-my-tab-desc';
    desc.textContent = 'Настройте её под себя и укажите, что хотели бы здесь видеть';
    empty.appendChild(desc);

    var configureBtn = document.createElement('button');
    configureBtn.className = 'home-my-tab-btn';
    configureBtn.setAttribute('data-focusable', 'true');
    configureBtn.textContent = 'Настроить';
    configureBtn.addEventListener('click', function() { App.showScreen('tab-settings'); });
    empty.appendChild(configureBtn);

    content.appendChild(empty);

    setTimeout(function() { FocusManager.setFocus(configureBtn); }, 100);
  },

  onScroll: function(container) {
    if (this.currentTab === 'my' || this.loading || !this.hasMore) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 300) {
      this.page++;
      this.loadPage();
    }
  },

  hasMyTabFilter: function() {
    var f = Storage.getMyTabFilter();
    if (!f) return false;
    for (var key in this.FILTER_DEFAULT) {
      var def = this.FILTER_DEFAULT[key];
      var val = f[key];
      if (Array.isArray(def)) {
        if (val && val.length > 0) return true;
      } else if (val !== def) {
        return true;
      }
    }
    return false;
  },

  getTab: function(tabId) {
    for (var i = 0; i < this.CATEGORY_TABS.length; i++) {
      if (this.CATEGORY_TABS[i].id === tabId) return this.CATEGORY_TABS[i];
    }
    return null;
  },

  loadPage: function() {
    if (this.loading) return;
    this.loading = true;

    var content = document.getElementById('home-content');
    if (!content) return;
    if (this.page === 0) content.innerHTML = '';

    var body;
    if (this.currentTab === 'my') {
      body = Storage.getMyTabFilter() || this.FILTER_DEFAULT;
    } else {
      var tab = this.getTab(this.currentTab);
      body = {};
      for (var key in this.FILTER_DEFAULT) { body[key] = this.FILTER_DEFAULT[key]; }
      for (var key2 in tab.filter) { body[key2] = tab.filter[key2]; }
    }

    var token = Storage.getToken();
    var self = this;
    var tabId = this.currentTab;

    ApiClient.post('filter/' + this.page, { token: token, json: body }).then(function(response) {
      self.loading = false;
      if (tabId !== self.currentTab) return;

      var items = response.content || [];
      if (items.length === 0) {
        self.hasMore = false;
        if (self.page === 0) content.innerHTML = '<div class="bookmarks-empty">Пусто</div>';
        return;
      }

      self.items = self.items.concat(items);
      self.renderCatList();
    }).catch(function(err) {
      self.loading = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Home: filter load failed', err);
      if (tabId === self.currentTab && self.page === 0) {
        content.innerHTML = '<div class="bookmarks-empty">Ошибка загрузки</div>';
      }
    });
  },

  renderCatList: function() {
    var content = document.getElementById('home-content');
    if (!content) return;
    content.innerHTML = '';

    var list = document.createElement('div');
    list.className = 'popular-list home-cat-list';

    for (var i = 0; i < this.items.length; i++) {
      list.appendChild(this.createCatRow(this.items[i]));
    }

    content.appendChild(list);

    setTimeout(function() {
      var first = list.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  formatAiredDate: function(timestamp) {
    var d = new Date(timestamp * 1000);
    return d.getDate() + ' ' + this.MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ' г.';
  },

  createCatRow: function(release) {
    var row = document.createElement('div');
    row.className = 'popular-row home-cat-row';
    row.setAttribute('data-focusable', 'true');

    var poster = document.createElement('div');
    poster.className = 'popular-poster';
    var img = document.createElement('img');
    img.src = release.image || release.poster || '';
    img.alt = release.title_ru || '';
    img.loading = 'lazy';
    poster.appendChild(img);
    row.appendChild(poster);

    var info = document.createElement('div');
    info.className = 'popular-info';

    var title = document.createElement('div');
    title.className = 'popular-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    var isAnnounced = release.status && release.status.id === 3;

    var meta = document.createElement('div');
    meta.className = 'popular-meta';
    if (isAnnounced) {
      meta.textContent = 'Анонс   ' + (release.episodes_total || '?') + ' эп';
    } else {
      var epText = release.episodes_released && release.episodes_total
        ? release.episodes_released + ' из ' + release.episodes_total + ' эп'
        : (release.episodes_total || '?') + ' эп';
      meta.textContent = epText + (release.grade ? ' · ' + parseFloat(release.grade).toFixed(1).replace(/\.0$/, '') + ' ★' : '');
    }
    info.appendChild(meta);

    if (isAnnounced && release.aired_on_date) {
      var pill = document.createElement('div');
      pill.className = 'home-cat-date-pill';
      pill.textContent = this.formatAiredDate(release.aired_on_date);
      info.appendChild(pill);
    }

    if (release.description) {
      var desc = document.createElement('div');
      desc.className = 'popular-desc';
      desc.textContent = release.description;
      info.appendChild(desc);
      row.addEventListener('focus', function() {
        HomeScreen.ensureFullDescription(release, desc);
      });
    }

    row.appendChild(info);

    row.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
    });

    return row;
  },

  descCache: {},

  // /filter returns a shortened preview description, cut off mid-sentence
  // with no ellipsis -- fetch the real one from /release only for the row
  // actually in focus, instead of eagerly for the whole list.
  ensureFullDescription: function(release, descEl) {
    if (descEl.getAttribute('data-full-desc')) return;
    descEl.setAttribute('data-full-desc', '1');

    var cached = this.descCache[release.id];
    if (cached) {
      descEl.textContent = cached;
      descEl.classList.add('popular-desc-updated');
      return;
    }

    var token = Storage.getToken();
    ReleaseApi.getRelease(release.id, token).then(function(response) {
      var full = (response.release || response).description;
      if (full && full.length > descEl.textContent.length) {
        HomeScreen.descCache[release.id] = full;
        descEl.textContent = full;
        descEl.classList.add('popular-desc-updated');
      }
    }).catch(function() {});
  },

  createToolbar: function() {
    var toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    var searchBar = document.createElement('div');
    searchBar.className = 'search-bar';
    searchBar.setAttribute('data-focusable', 'true');

    var searchIcon = document.createElement('span');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>';
    searchBar.appendChild(searchIcon);

    var searchText = document.createElement('span');
    searchText.className = 'search-text';
    searchText.textContent = 'Поиск аниме';
    searchBar.appendChild(searchText);

    searchBar.addEventListener('click', function() {
      App.showScreen('search');
    });

    toolbar.appendChild(searchBar);

    var actions = document.createElement('div');
    actions.className = 'toolbar-actions';

    var settingsBtn = document.createElement('button');
    settingsBtn.className = 'toolbar-btn';
    settingsBtn.setAttribute('data-focusable', 'true');
    settingsBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z" fill="currentColor"/></svg>';
    settingsBtn.addEventListener('click', function() {
      App.showScreen('profile');
    });
    actions.appendChild(settingsBtn);

    var notifBtn = document.createElement('button');
    notifBtn.className = 'toolbar-btn';
    notifBtn.setAttribute('data-focusable', 'true');
    notifBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/></svg>';
    notifBtn.addEventListener('click', function() {
      App.showScreen('feed');
    });
    actions.appendChild(notifBtn);

    toolbar.appendChild(actions);
    return toolbar;
  },

  createSkeleton: function() {
    var skeleton = document.createElement('div');
    skeleton.className = 'skeleton-container';
    skeleton.id = 'skeleton';

    for (var s = 0; s < 3; s++) {
      var section = document.createElement('div');
      section.className = 'skeleton-section';

      var header = document.createElement('div');
      header.className = 'skeleton-header shimmer';
      section.appendChild(header);

      var row = document.createElement('div');
      row.className = 'skeleton-row';
      for (var i = 0; i < 6; i++) {
        var card = document.createElement('div');
        card.className = 'skeleton-card';
        var poster = document.createElement('div');
        poster.className = 'skeleton-poster shimmer';
        card.appendChild(poster);
        var line = document.createElement('div');
        line.className = 'skeleton-line shimmer';
        card.appendChild(line);
        row.appendChild(card);
      }
      section.appendChild(row);
      skeleton.appendChild(section);
    }
    return skeleton;
  },

  createInterestingSection: function(items) {
    var section = document.createElement('div');
    section.className = 'home-section interesting-section';

    var scroll = document.createElement('div');
    scroll.className = 'section-scroll interesting-scroll';

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var card = this.createInterestingCard(item);
      scroll.appendChild(card);
    }

    section.appendChild(scroll);
    return section;
  },

  createInterestingCard: function(item) {
    var releaseId = item.action ? parseInt(item.action, 10) : item.id;

    var card = document.createElement('div');
    card.className = 'interesting-card';
    card.setAttribute('data-focusable', 'true');
    card.setAttribute('data-release-id', releaseId || '');

    var inner = document.createElement('div');
    inner.className = 'interesting-card-inner';

    var img = document.createElement('img');
    img.className = 'interesting-poster';
    img.alt = item.title || '';
    img.loading = 'lazy';
    if (item.image) {
      img.src = item.image;
    }
    img.onerror = function() { this.style.display = 'none'; };
    inner.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'interesting-overlay';

    var title = document.createElement('div');
    title.className = 'interesting-title';
    title.textContent = item.title || '';
    overlay.appendChild(title);

    inner.appendChild(overlay);
    card.appendChild(inner);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: releaseId });
    });

    return card;
  },

  createReleaseSection: function(titleText, subtitleText, items, showMore) {
    var section = document.createElement('div');
    section.className = 'home-section';

    var header = document.createElement('div');
    header.className = 'section-header';

    var headerLeft = document.createElement('div');
    headerLeft.className = 'section-header-left';

    var title = document.createElement('span');
    title.className = 'section-title';
    title.textContent = titleText;
    headerLeft.appendChild(title);

    if (subtitleText) {
      var subtitle = document.createElement('span');
      subtitle.className = 'section-subtitle';
      subtitle.textContent = subtitleText;
      headerLeft.appendChild(subtitle);
    }

    header.appendChild(headerLeft);

    if (showMore) {
      var moreBtn = document.createElement('span');
      moreBtn.className = 'section-show-more';
      moreBtn.textContent = 'Показать все';
      moreBtn.setAttribute('data-focusable', 'true');
      header.appendChild(moreBtn);
    }

    section.appendChild(header);

    var scroll = document.createElement('div');
    scroll.className = 'section-scroll';

    for (var i = 0; i < items.length; i++) {
      var card = this.createReleaseCard(items[i]);
      scroll.appendChild(card);
    }

    section.appendChild(scroll);

    var separator = document.createElement('div');
    separator.className = 'section-separator';
    section.appendChild(separator);

    return section;
  },

  createReleaseCard: function(release) {
    var card = document.createElement('div');
    card.className = 'release-card';
    card.setAttribute('data-focusable', 'true');
    card.setAttribute('data-release-id', release.id || '');

    var posterWrap = document.createElement('div');
    posterWrap.className = 'release-poster-wrap';

    var img = document.createElement('img');
    img.className = 'release-poster';
    img.alt = release.title_ru || release.title || '';
    img.loading = 'lazy';
    if (release.image) {
      img.src = release.image;
    } else if (release.poster) {
      img.src = release.poster;
    }
    img.onerror = function() {
      this.style.background = '#252525';
    };
    posterWrap.appendChild(img);

    if (release.status_id) {
      var statusBubble = document.createElement('div');
      statusBubble.className = 'release-status';
      var statusTexts = { 1: 'Онгоинг', 2: 'Вышел', 3: 'Анонс' };
      statusBubble.textContent = statusTexts[release.status_id] || '';
      if (statusBubble.textContent) {
        posterWrap.appendChild(statusBubble);
      }
    }

    card.appendChild(posterWrap);

    var info = document.createElement('div');
    info.className = 'release-info';

    var title = document.createElement('div');
    title.className = 'release-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'release-meta';

    if (release.episodes_total || release.episodesCount) {
      var eps = document.createElement('span');
      eps.textContent = (release.episodes_total || release.episodesCount || '?') + ' эп.';
      meta.appendChild(eps);
    }

    if (release.grade) {
      if (meta.childNodes.length > 0) {
        var dot = document.createElement('span');
        dot.className = 'meta-dot';
        dot.textContent = ' · ';
        meta.appendChild(dot);
      }
      var grade = document.createElement('span');
      grade.className = 'release-grade';
      grade.textContent = parseFloat(release.grade).toFixed(1).replace(/\.0$/, '');
      meta.appendChild(grade);
    }

    info.appendChild(meta);
    card.appendChild(info);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
    });

    return card;
  }
};
