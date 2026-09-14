var ReleaseListScreen = {
  mode: null,
  title: '',
  page: 0,
  items: [],
  loading: false,
  hasMore: true,

  FETCHERS: {
    watching: function(page, token) { return DiscoverApi.getWatching(page, token); },
    collections: function(page, token) { return ApiClient.get('collection/all/' + page, { token: token }); },
    filtered: function(page, token) {
      return ApiClient.post('filter/' + page, { token: token, json: ReleaseListScreen.filterBody || {} });
    },
    'release-collections': function(page, token) {
      return CollectionApi.getCollectionsForRelease(ReleaseListScreen.releaseId, page, token);
    },
    'profile-votes': function(page, token) {
      return ProfileApi.getVotedReleases(ReleaseListScreen.profileId, page, token);
    },
    'profile-collections': function(page, token) {
      return CollectionApi.getUserCollections(ReleaseListScreen.profileId, page, token);
    }
  },

  filterBody: null,
  releaseId: null,
  profileId: null,

  render: function(params) {
    params = params || {};
    this.mode = params.mode || 'watching';
    this.title = params.title || 'Список';
    this.filterBody = params.filterBody || null;
    this.releaseId = params.releaseId || null;
    this.profileId = params.profileId || null;
    this.page = 0;
    this.items = [];
    this.hasMore = true;

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
    titleEl.textContent = this.title;
    toolbar.appendChild(titleEl);

    container.appendChild(toolbar);

    var content = document.createElement('div');
    content.className = 'release-list-content';
    content.id = 'release-list-content';
    content.addEventListener('scroll', function() {
      ReleaseListScreen.onScroll(content);
    });
    container.appendChild(content);

    var bottomNav = BottomNav.render('discover');
    container.appendChild(bottomNav);

    this.loadPage();
  },

  onScroll: function(container) {
    if (this.loading || !this.hasMore) return;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
      this.page++;
      this.loadPage();
    }
  },

  loadPage: function() {
    if (this.loading) return;
    this.loading = true;

    var content = document.getElementById('release-list-content');
    if (!content) return;
    if (this.page === 0) {
      content.innerHTML = '<div class="bookmarks-loading"><div class="spinner"></div></div>';
    }

    var self = this;
    var token = Storage.getToken();
    var fetcher = this.FETCHERS[this.mode] || this.FETCHERS.watching;

    fetcher(this.page, token).then(function(response) {
      var items = response.content || [];
      self.loading = false;

      if (items.length === 0 && self.page === 0) {
        var emptyText = 'Пусто';
        if (self.mode === 'filtered') emptyText = 'По этому фильтру ничего не нашлось. Попробуйте изменить условия.';
        if (self.mode === 'release-collections') emptyText = 'Этого релиза пока нет ни в одной коллекции.';
        if (self.mode === 'profile-votes') emptyText = 'Нет оценённых релизов';
        if (self.mode === 'profile-collections') emptyText = 'Нет данных для отображения';
        content.innerHTML = '<div class="bookmarks-empty">' + emptyText + '</div>';
        self.hasMore = false;
        return;
      }
      if (items.length === 0) {
        self.hasMore = false;
        return;
      }

      self.items = self.items.concat(items);
      self.renderItems();
    }).catch(function() {
      self.loading = false;
      if (self.page === 0) content.innerHTML = '<div class="bookmarks-empty">Ошибка загрузки</div>';
    });
  },

  renderItems: function() {
    var content = document.getElementById('release-list-content');
    if (!content) return;
    content.innerHTML = '';

    var grid = document.createElement('div');
    grid.className = 'bookmarks-grid';

    var isCollectionMode = this.mode === 'collections' || this.mode === 'release-collections' || this.mode === 'profile-collections';
    var isVotesMode = this.mode === 'profile-votes';

    for (var i = 0; i < this.items.length; i++) {
      var card;
      if (isCollectionMode) card = this.createCollectionCard(this.items[i]);
      else if (isVotesMode) card = this.createVoteCard(this.items[i]);
      else card = HomeScreen.createReleaseCard(this.items[i]);
      grid.appendChild(card);
    }

    content.appendChild(grid);

    setTimeout(function() {
      var first = grid.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  createCollectionCard: function(collection) {
    var card = document.createElement('div');
    card.className = 'bookmark-card';
    card.setAttribute('data-focusable', 'true');

    var poster = document.createElement('div');
    poster.className = 'bookmark-card-poster';
    var img = document.createElement('img');
    img.src = collection.image || '';
    img.alt = collection.title || '';
    img.loading = 'lazy';
    poster.appendChild(img);
    card.appendChild(poster);

    var info = document.createElement('div');
    info.className = 'bookmark-card-info';

    var title = document.createElement('div');
    title.className = 'bookmark-card-title';
    title.textContent = collection.title || '';
    info.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'bookmark-card-meta';
    meta.textContent = (collection.favorites_count || 0).toLocaleString('ru-RU') + ' в избранном';
    info.appendChild(meta);

    card.appendChild(info);
    return card;
  },

  createVoteCard: function(release) {
    var card = document.createElement('div');
    card.className = 'bookmark-card';
    card.setAttribute('data-focusable', 'true');

    var poster = document.createElement('div');
    poster.className = 'bookmark-card-poster';
    var img = document.createElement('img');
    img.src = release.image || '';
    img.alt = '';
    img.loading = 'lazy';
    poster.appendChild(img);
    card.appendChild(poster);

    var info = document.createElement('div');
    info.className = 'bookmark-card-info';

    var title = document.createElement('div');
    title.className = 'bookmark-card-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    info.appendChild(ProfileScreen.renderStarRow(release.my_vote || 0));

    var meta = document.createElement('div');
    meta.className = 'bookmark-card-meta';
    meta.textContent = ProfileScreen.formatRelativeDate(release.voted_at);
    info.appendChild(meta);

    card.appendChild(info);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
    });

    return card;
  }
};
