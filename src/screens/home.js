var HomeScreen = {
  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-home';

    var toolbar = this.createToolbar();
    container.appendChild(toolbar);

    var mainScroll = document.createElement('div');
    mainScroll.id = 'main-scroll';
    mainScroll.className = 'main-scroll';

    var content = document.createElement('div');
    content.className = 'home-content';
    content.id = 'home-content';

    var skeleton = this.createSkeleton();
    content.appendChild(skeleton);

    mainScroll.appendChild(content);
    container.appendChild(mainScroll);

    var bottomNav = BottomNav.render('home');
    container.appendChild(bottomNav);

    this.loadData();
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

    toolbar.appendChild(searchBar);

    var actions = document.createElement('div');
    actions.className = 'toolbar-actions';

    var settingsBtn = document.createElement('button');
    settingsBtn.className = 'toolbar-btn';
    settingsBtn.setAttribute('data-focusable', 'true');
    settingsBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z" fill="currentColor"/></svg>';
    actions.appendChild(settingsBtn);

    var notifBtn = document.createElement('button');
    notifBtn.className = 'toolbar-btn';
    notifBtn.setAttribute('data-focusable', 'true');
    notifBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/></svg>';
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

  loadData: function() {
    var token = Storage.getToken();
    var content = document.getElementById('home-content');
    var skeleton = document.getElementById('skeleton');

    var promises = [
      DiscoverApi.getInteresting().catch(function() { return null; })
    ];

    if (token) {
      promises.push(
        DiscoverApi.getRecommendations(0, 0, token).catch(function() { return null; }),
        DiscoverApi.getWatching(0, token).catch(function() { return null; }),
        DiscoverApi.getDiscussing(token).catch(function() { return null; })
      );
    }

    Promise.all(promises).then(function(results) {
      if (skeleton) skeleton.remove();

      var interesting = results[0];
      if (interesting && interesting.content && interesting.content.length > 0) {
        var interestingSection = HomeScreen.createInterestingSection(interesting.content);
        content.appendChild(interestingSection);
      }

      if (token) {
        var recommendations = results[1];
        if (recommendations && recommendations.content && recommendations.content.length > 0) {
          var recSection = HomeScreen.createReleaseSection(
            'Рекомендации',
            'На основе ваших оценок',
            recommendations.content,
            true
          );
          content.appendChild(recSection);
        }

        var watching = results[2];
        if (watching && watching.content && watching.content.length > 0) {
          var watchSection = HomeScreen.createReleaseSection(
            'Смотрят сейчас',
            null,
            watching.content,
            true
          );
          content.appendChild(watchSection);
        }

        var discussing = results[3];
        if (discussing && discussing.content && discussing.content.length > 0) {
          var discSection = HomeScreen.createReleaseSection(
            'Обсуждаемое сегодня',
            null,
            discussing.content,
            false
          );
          content.appendChild(discSection);
        }
      }

      setTimeout(function() {
        FocusManager.focusFirst(content);
      }, 100);

    }).catch(function(err) {
      if (skeleton) skeleton.remove();
      var errorEl = document.createElement('div');
      errorEl.className = 'error-state';
      errorEl.textContent = 'Ошибка загрузки. Нажмите OK для повтора.';
      errorEl.setAttribute('data-focusable', 'true');
      errorEl.addEventListener('click', function() {
        content.innerHTML = '';
        var newSkeleton = HomeScreen.createSkeleton();
        content.appendChild(newSkeleton);
        HomeScreen.loadData();
      });
      content.appendChild(errorEl);
    });
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
    var release = item.release || item;
    var card = document.createElement('div');
    card.className = 'interesting-card';
    card.setAttribute('data-focusable', 'true');
    card.setAttribute('data-release-id', release.id || '');

    var img = document.createElement('img');
    img.className = 'interesting-poster';
    img.alt = release.title_ru || release.title || '';
    img.loading = 'lazy';
    if (release.image) {
      img.src = release.image;
    } else if (release.poster) {
      img.src = release.poster;
    }
    img.onerror = function() { this.style.display = 'none'; };
    card.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'interesting-overlay';

    var title = document.createElement('div');
    title.className = 'interesting-title';
    title.textContent = release.title_ru || release.title || '';
    overlay.appendChild(title);

    card.appendChild(overlay);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
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
      this.style.background = 'var(--color-surface)';
    };
    posterWrap.appendChild(img);

    if (release.status) {
      var statusBubble = document.createElement('div');
      statusBubble.className = 'release-status';
      var statusTexts = { 1: 'Онгоинг', 2: 'Вышел', 3: 'Анонс' };
      statusBubble.textContent = statusTexts[release.status] || '';
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
      grade.textContent = parseFloat(release.grade).toFixed(1);
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
