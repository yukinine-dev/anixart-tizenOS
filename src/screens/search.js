var SearchScreen = {
  query: '',
  results: [],
  searchTimeout: null,
  page: 0,
  loading: false,
  hasMore: true,

  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-search';

    this.page = 0;
    this.results = [];
    this.hasMore = true;
    this.loading = false;

    var searchBar = document.createElement('div');
    searchBar.className = 'search-screen-bar';

    var backBtn = document.createElement('button');
    backBtn.className = 'search-back-btn';
    backBtn.setAttribute('data-focusable', 'true');
    backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
    backBtn.addEventListener('click', function() { App.goBack(); });
    searchBar.appendChild(backBtn);

    var inputWrap = document.createElement('div');
    inputWrap.className = 'search-input-wrap';

    var searchIcon = document.createElement('span');
    searchIcon.className = 'search-input-icon';
    searchIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>';
    inputWrap.appendChild(searchIcon);

    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'search-input';
    input.className = 'search-input-field';
    input.placeholder = 'Поиск аниме...';
    input.setAttribute('data-focusable', 'true');
    input.addEventListener('focus', function() { FocusManager.setFocus(input); });
    input.addEventListener('input', function() {
      SearchScreen.onInput(input.value);
    });
    inputWrap.appendChild(input);

    var clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear-btn';
    clearBtn.id = 'search-clear';
    clearBtn.style.display = 'none';
    clearBtn.setAttribute('data-focusable', 'true');
    clearBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>';
    clearBtn.addEventListener('click', function() {
      input.value = '';
      SearchScreen.onInput('');
      FocusManager.setFocus(input);
    });
    inputWrap.appendChild(clearBtn);

    searchBar.appendChild(inputWrap);
    container.appendChild(searchBar);

    var resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.id = 'search-results';

    var emptyState = document.createElement('div');
    emptyState.className = 'search-empty';
    emptyState.id = 'search-empty';
    emptyState.textContent = 'Введите название аниме';
    resultsContainer.appendChild(emptyState);

    resultsContainer.addEventListener('scroll', function() {
      SearchScreen.onScroll(resultsContainer);
    });

    container.appendChild(resultsContainer);

    var bottomNav = BottomNav.render('discover');
    container.appendChild(bottomNav);

    setTimeout(function() { FocusManager.setFocus(input); }, 100);
  },

  onScroll: function(container) {
    if (this.loading || !this.hasMore || !this.query) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
      this.page++;
      this.loadMore();
    }
  },

  onInput: function(value) {
    this.query = value.trim();
    var clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.style.display = this.query ? '' : 'none';

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (!this.query) {
      this.page = 0;
      this.results = [];
      this.hasMore = true;
      this.showEmpty('Введите название аниме');
      return;
    }

    if (this.query.length < 2) return;

    var self = this;
    this.searchTimeout = setTimeout(function() {
      self.page = 0;
      self.results = [];
      self.hasMore = true;
      self.doSearch(self.query, 0);
    }, 400);
  },

  doSearch: function(query, page) {
    var token = Storage.getToken();
    var container = document.getElementById('search-results');
    if (!container) return;

    this.loading = true;

    if (page === 0) {
      container.innerHTML = '<div class="search-loading"><div class="spinner"></div></div>';
    }

    if (typeof Debug !== 'undefined') Debug.log('info', 'Search: "' + query + '" page=' + page);

    var self = this;
    SearchApi.search(query, page, token).then(function(response) {
      self.loading = false;
      var items = response.content || [];
      if (typeof Debug !== 'undefined') Debug.log('info', 'Search: ' + items.length + ' results');

      if (items.length === 0 && page === 0) {
        self.hasMore = false;
        self.showEmpty('Ничего не найдено');
        return;
      }

      if (items.length === 0) {
        self.hasMore = false;
        return;
      }

      self.results = self.results.concat(items);
      self.renderResults(self.results);
    }).catch(function(err) {
      self.loading = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Search failed', err);
      if (page === 0) {
        self.showEmpty('Ошибка поиска');
      }
    });
  },

  loadMore: function() {
    if (this.query) {
      this.doSearch(this.query, this.page);
    }
  },

  showEmpty: function(text) {
    var container = document.getElementById('search-results');
    if (!container) return;
    container.innerHTML = '<div class="search-empty">' + text + '</div>';
  },

  renderResults: function(items) {
    var container = document.getElementById('search-results');
    if (!container) return;
    container.innerHTML = '';

    var grid = document.createElement('div');
    grid.className = 'search-grid';

    for (var i = 0; i < items.length; i++) {
      var card = this.createResultCard(items[i]);
      grid.appendChild(card);
    }

    container.appendChild(grid);

    if (this.page === 0) {
      setTimeout(function() {
        var first = grid.querySelector('[data-focusable]');
        if (first) FocusManager.setFocus(first);
      }, 100);
    }
  },

  createResultCard: function(release) {
    var card = document.createElement('div');
    card.className = 'search-card';
    card.setAttribute('data-focusable', 'true');

    var posterWrap = document.createElement('div');
    posterWrap.className = 'search-card-poster';
    var img = document.createElement('img');
    img.src = release.image || release.poster || '';
    img.alt = release.title_ru || release.title || '';
    img.loading = 'lazy';
    img.onerror = function() { this.style.background = 'var(--color-surface)'; };
    posterWrap.appendChild(img);

    if (release.status_id) {
      var statusTexts = { 1: 'Онгоинг', 2: 'Вышел', 3: 'Анонс' };
      if (statusTexts[release.status_id]) {
        var badge = document.createElement('div');
        badge.className = 'release-status';
        badge.textContent = statusTexts[release.status_id];
        posterWrap.appendChild(badge);
      }
    }
    card.appendChild(posterWrap);

    var info = document.createElement('div');
    info.className = 'search-card-info';

    var title = document.createElement('div');
    title.className = 'search-card-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    if (release.title_en || release.title_original) {
      var sub = document.createElement('div');
      sub.className = 'search-card-subtitle';
      sub.textContent = release.title_en || release.title_original;
      info.appendChild(sub);
    }

    var meta = document.createElement('div');
    meta.className = 'search-card-meta';
    var parts = [];
    if (release.year) parts.push(release.year);
    if (release.episodes_total) parts.push(release.episodes_total + ' эп.');
    if (release.grade) parts.push(parseFloat(release.grade).toFixed(1));
    meta.textContent = parts.join(' · ');
    info.appendChild(meta);

    if (release.genres) {
      var names = release.genres.split(',').map(function(g) { return g.trim(); }).filter(Boolean);
      if (names.length > 0) {
        var genres = document.createElement('div');
        genres.className = 'search-card-genres';
        genres.textContent = names.slice(0, 3).join(', ');
        info.appendChild(genres);
      }
    }

    card.appendChild(info);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
    });

    return card;
  }
};
