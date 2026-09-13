var PopularScreen = {
  FILTER_DEFAULT: {
    country: null, season: null, sort: 0, source: null, studio: null,
    age_ratings: [], category_id: null, end_year: null,
    episode_duration_from: null, episode_duration_to: null,
    episodes_from: null, episodes_to: null, genres: [],
    is_genres_exclude_mode_enabled: false, profile_list_exclusions: [],
    start_year: null, status_id: null, types: []
  },

  TABS: [
    { id: 'ongoing', label: 'Онгоинги', filter: { sort: 3, episodes_from: 1, episodes_to: 48, status_id: 2 } },
    { id: 'finished', label: 'Завершенные', filter: { sort: 3, status_id: 1 } },
    { id: 'films', label: 'Фильмы', filter: { sort: 3, category_id: 2 } },
    { id: 'ova', label: 'OVA', filter: { sort: 3, category_id: 3 } }
  ],

  currentTab: 'ongoing',
  loading: false,

  render: function() {
    this.currentTab = 'ongoing';

    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-release-list';

    var toolbar = document.createElement('div');
    toolbar.className = 'bookmarks-toolbar';

    var backBtn = document.createElement('button');
    backBtn.className = 'search-back-btn';
    backBtn.setAttribute('data-focusable', 'true');
    backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
    backBtn.addEventListener('click', function() { App.goBack(); });
    toolbar.appendChild(backBtn);

    var titleEl = document.createElement('div');
    titleEl.className = 'bookmarks-title';
    titleEl.textContent = 'Популярное';
    toolbar.appendChild(titleEl);

    container.appendChild(toolbar);

    var tabsWrap = document.createElement('div');
    tabsWrap.className = 'bookmarks-tabs';
    tabsWrap.id = 'popular-tabs';

    for (var i = 0; i < this.TABS.length; i++) {
      var tab = this.TABS[i];
      var btn = document.createElement('button');
      btn.className = 'bookmarks-tab' + (tab.id === this.currentTab ? ' active' : '');
      btn.setAttribute('data-focusable', 'true');
      btn.setAttribute('data-tab-id', tab.id);
      btn.textContent = tab.label;
      (function(tabId) {
        btn.addEventListener('click', function() { PopularScreen.switchTab(tabId); });
      })(tab.id);
      tabsWrap.appendChild(btn);
    }
    container.appendChild(tabsWrap);

    var content = document.createElement('div');
    content.className = 'release-list-content popular-content';
    content.id = 'popular-content';
    container.appendChild(content);

    var bottomNav = BottomNav.render('discover');
    container.appendChild(bottomNav);

    this.loadTab(this.currentTab);
  },

  switchTab: function(tabId) {
    this.currentTab = tabId;
    var tabs = document.querySelectorAll('#popular-tabs .bookmarks-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab-id') === tabId);
    }
    this.loadTab(tabId);
  },

  getTab: function(tabId) {
    for (var i = 0; i < this.TABS.length; i++) {
      if (this.TABS[i].id === tabId) return this.TABS[i];
    }
    return this.TABS[0];
  },

  loadTab: function(tabId) {
    if (this.loading) return;
    this.loading = true;

    var content = document.getElementById('popular-content');
    content.innerHTML = '<div class="bookmarks-loading"><div class="spinner"></div></div>';

    var tab = this.getTab(tabId);
    var body = {};
    for (var key in this.FILTER_DEFAULT) { body[key] = this.FILTER_DEFAULT[key]; }
    for (var key2 in tab.filter) { body[key2] = tab.filter[key2]; }

    var token = Storage.getToken();
    var self = this;

    ApiClient.post('filter/0', { token: token, json: body }).then(function(response) {
      self.loading = false;
      if (tabId !== self.currentTab) return;

      var items = response.content || [];
      if (items.length === 0) {
        content.innerHTML = '<div class="bookmarks-empty">Пусто</div>';
        return;
      }
      self.renderList(items);
    }).catch(function(err) {
      self.loading = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Popular: load failed', err);
      if (tabId === self.currentTab) content.innerHTML = '<div class="bookmarks-empty">Ошибка загрузки</div>';
    });
  },

  renderList: function(items) {
    var content = document.getElementById('popular-content');
    content.innerHTML = '';

    var list = document.createElement('div');
    list.className = 'popular-list';

    for (var i = 0; i < items.length; i++) {
      list.appendChild(this.createRow(items[i], i + 1));
    }

    content.appendChild(list);

    setTimeout(function() {
      var first = list.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  createRow: function(release, rank) {
    var row = document.createElement('div');
    row.className = 'popular-row';
    row.setAttribute('data-focusable', 'true');

    var rankEl = document.createElement('div');
    rankEl.className = 'popular-rank';
    rankEl.textContent = rank;
    row.appendChild(rankEl);

    var poster = document.createElement('div');
    poster.className = 'popular-poster';
    var img = document.createElement('img');
    img.src = release.image || '';
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

    var meta = document.createElement('div');
    meta.className = 'popular-meta';
    var epText = release.episodes_released && release.episodes_total
      ? release.episodes_released + ' из ' + release.episodes_total + ' эп'
      : (release.episodes_total || '?') + ' эп';
    meta.textContent = epText + (release.grade ? ' · ' + parseFloat(release.grade).toFixed(1).replace(/\.0$/, '') + ' ★' : '');
    info.appendChild(meta);

    if (release.description) {
      var desc = document.createElement('div');
      desc.className = 'popular-desc';
      desc.textContent = release.description;
      info.appendChild(desc);
      row.addEventListener('focus', function() {
        PopularScreen.ensureFullDescription(release, desc);
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
      return;
    }

    var token = Storage.getToken();
    ReleaseApi.getRelease(release.id, token).then(function(response) {
      var full = (response.release || response).description;
      if (full && full.length > descEl.textContent.length) {
        PopularScreen.descCache[release.id] = full;
        descEl.textContent = full;
      }
    }).catch(function() {});
  }
};
