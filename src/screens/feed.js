var FeedScreen = {
  items: [],
  page: 0,
  loading: false,

  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-feed';

    var toolbar = document.createElement('div');
    toolbar.className = 'feed-toolbar';

    var title = document.createElement('div');
    title.className = 'feed-title';
    title.textContent = 'Лента';
    toolbar.appendChild(title);
    container.appendChild(toolbar);

    var content = document.createElement('div');
    content.className = 'feed-content';
    content.id = 'feed-content';
    container.appendChild(content);

    var bottomNav = BottomNav.render('feed');
    container.appendChild(bottomNav);

    this.page = 0;
    this.items = [];
    this.loadFeed();
  },

  loadFeed: function() {
    if (this.loading) return;
    this.loading = true;

    var content = document.getElementById('feed-content');
    if (!content) return;

    if (this.page === 0) {
      content.innerHTML = '<div class="feed-loading"><div class="spinner"></div></div>';
    }

    var self = this;
    var recent = WatchHistory.getRecent(10);

    var token = Storage.getToken();
    if (!token) {
      self.loading = false;
      self.renderEmpty(content, 'Войдите, чтобы видеть ленту');
      return;
    }

    var promises = [
      DiscoverApi.getWatching(0, token).catch(function() { return null; }),
      DiscoverApi.getDiscussing(token).catch(function() { return null; })
    ];

    Promise.all(promises).then(function(results) {
      self.loading = false;
      content.innerHTML = '';

      var hasContent = false;

      if (recent.length > 0) {
        var recentSection = self.createSection('Продолжить просмотр', null);
        var recentGrid = document.createElement('div');
        recentGrid.className = 'feed-recent-list';

        for (var i = 0; i < recent.length; i++) {
          var entry = recent[i];
          var card = self.createRecentCard(entry);
          recentGrid.appendChild(card);
        }

        recentSection.appendChild(recentGrid);
        content.appendChild(recentSection);
        hasContent = true;
      }

      var watching = results[0];
      if (watching && watching.content && watching.content.length > 0) {
        var watchSection = self.createSection('Сейчас смотрят', null);
        var watchGrid = document.createElement('div');
        watchGrid.className = 'feed-grid';

        for (var j = 0; j < watching.content.length; j++) {
          var release = watching.content[j];
          var wCard = self.createFeedCard(release);
          watchGrid.appendChild(wCard);
        }

        watchSection.appendChild(watchGrid);
        content.appendChild(watchSection);
        hasContent = true;
      }

      var discussing = results[1];
      if (discussing && discussing.content && discussing.content.length > 0) {
        var discSection = self.createSection('Обсуждаемое', null);
        var discGrid = document.createElement('div');
        discGrid.className = 'feed-grid';

        for (var k = 0; k < discussing.content.length; k++) {
          var dRelease = discussing.content[k];
          var dCard = self.createFeedCard(dRelease);
          discGrid.appendChild(dCard);
        }

        discSection.appendChild(discGrid);
        content.appendChild(discSection);
        hasContent = true;
      }

      if (!hasContent) {
        self.renderEmpty(content, 'Лента пуста');
      }

      setTimeout(function() {
        var first = content.querySelector('[data-focusable]');
        if (first) FocusManager.setFocus(first);
      }, 100);

    }).catch(function(err) {
      self.loading = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Feed: load failed', err);
      self.renderEmpty(content, 'Ошибка загрузки');
    });
  },

  renderEmpty: function(container, text) {
    container.innerHTML = '<div class="feed-empty">' + text + '</div>';
  },

  createSection: function(titleText) {
    var section = document.createElement('div');
    section.className = 'feed-section';

    var header = document.createElement('div');
    header.className = 'feed-section-header';
    header.textContent = titleText;
    section.appendChild(header);

    return section;
  },

  createRecentCard: function(entry) {
    var card = document.createElement('div');
    card.className = 'feed-recent-card';
    card.setAttribute('data-focusable', 'true');

    var info = document.createElement('div');
    info.className = 'feed-recent-info';

    var title = document.createElement('div');
    title.className = 'feed-recent-title';
    title.textContent = 'Релиз #' + entry.releaseId;
    info.appendChild(title);

    var epText = document.createElement('div');
    epText.className = 'feed-recent-ep';
    epText.textContent = 'Эпизод ' + (entry.data.episodeIndex + 1);
    info.appendChild(epText);

    if (entry.data.duration > 0) {
      var progressWrap = document.createElement('div');
      progressWrap.className = 'feed-recent-progress';
      var progressBar = document.createElement('div');
      progressBar.className = 'feed-recent-progress-bar';
      var pct = Math.min(100, (entry.data.currentTime / entry.data.duration) * 100);
      progressBar.style.width = pct + '%';
      progressWrap.appendChild(progressBar);
      info.appendChild(progressWrap);
    }

    card.appendChild(info);

    (function(releaseId, epIdx) {
      card.addEventListener('click', function() {
        App.showScreen('details', { releaseId: parseInt(releaseId) });
      });
    })(entry.releaseId, entry.data.episodeIndex);

    return card;
  },

  createFeedCard: function(release) {
    var card = document.createElement('div');
    card.className = 'feed-card';
    card.setAttribute('data-focusable', 'true');

    var poster = document.createElement('div');
    poster.className = 'feed-card-poster';
    var img = document.createElement('img');
    img.src = release.image || release.poster || '';
    img.alt = release.title_ru || release.title || '';
    img.loading = 'lazy';
    img.onerror = function() { this.style.background = 'var(--color-surface)'; };
    poster.appendChild(img);
    card.appendChild(poster);

    var info = document.createElement('div');
    info.className = 'feed-card-info';

    var title = document.createElement('div');
    title.className = 'feed-card-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'feed-card-meta';
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
