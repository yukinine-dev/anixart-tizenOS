var DetailsScreen = {
  currentRelease: null,

  render: function(params) {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-details';

    var loading = document.createElement('div');
    loading.className = 'details-loading';
    loading.id = 'details-loading';

    var spinner = document.createElement('div');
    spinner.className = 'spinner';
    loading.appendChild(spinner);
    container.appendChild(loading);

    this.loadRelease(params.releaseId);
  },

  loadRelease: function(releaseId) {
    var token = Storage.getToken();
    var self = this;

    if (typeof Debug !== 'undefined') Debug.log('info', 'Details: loading release ' + releaseId);

    ReleaseApi.getRelease(releaseId, token).then(function(response) {
      var release = response.release || response;
      self.currentRelease = release;
      if (typeof Debug !== 'undefined') Debug.log('info', 'Details: loaded "' + (release.title_ru || release.title || releaseId) + '"');
      self.renderRelease(release);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Details: failed to load release ' + releaseId, err);
      var container = document.getElementById('app');
      container.innerHTML = '<div class="error-state">Ошибка загрузки</div>';
    });
  },

  renderRelease: function(release) {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-details';

    var bgPoster = document.createElement('div');
    bgPoster.className = 'details-bg-poster';
    if (release.image || release.poster) {
      bgPoster.style.backgroundImage = 'url(' + (release.image || release.poster) + ')';
    }
    container.appendChild(bgPoster);

    var gradient = document.createElement('div');
    gradient.className = 'details-gradient';
    container.appendChild(gradient);

    var scroll = document.createElement('div');
    scroll.className = 'details-scroll';
    scroll.id = 'main-scroll';

    var hero = document.createElement('div');
    hero.className = 'details-hero';

    var posterCard = document.createElement('div');
    posterCard.className = 'details-poster-card';
    var posterImg = document.createElement('img');
    posterImg.className = 'details-poster';
    posterImg.src = release.image || release.poster || '';
    posterImg.alt = release.title_ru || release.title || '';
    posterCard.appendChild(posterImg);
    hero.appendChild(posterCard);

    var titleBlock = document.createElement('div');
    titleBlock.className = 'details-title-block';

    var title = document.createElement('h1');
    title.className = 'details-title';
    title.textContent = release.title_ru || release.title || '';
    titleBlock.appendChild(title);

    if (release.title_en || release.title_original) {
      var enTitle = document.createElement('div');
      enTitle.className = 'details-title-en';
      enTitle.textContent = release.title_en || release.title_original || '';
      titleBlock.appendChild(enTitle);
    }

    var badges = document.createElement('div');
    badges.className = 'details-badges';

    if (release.year) {
      var yearBadge = document.createElement('span');
      yearBadge.className = 'badge';
      yearBadge.textContent = release.year;
      badges.appendChild(yearBadge);
    }

    if (release.age_rating) {
      var ageBadge = document.createElement('span');
      ageBadge.className = 'badge badge-age';
      ageBadge.textContent = release.age_rating + '+';
      badges.appendChild(ageBadge);
    }

    if (release.status && release.status.name) {
      var statusBadge = document.createElement('span');
      statusBadge.className = 'badge';
      statusBadge.textContent = release.status.name;
      badges.appendChild(statusBadge);
    }

    if (release.episodes_total) {
      var epBadge = document.createElement('span');
      epBadge.className = 'badge';
      epBadge.textContent = release.episodes_total + ' эп.';
      badges.appendChild(epBadge);
    }

    if (release.grade) {
      var gradeBadge = document.createElement('span');
      gradeBadge.className = 'badge';
      gradeBadge.textContent = parseFloat(release.grade).toFixed(1);
      badges.appendChild(gradeBadge);
    }

    titleBlock.appendChild(badges);
    hero.appendChild(titleBlock);
    scroll.appendChild(hero);

    var actions = document.createElement('div');
    actions.className = 'details-actions';

    var watchBtn = document.createElement('button');
    watchBtn.className = 'details-watch-btn';
    watchBtn.setAttribute('data-focusable', 'true');
    watchBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> <span>Смотреть</span>';
    watchBtn.addEventListener('click', function() {
      DetailsScreen.showVoiceoverPicker(release);
    });
    actions.appendChild(watchBtn);

    var favBtn = document.createElement('button');
    favBtn.className = 'details-action-btn';
    favBtn.id = 'details-fav-btn';
    favBtn.setAttribute('data-focusable', 'true');

    if (release.profile_list_status) {
      var statusNames = { 1: 'Смотрю', 2: 'В планах', 3: 'Просмотрено', 4: 'Отложено', 5: 'Брошено' };
      favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg><span>' + (statusNames[release.profile_list_status] || 'Не смотрю') + '</span>';
    } else {
      favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Не смотрю</span>';
    }

    favBtn.addEventListener('click', function() {
      DetailsScreen.showBookmarkPicker(release);
    });
    actions.appendChild(favBtn);

    var favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'details-action-btn';
    favoriteBtn.id = 'details-favorite-btn';
    favoriteBtn.setAttribute('data-focusable', 'true');
    this.renderFavoriteBtn(favoriteBtn, release);
    favoriteBtn.addEventListener('click', function() {
      DetailsScreen.toggleFavorite(release);
    });
    actions.appendChild(favoriteBtn);

    var shareBtn = document.createElement('button');
    shareBtn.className = 'details-action-btn';
    shareBtn.setAttribute('data-focusable', 'true');
    shareBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/></svg><span>Поделиться</span>';
    shareBtn.addEventListener('click', function() {
      DetailsScreen.showShareDialog(release);
    });
    actions.appendChild(shareBtn);

    scroll.appendChild(actions);

    if (release.description) {
      var descSection = document.createElement('div');
      descSection.className = 'details-section';
      var descTitle = document.createElement('div');
      descTitle.className = 'details-section-title';
      descTitle.textContent = 'Описание';
      descSection.appendChild(descTitle);
      var descText = document.createElement('div');
      descText.className = 'details-description';
      descText.textContent = release.description;
      descSection.appendChild(descText);
      scroll.appendChild(descSection);
    }

    if (release.genres) {
      var genreNames = release.genres.split(',').map(function(g) { return g.trim(); }).filter(Boolean);
      if (genreNames.length > 0) {
        var genresSection = document.createElement('div');
        genresSection.className = 'details-section';
        var genresTitle = document.createElement('div');
        genresTitle.className = 'details-section-title';
        genresTitle.textContent = 'Жанры';
        genresSection.appendChild(genresTitle);
        var genresList = document.createElement('div');
        genresList.className = 'details-genres';
        for (var i = 0; i < genreNames.length; i++) {
          var chip = document.createElement('span');
          chip.className = 'genre-chip';
          chip.textContent = genreNames[i];
          genresList.appendChild(chip);
        }
        genresSection.appendChild(genresList);
        scroll.appendChild(genresSection);
      }
    }

    this.renderExtraSections(release, scroll);

    container.appendChild(scroll);

    setTimeout(function() {
      FocusManager.setFocus(watchBtn);
    }, 200);
  },

  loadedEpisodes: [],
  loadedVoiceovers: [],
  currentVoiceoverIndex: 0,

  voiceoverFilter: 'all',

  formatCount: function(n) {
    n = n || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'K';
    return String(n);
  },

  showVoiceoverPicker: function(release) {
    if (document.getElementById('voiceover-picker')) return;

    var self = this;
    this.voiceoverFilter = 'all';

    var picker = document.createElement('div');
    picker.className = 'voiceover-picker';
    picker.id = 'voiceover-picker';

    var closeDialog = function() {
      picker.remove();
    };
    picker.closeDialog = closeDialog;

    var header = document.createElement('div');
    header.className = 'voiceover-picker-header';

    var backBtn = document.createElement('button');
    backBtn.className = 'voiceover-picker-back';
    backBtn.setAttribute('data-focusable', 'true');
    backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
    backBtn.addEventListener('click', closeDialog);
    header.appendChild(backBtn);

    var headerTitle = document.createElement('div');
    headerTitle.className = 'voiceover-picker-title';
    headerTitle.textContent = 'Выберите вариант';
    header.appendChild(headerTitle);

    picker.appendChild(header);

    var tabs = document.createElement('div');
    tabs.className = 'voiceover-filter-tabs';
    tabs.id = 'voiceover-filter-tabs';
    picker.appendChild(tabs);

    var list = document.createElement('div');
    list.className = 'voiceover-list voiceover-list-fullscreen';
    list.id = 'voiceover-list';
    list.innerHTML = '<div class="episodes-loading">Загрузка...</div>';
    picker.appendChild(list);

    document.body.appendChild(picker);

    setTimeout(function() { FocusManager.setFocus(backBtn); }, 50);

    var token = Storage.getToken();
    ReleaseApi.getVoiceovers(release.id, token).then(function(response) {
      var voiceovers = response.types || [];
      self.loadedVoiceovers = voiceovers;
      list.innerHTML = '';

      if (voiceovers.length === 0) {
        list.innerHTML = '<div class="episodes-empty">Нет доступных озвучек</div>';
        return;
      }

      if (voiceovers.length > 1) {
        var filters = [{ id: 'all', label: 'Все' }, { id: 'voice', label: 'Озвучки' }, { id: 'sub', label: 'Субтитры' }];
        for (var f = 0; f < filters.length; f++) {
          var tabBtn = document.createElement('button');
          tabBtn.className = 'voiceover-filter-tab' + (filters[f].id === 'all' ? ' active' : '');
          tabBtn.setAttribute('data-focusable', 'true');
          tabBtn.setAttribute('data-filter', filters[f].id);
          tabBtn.textContent = filters[f].label;
          (function(filterId) {
            tabBtn.addEventListener('click', function() {
              DetailsScreen.setVoiceoverFilter(filterId);
            });
          })(filters[f].id);
          tabs.appendChild(tabBtn);
        }
      }

      self.renderVoiceoverList(release);

      setTimeout(function() {
        var first = list.querySelector('[data-focusable]');
        if (first) FocusManager.setFocus(first);
      }, 50);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Voiceovers: failed to load', err);
      list.innerHTML = '<div class="episodes-empty">Ошибка загрузки</div>';
    });
  },

  setVoiceoverFilter: function(filterId) {
    this.voiceoverFilter = filterId;
    var tabs = document.querySelectorAll('.voiceover-filter-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-filter') === filterId);
    }
    this.renderVoiceoverList(this.currentRelease);
  },

  renderVoiceoverList: function(release) {
    var list = document.getElementById('voiceover-list');
    if (!list) return;
    list.innerHTML = '';

    var voiceovers = this.loadedVoiceovers;
    var filter = this.voiceoverFilter;

    for (var i = 0; i < voiceovers.length; i++) {
      var vo = voiceovers[i];
      if (filter === 'voice' && vo.is_sub) continue;
      if (filter === 'sub' && !vo.is_sub) continue;

      var row = document.createElement('button');
      row.className = 'voiceover-row';
      row.setAttribute('data-focusable', 'true');

      var icon = document.createElement('div');
      icon.className = 'voiceover-icon';
      if (vo.icon) {
        var iconImg = document.createElement('img');
        iconImg.src = vo.icon;
        iconImg.alt = '';
        iconImg.onerror = function() { this.parentNode.classList.add('voiceover-icon-fallback'); this.remove(); };
        icon.appendChild(iconImg);
      } else {
        icon.classList.add('voiceover-icon-fallback');
        icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/></svg>';
      }
      row.appendChild(icon);

      var info = document.createElement('div');
      info.className = 'voiceover-info';

      var nameRow = document.createElement('div');
      nameRow.className = 'voiceover-name-row';
      var name = document.createElement('span');
      name.className = 'voiceover-name';
      name.textContent = vo.name || ('Озвучка ' + (i + 1));
      nameRow.appendChild(name);
      if (vo.is_sub) {
        var badge = document.createElement('span');
        badge.className = 'voiceover-badge';
        badge.textContent = 'СУБТИТРЫ';
        nameRow.appendChild(badge);
      }
      info.appendChild(nameRow);

      var meta = document.createElement('div');
      meta.className = 'voiceover-meta';
      meta.textContent = (vo.episodes_count || 0) + ' эп.';
      info.appendChild(meta);

      row.appendChild(info);

      var views = document.createElement('div');
      views.className = 'voiceover-views';
      views.innerHTML = '<span>' + DetailsScreen.formatCount(vo.view_count) + '</span><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>';
      row.appendChild(views);

      row.addEventListener('click', function(voId) {
        return function() { DetailsScreen.selectVoiceover(release, voId); };
      }(vo.id));

      list.appendChild(row);
    }
  },

  selectVoiceover: function(release, voiceoverId) {
    var list = document.getElementById('voiceover-list');
    if (list) list.innerHTML = '<div class="episodes-loading">Загрузка...</div>';

    var token = Storage.getToken();
    var self = this;

    ReleaseApi.getSources(release.id, voiceoverId, token).then(function(response) {
      var sources = response.sources || [];
      if (sources.length === 0) {
        if (list) list.innerHTML = '<div class="episodes-empty">Нет доступных источников</div>';
        return null;
      }
      return ReleaseApi.getEpisodes(release.id, voiceoverId, sources[0].id, token);
    }).then(function(response) {
      if (!response) return;
      var episodes = response.episodes || [];
      if (episodes.length === 0) {
        if (list) list.innerHTML = '<div class="episodes-empty">Нет доступных эпизодов</div>';
        return;
      }
      self.loadedEpisodes = episodes;

      var episodeIndex = 0;
      if (typeof WatchHistory !== 'undefined') {
        var saved = WatchHistory.get(release.id);
        if (saved && saved.episodeIndex < episodes.length) episodeIndex = saved.episodeIndex;
      }

      var picker = document.getElementById('voiceover-picker');
      if (picker) picker.remove();

      App.showScreen('player', {
        releaseId: release.id,
        releaseTitle: release.title_ru || release.title || '',
        episodes: episodes,
        episodeIndex: episodeIndex
      });
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Episodes: failed to load for release ' + release.id, err);
      if (list) list.innerHTML = '<div class="episodes-empty">Ошибка загрузки</div>';
    });
  },

  addSection: function(scroll, titleText) {
    var section = document.createElement('div');
    section.className = 'details-section';
    var title = document.createElement('div');
    title.className = 'details-section-title';
    title.textContent = titleText;
    section.appendChild(title);
    scroll.appendChild(section);
    return section;
  },

  renderExtraSections: function(release, scroll) {
    this.renderVideoSection(release, scroll);
    this.renderRatingSection(release, scroll);
    this.renderScreenshotsSection(release, scroll);
    this.renderCollectionActions(release, scroll);
    this.renderRecommendedSection(release, scroll);
    this.renderCommentsSection(release, scroll);
  },

  renderCollectionActions: function(release, scroll) {
    var token = Storage.getToken();
    var row = document.createElement('div');
    row.className = 'details-collection-actions';

    var showBtn = document.createElement('button');
    showBtn.className = 'details-collection-btn';
    showBtn.setAttribute('data-focusable', 'true');
    showBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm2 5h12v2H6zm3 5h6v2H9z" fill="currentColor"/></svg><span>Показать в коллекциях</span>' +
      (release.collection_count ? '<span class="details-collection-count">' + release.collection_count + '</span>' : '');
    showBtn.addEventListener('click', function() {
      App.showScreen('release-list', { mode: 'release-collections', title: 'Коллекции', releaseId: release.id });
    });
    row.appendChild(showBtn);

    if (token) {
      var addBtn = document.createElement('button');
      addBtn.className = 'details-collection-btn';
      addBtn.setAttribute('data-focusable', 'true');
      addBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm-1 9h-3v3h-2v-3H8v-2h3V7h2v3h3v2z" fill="currentColor"/></svg><span>Добавить себе в коллекцию</span>';
      addBtn.addEventListener('click', function() {
        DetailsScreen.showCollectionPicker(release);
      });
      row.appendChild(addBtn);
    }

    scroll.appendChild(row);
  },

  showCollectionPicker: function(release) {
    if (document.getElementById('collection-picker')) return;

    var picker = document.createElement('div');
    picker.className = 'bookmark-picker';
    picker.id = 'collection-picker';

    var closeDialog = function() { picker.remove(); };
    picker.closeDialog = closeDialog;

    var sheet = document.createElement('div');
    sheet.className = 'bookmark-picker-sheet tab-settings-picker-sheet';

    var title = document.createElement('div');
    title.className = 'bookmark-picker-title';
    title.textContent = 'Выбор коллекции';
    sheet.appendChild(title);

    var list = document.createElement('div');
    list.className = 'tab-settings-picker-list';
    list.innerHTML = '<div class="episodes-loading">Загрузка...</div>';
    sheet.appendChild(list);

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'bookmark-picker-cancel';
    cancelBtn.setAttribute('data-focusable', 'true');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', closeDialog);
    sheet.appendChild(cancelBtn);

    picker.appendChild(sheet);
    document.getElementById('app').appendChild(picker);
    setTimeout(function() { FocusManager.setFocus(cancelBtn); }, 50);
    picker.addEventListener('click', function(e) { if (e.target === picker) closeDialog(); });

    var token = Storage.getToken();
    var profile = Storage.getProfile();
    if (!profile) { list.innerHTML = '<div class="episodes-empty">Ошибка</div>'; return; }

    CollectionApi.getUserCollections(profile.id, 0, token).then(function(response) {
      var collections = response.content || [];
      list.innerHTML = '';

      if (collections.length === 0) {
        list.innerHTML = '<div class="episodes-empty">У вас пока нет коллекций</div>';
        return;
      }

      for (var i = 0; i < collections.length; i++) {
        (function(collection) {
          var btn = document.createElement('button');
          btn.className = 'bookmark-picker-item';
          btn.setAttribute('data-focusable', 'true');
          btn.textContent = collection.title;
          btn.addEventListener('click', function() {
            DetailsScreen.addToCollection(release, collection, btn);
          });
          list.appendChild(btn);
        })(collections[i]);
      }

      setTimeout(function() {
        var first = list.querySelector('[data-focusable]');
        if (first) FocusManager.setFocus(first);
      }, 50);
    }).catch(function() {
      list.innerHTML = '<div class="episodes-empty">Ошибка загрузки</div>';
    });
  },

  addToCollection: function(release, collection, btn) {
    var token = Storage.getToken();
    btn.textContent = collection.title + ' — добавляем...';
    CollectionApi.addReleaseToCollection(collection.id, release.id, token).then(function() {
      btn.textContent = collection.title + ' — добавлено';
      setTimeout(function() {
        var picker = document.getElementById('collection-picker');
        if (picker) picker.remove();
      }, 700);
    }).catch(function(err) {
      btn.textContent = collection.title;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Collection: add release failed', err);
    });
  },

  renderRecommendedSection: function(release, scroll) {
    var items = release.recommended_releases;
    if (!items || items.length === 0) return;

    var section = HomeScreen.createReleaseSection('Рекомендуем также', null, items, false);
    scroll.appendChild(section);
  },

  renderVideoSection: function(release, scroll) {
    var banners = release.video_banners;
    if (!banners || banners.length === 0) return;

    var section = this.addSection(scroll, 'Видео');
    var row = document.createElement('div');
    row.className = 'video-banner-row';

    for (var i = 0; i < banners.length; i++) {
      var b = banners[i];
      var card = document.createElement('div');
      card.className = 'video-banner-card';
      card.setAttribute('data-focusable', 'true');

      var inner = document.createElement('div');
      inner.className = 'video-banner-card-inner';
      card.appendChild(inner);

      var img = document.createElement('img');
      img.className = 'video-banner-image';
      img.src = b.image || '';
      img.alt = '';
      inner.appendChild(img);

      if (b.is_new) {
        var newBadge = document.createElement('span');
        newBadge.className = 'video-banner-new';
        newBadge.textContent = 'new';
        inner.appendChild(newBadge);
      }

      var label = document.createElement('div');
      label.className = 'video-banner-label';
      label.textContent = b.name || '';
      inner.appendChild(label);

      var videoId = DetailsScreen.extractYoutubeId(b.image);
      card.addEventListener('click', function(id, name) {
        return function() {
          if (id) DetailsScreen.showVideoPlayer(id, name);
        };
      }(videoId, b.name));

      row.appendChild(card);
    }

    section.appendChild(row);
  },

  // Banners only carry a YouTube thumbnail URL (img.youtube.com/vi/<id>/hqdefault.jpg),
  // not the video id directly -- pull it out of that URL.
  extractYoutubeId: function(thumbUrl) {
    if (!thumbUrl) return null;
    var m = thumbUrl.match(/\/vi\/([^\/]+)\//);
    return m ? m[1] : null;
  },

  showVideoPlayer: function(videoId, title) {
    if (document.getElementById('video-player-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'video-player-overlay';
    overlay.id = 'video-player-overlay';

    var closeDialog = function() { overlay.remove(); };
    overlay.closeDialog = closeDialog;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'video-player-close';
    closeBtn.setAttribute('data-focusable', 'true');
    closeBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>';
    closeBtn.addEventListener('click', closeDialog);
    overlay.appendChild(closeBtn);

    var iframe = document.createElement('iframe');
    iframe.className = 'video-player-iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0&modestbranding=1';
    overlay.appendChild(iframe);

    document.body.appendChild(overlay);
    setTimeout(function() { FocusManager.setFocus(closeBtn); }, 50);
  },

  renderRatingSection: function(release, scroll) {
    var isAnnounced = release.status && release.status.name && release.status.name.toLowerCase() === 'анонс';
    if (isAnnounced) return;

    var section = this.addSection(scroll, 'Рейтинг');
    var card = document.createElement('div');
    card.className = 'details-rating-card';

    var wrap = document.createElement('div');
    wrap.className = 'rating-wrap';
    wrap.setAttribute('data-focusable', 'true');

    var scoreCol = document.createElement('div');
    scoreCol.className = 'rating-score-col';
    var scoreVal = document.createElement('div');
    scoreVal.className = 'rating-score-value';
    scoreVal.textContent = parseFloat(release.grade || 0).toFixed(1);
    scoreCol.appendChild(scoreVal);
    var scoreCount = document.createElement('div');
    scoreCount.className = 'rating-score-count';
    scoreCount.textContent = (release.vote_count || 0) + ' голосов';
    scoreCol.appendChild(scoreCount);
    wrap.appendChild(scoreCol);

    var bars = document.createElement('div');
    bars.className = 'rating-bars';
    var maxVotes = Math.max(
      release.vote_1_count || 0, release.vote_2_count || 0,
      release.vote_3_count || 0, release.vote_4_count || 0,
      release.vote_5_count || 0, 1
    );
    for (var star = 5; star >= 1; star--) {
      var count = release['vote_' + star + '_count'] || 0;
      var barRow = document.createElement('div');
      barRow.className = 'rating-bar-row';
      var starLabel = document.createElement('span');
      starLabel.className = 'rating-bar-label';
      starLabel.textContent = star;
      barRow.appendChild(starLabel);
      var track = document.createElement('div');
      track.className = 'rating-bar-track';
      var fill = document.createElement('div');
      fill.className = 'rating-bar-fill';
      fill.style.width = Math.round((count / maxVotes) * 100) + '%';
      track.appendChild(fill);
      barRow.appendChild(track);
      bars.appendChild(barRow);
    }
    wrap.appendChild(bars);

    card.appendChild(wrap);

    var token = Storage.getToken();
    if (token) {
      var rateBtn = document.createElement('button');
      rateBtn.className = 'rating-rate-btn';
      rateBtn.id = 'rating-rate-btn';
      rateBtn.setAttribute('data-focusable', 'true');
      this.renderRateBtn(rateBtn, release.your_vote);
      rateBtn.addEventListener('click', function() {
        DetailsScreen.showRatingPicker(release);
      });
      card.appendChild(rateBtn);
    }

    var items = [
      { key: 'watching_count', label: 'Смотрю', color: '#73c978' },
      { key: 'plan_count', label: 'В планах', color: '#c373c9' },
      { key: 'completed_count', label: 'Просмотрено', color: '#6979ce' },
      { key: 'hold_on_count', label: 'Отложено', color: '#ffd468' },
      { key: 'dropped_count', label: 'Брошено', color: '#ff605b' }
    ];
    var active = [];
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      var val = release[items[i].key] || 0;
      if (val > 0) {
        active.push({ label: items[i].label, color: items[i].color, value: val });
        total += val;
      }
    }

    if (total > 0) {
      var divider = document.createElement('div');
      divider.className = 'details-inner-divider';
      card.appendChild(divider);

      var listsTitle = document.createElement('div');
      listsTitle.className = 'details-subsection-title';
      listsTitle.textContent = 'В списках у людей';
      card.appendChild(listsTitle);

      var listsWrap = document.createElement('div');
      listsWrap.className = 'lists-wrap';
      listsWrap.setAttribute('data-focusable', 'true');

      var bar = document.createElement('div');
      bar.className = 'lists-bar';
      for (var j = 0; j < active.length; j++) {
        var seg = document.createElement('div');
        seg.className = 'lists-bar-segment';
        seg.style.width = ((active[j].value / total) * 100) + '%';
        seg.style.background = active[j].color;
        bar.appendChild(seg);
      }
      listsWrap.appendChild(bar);

      var legend = document.createElement('div');
      legend.className = 'lists-legend';
      for (var k = 0; k < active.length; k++) {
        var entry = document.createElement('div');
        entry.className = 'lists-legend-item';
        var dot = document.createElement('span');
        dot.className = 'lists-legend-dot';
        dot.style.background = active[k].color;
        entry.appendChild(dot);
        var text = document.createElement('span');
        text.textContent = active[k].label + ' ' + active[k].value.toLocaleString('ru-RU');
        entry.appendChild(text);
        legend.appendChild(entry);
      }
      listsWrap.appendChild(legend);

      card.appendChild(listsWrap);
    }

    section.appendChild(card);
  },

  renderRateBtn: function(btn, yourVote) {
    btn.innerHTML = yourVote
      ? '<span>Ваша оценка: ' + yourVote + ' ★</span><span class="rating-rate-btn-edit">изменить</span>'
      : '<span>Оценить</span>';
  },

  showRatingPicker: function(release) {
    if (document.getElementById('rating-picker')) return;

    var picker = document.createElement('div');
    picker.className = 'bookmark-picker';
    picker.id = 'rating-picker';

    var closeDialog = function() { picker.remove(); };
    picker.closeDialog = closeDialog;

    var sheet = document.createElement('div');
    sheet.className = 'bookmark-picker-sheet rating-picker-sheet';

    var title = document.createElement('div');
    title.className = 'bookmark-picker-title';
    title.textContent = 'Оценка';
    sheet.appendChild(title);

    var stars = document.createElement('div');
    stars.className = 'rating-picker-stars';

    for (var v = 1; v <= 5; v++) {
      var starBtn = document.createElement('button');
      starBtn.className = 'rating-picker-star' + (release.your_vote >= v ? ' filled' : '');
      starBtn.setAttribute('data-focusable', 'true');
      starBtn.setAttribute('data-value', v);
      starBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>';
      (function(vote) {
        starBtn.addEventListener('click', function() {
          DetailsScreen.submitRating(release, vote);
        });
      })(v);
      stars.appendChild(starBtn);
    }
    sheet.appendChild(stars);

    if (release.your_vote) {
      var removeBtn = document.createElement('button');
      removeBtn.className = 'bookmark-picker-remove';
      removeBtn.setAttribute('data-focusable', 'true');
      removeBtn.textContent = 'Убрать оценку';
      removeBtn.addEventListener('click', function() {
        DetailsScreen.submitRating(release, null);
      });
      sheet.appendChild(removeBtn);
    }

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'bookmark-picker-cancel';
    cancelBtn.setAttribute('data-focusable', 'true');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', closeDialog);
    sheet.appendChild(cancelBtn);

    picker.appendChild(sheet);
    document.getElementById('app').appendChild(picker);

    setTimeout(function() {
      var filled = stars.querySelector('.rating-picker-star.filled') || stars.querySelector('[data-focusable]');
      if (filled) FocusManager.setFocus(filled);
    }, 50);

    picker.addEventListener('click', function(e) { if (e.target === picker) closeDialog(); });
  },

  submitRating: function(release, vote) {
    var token = Storage.getToken();
    var request = vote
      ? ReleaseApi.voteAdd(release.id, vote, token)
      : ReleaseApi.voteDelete(release.id, token);

    request.then(function() {
      release.your_vote = vote;
      var btn = document.getElementById('rating-rate-btn');
      if (btn) DetailsScreen.renderRateBtn(btn, vote);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Rating: submit failed', err);
    });

    var picker = document.getElementById('rating-picker');
    if (picker) picker.remove();
  },

  renderScreenshotsSection: function(release, scroll) {
    var images = release.screenshot_images;
    if (!images || images.length === 0) return;

    var section = this.addSection(scroll, 'Кадры');
    var row = document.createElement('div');
    row.className = 'screenshot-row';

    for (var i = 0; i < images.length; i++) {
      var img = document.createElement('img');
      img.className = 'screenshot-image';
      img.setAttribute('data-focusable', 'true');
      img.src = images[i];
      img.alt = '';
      img.loading = 'lazy';
      (function(idx) {
        img.addEventListener('click', function() {
          DetailsScreen.showScreenshotViewer(images, idx);
        });
      })(i);
      row.appendChild(img);
    }

    section.appendChild(row);
  },

  showScreenshotViewer: function(images, index) {
    if (document.getElementById('screenshot-viewer')) return;

    var viewer = document.createElement('div');
    viewer.className = 'screenshot-viewer';
    viewer.id = 'screenshot-viewer';

    var closeDialog = function() { viewer.remove(); };
    viewer.closeDialog = closeDialog;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'screenshot-viewer-close';
    closeBtn.setAttribute('data-focusable', 'true');
    closeBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>';
    closeBtn.addEventListener('click', closeDialog);
    viewer.appendChild(closeBtn);

    var img = document.createElement('img');
    img.className = 'screenshot-viewer-image';
    img.id = 'screenshot-viewer-image';
    img.src = images[index];
    img.alt = '';
    viewer.appendChild(img);

    var counter = document.createElement('div');
    counter.className = 'screenshot-viewer-counter';
    counter.id = 'screenshot-viewer-counter';
    counter.textContent = (index + 1) + ' / ' + images.length;
    viewer.appendChild(counter);

    if (images.length > 1) {
      var prevBtn = document.createElement('button');
      prevBtn.className = 'screenshot-viewer-nav screenshot-viewer-prev';
      prevBtn.setAttribute('data-focusable', 'true');
      prevBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg>';
      prevBtn.addEventListener('click', function() {
        index = (index - 1 + images.length) % images.length;
        img.src = images[index];
        counter.textContent = (index + 1) + ' / ' + images.length;
      });
      viewer.appendChild(prevBtn);

      var nextBtn = document.createElement('button');
      nextBtn.className = 'screenshot-viewer-nav screenshot-viewer-next';
      nextBtn.setAttribute('data-focusable', 'true');
      nextBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" fill="currentColor"/></svg>';
      nextBtn.addEventListener('click', function() {
        index = (index + 1) % images.length;
        img.src = images[index];
        counter.textContent = (index + 1) + ' / ' + images.length;
      });
      viewer.appendChild(nextBtn);
    }

    document.body.appendChild(viewer);
    setTimeout(function() { FocusManager.setFocus(closeBtn); }, 50);
  },

  formatCommentDate: function(timestamp) {
    if (!timestamp) return '';
    var date = new Date(timestamp * 1000);
    var diffMs = Date.now() - date.getTime();
    var diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return diffMin + ' мин назад';
    var diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return diffHours + ' ч назад';
    var d = date;
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  },

  renderCommentsSection: function(release, scroll) {
    var comments = release.comments;
    var token = Storage.getToken();
    var count = release.comments_count || (comments ? comments.length : 0);

    var section = this.addSection(scroll, 'Комментарии (' + count + ')');

    var headerBtns = document.createElement('div');
    headerBtns.className = 'comments-header-btns';

    if (token) {
      var writeBtn = document.createElement('button');
      writeBtn.className = 'comments-header-btn';
      writeBtn.setAttribute('data-focusable', 'true');
      writeBtn.textContent = 'Написать комментарий';
      writeBtn.addEventListener('click', function() {
        DetailsScreen.showCommentEditor(release, null);
      });
      headerBtns.appendChild(writeBtn);
    }

    if (count > 0) {
      var showAllBtn = document.createElement('button');
      showAllBtn.className = 'comments-header-btn';
      showAllBtn.setAttribute('data-focusable', 'true');
      showAllBtn.textContent = 'Показать все';
      showAllBtn.addEventListener('click', function() {
        DetailsScreen.showAllComments(release);
      });
      headerBtns.appendChild(showAllBtn);
    }

    section.appendChild(headerBtns);

    if (comments && comments.length > 0) {
      var list = document.createElement('div');
      list.className = 'comments-list';
      for (var i = 0; i < comments.length; i++) {
        list.appendChild(this.createCommentRow(comments[i], release));
      }
      section.appendChild(list);
    }
  },

  createCommentRow: function(c, release) {
    var self = this;
    var token = Storage.getToken();
    var myProfile = Storage.getProfile();
    var isOwn = !!(myProfile && c.profile && c.profile.id === myProfile.id);
    var isSpoiler = !!(c.is_spoiler || c.isSpoiler);
    var isDeleted = !!(c.is_deleted || c.isDeleted);

    var row = document.createElement('div');
    row.className = 'comment-row';

    var avatarBtn = document.createElement('button');
    avatarBtn.className = 'comment-avatar-btn';
    avatarBtn.setAttribute('data-focusable', 'true');
    var avatar = document.createElement('div');
    avatar.className = 'comment-avatar';
    if (c.profile && c.profile.avatar) {
      var avImg = document.createElement('img');
      avImg.src = c.profile.avatar;
      avImg.alt = '';
      avatar.appendChild(avImg);
    }
    avatarBtn.appendChild(avatar);
    avatarBtn.addEventListener('click', function() {
      if (c.profile && c.profile.id) App.showScreen('profile', { profileId: c.profile.id });
    });
    row.appendChild(avatarBtn);

    var body = document.createElement('div');
    body.className = 'comment-body';

    var head = document.createElement('div');
    head.className = 'comment-head';
    var name = document.createElement('span');
    name.className = 'comment-name';
    name.textContent = (c.profile && c.profile.login) || 'Аноним';
    head.appendChild(name);
    var time = document.createElement('span');
    time.className = 'comment-time';
    time.textContent = this.formatCommentDate(c.timestamp);
    if (c.is_edited || c.isEdited) {
      time.innerHTML += ' <svg width="13" height="13" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>';
    }
    head.appendChild(time);
    body.appendChild(head);

    var messageWrap = document.createElement('div');
    messageWrap.className = 'comment-message-wrap';

    var message = document.createElement('div');
    message.className = 'comment-message';
    message.textContent = isDeleted ? 'Комментарий был удалён.' : (c.message || '');
    messageWrap.appendChild(message);

    var revealed = !isSpoiler;
    if (isSpoiler && !isDeleted) {
      var revealBtn = document.createElement('button');
      revealBtn.className = 'comment-spoiler-cover';
      revealBtn.setAttribute('data-focusable', 'true');
      revealBtn.textContent = 'Может содержать спойлер. Нажмите, чтобы прочитать';
      revealBtn.addEventListener('click', function() {
        revealBtn.remove();
        actions.hidden = false;
      });
      messageWrap.appendChild(revealBtn);
    }
    body.appendChild(messageWrap);

    var actions = document.createElement('div');
    actions.className = 'comment-actions';
    actions.hidden = isSpoiler && !isDeleted;

    if (!isDeleted) {
      var dislikeBtn = document.createElement('button');
      dislikeBtn.className = 'comment-vote-btn' + (c.vote === 1 ? ' active-dislike' : '');
      dislikeBtn.setAttribute('data-focusable', 'true');
      dislikeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" fill="currentColor"/></svg>';
      dislikeBtn.addEventListener('click', function() { self.voteOnComment(c, 1, likeCount, dislikeBtn, likeBtn); });
      actions.appendChild(dislikeBtn);

      var likeCount = document.createElement('span');
      likeCount.className = 'comment-vote-count';
      likeCount.textContent = c.likes_count || c.vote_count || 0;
      actions.appendChild(likeCount);

      var likeBtn = document.createElement('button');
      likeBtn.className = 'comment-vote-btn' + (c.vote === 2 ? ' active-like' : '');
      likeBtn.setAttribute('data-focusable', 'true');
      likeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM1 9v12h4V9H1z" fill="currentColor"/></svg>';
      likeBtn.addEventListener('click', function() { self.voteOnComment(c, 2, likeCount, dislikeBtn, likeBtn); });
      actions.appendChild(likeBtn);

      if (token) {
        var replyBtn = document.createElement('button');
        replyBtn.className = 'comment-action-btn';
        replyBtn.setAttribute('data-focusable', 'true');
        replyBtn.textContent = 'Ответить';
        replyBtn.addEventListener('click', function() {
          self.showCommentEditor(release, c);
        });
        actions.appendChild(replyBtn);
      }

      if (isOwn) {
        var editBtn = document.createElement('button');
        editBtn.className = 'comment-action-btn';
        editBtn.setAttribute('data-focusable', 'true');
        editBtn.textContent = 'Изменить';
        editBtn.addEventListener('click', function() {
          self.showCommentEditor(release, null, c);
        });
        actions.appendChild(editBtn);

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'comment-action-btn comment-action-delete';
        deleteBtn.setAttribute('data-focusable', 'true');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', function() {
          self.deleteComment(c, row);
        });
        actions.appendChild(deleteBtn);
      }
    }

    body.appendChild(actions);

    if (!isDeleted && !isSpoiler && c.reply_count > 0) {
      var repliesWrap = document.createElement('div');
      repliesWrap.className = 'comment-replies';
      repliesWrap.hidden = true;
      body.appendChild(repliesWrap);

      var repliesToggle = document.createElement('button');
      repliesToggle.className = 'comment-action-btn';
      repliesToggle.setAttribute('data-focusable', 'true');
      repliesToggle.textContent = 'Ответы (' + c.reply_count + ')';
      var repliesLoaded = false;
      repliesToggle.addEventListener('click', function() {
        if (!repliesLoaded) {
          var token2 = Storage.getToken();
          ReleaseApi.getCommentReplies(c.id, token2).then(function(response) {
            var replies = response.content || [];
            for (var r = 0; r < replies.length; r++) {
              repliesWrap.appendChild(self.createCommentRow(replies[r], release));
            }
            repliesLoaded = true;
          }).catch(function() {});
        }
        repliesWrap.hidden = !repliesWrap.hidden;
        repliesToggle.textContent = (repliesWrap.hidden ? 'Ответы (' : 'Скрыть ответы (') + c.reply_count + ')';
      });
      actions.appendChild(repliesToggle);
    }

    row.appendChild(body);
    return row;
  },

  voteOnComment: function(comment, action, likeCountEl, dislikeBtn, likeBtn) {
    var token = Storage.getToken();
    if (!token) return;

    var wasVote = comment.vote || 0;
    var newVote, delta;
    if (action === 2) {
      if (wasVote === 2) { newVote = 0; delta = -1; }
      else if (wasVote === 1) { newVote = 2; delta = 2; }
      else { newVote = 2; delta = 1; }
    } else {
      if (wasVote === 1) { newVote = 0; delta = 1; }
      else if (wasVote === 2) { newVote = 1; delta = -2; }
      else { newVote = 1; delta = -1; }
    }

    comment.vote = newVote;
    comment.likes_count = (comment.likes_count || 0) + delta;
    likeCountEl.textContent = comment.likes_count;
    dislikeBtn.classList.toggle('active-dislike', newVote === 1);
    likeBtn.classList.toggle('active-like', newVote === 2);

    ReleaseApi.voteComment(comment.id, action, token).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Comment: vote failed', err);
    });
  },

  deleteComment: function(comment, row) {
    var token = Storage.getToken();
    if (!token) return;
    ReleaseApi.deleteComment(comment.id, token).then(function() {
      row.remove();
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Comment: delete failed', err);
    });
  },

  showCommentEditor: function(release, parentComment, editingComment) {
    if (document.getElementById('comment-editor')) return;

    var isEdit = !!editingComment;
    var isReply = !!parentComment;

    var overlay = document.createElement('div');
    overlay.className = 'bookmark-picker';
    overlay.id = 'comment-editor';

    var closeDialog = function() { overlay.remove(); };
    overlay.closeDialog = closeDialog;

    var sheet = document.createElement('div');
    sheet.className = 'bookmark-picker-sheet comment-editor-sheet';

    var title = document.createElement('div');
    title.className = 'bookmark-picker-title';
    title.textContent = isEdit ? 'Редактировать комментарий' : (isReply ? 'Ответ на комментарий' : 'Новый комментарий');
    sheet.appendChild(title);

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'comment-editor-input';
    input.setAttribute('data-focusable', 'true');
    input.placeholder = 'Написать комментарий...';
    if (isEdit) {
      input.value = editingComment.message || '';
    } else if (isReply && parentComment.profile) {
      input.value = parentComment.profile.login + ', ';
    }
    sheet.appendChild(input);

    var spoilerRow = document.createElement('button');
    spoilerRow.className = 'bookmark-picker-item comment-editor-spoiler-row';
    spoilerRow.setAttribute('data-focusable', 'true');
    var checkbox = document.createElement('span');
    checkbox.className = 'bookmark-picker-checkbox';
    spoilerRow.appendChild(checkbox);
    var checkboxLabel = document.createElement('span');
    checkboxLabel.textContent = 'Спойлер';
    spoilerRow.appendChild(checkboxLabel);
    var isSpoiler = isEdit && !!(editingComment.is_spoiler || editingComment.isSpoiler);
    if (isSpoiler) spoilerRow.classList.add('active');
    spoilerRow.addEventListener('click', function() {
      isSpoiler = !isSpoiler;
      spoilerRow.classList.toggle('active', isSpoiler);
    });
    sheet.appendChild(spoilerRow);

    var sendBtn = document.createElement('button');
    sendBtn.className = 'bookmark-picker-cancel comment-editor-send';
    sendBtn.setAttribute('data-focusable', 'true');
    sendBtn.textContent = isEdit ? 'Изменить' : 'Отправить';
    sendBtn.addEventListener('click', function() {
      var message = input.value.trim();
      if (!message) return;
      DetailsScreen.submitComment(release, parentComment, editingComment, message, isSpoiler);
    });
    sheet.appendChild(sendBtn);

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'bookmark-picker-cancel';
    cancelBtn.setAttribute('data-focusable', 'true');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', closeDialog);
    sheet.appendChild(cancelBtn);

    overlay.appendChild(sheet);
    document.getElementById('app').appendChild(overlay);

    setTimeout(function() { FocusManager.setFocus(input); }, 50);
  },

  submitComment: function(release, parentComment, editingComment, message, isSpoiler) {
    var token = Storage.getToken();
    if (!token) return;

    var request = editingComment
      ? ReleaseApi.editComment(editingComment.id, message, isSpoiler, token)
      : ReleaseApi.addComment(release.id, message, parentComment ? parentComment.id : null, parentComment && parentComment.profile ? parentComment.profile.id : null, isSpoiler, token);

    request.then(function() {
      var editor = document.getElementById('comment-editor');
      if (editor) editor.remove();
      // Reloading the release rebuilds #app from scratch, which takes the
      // (in-#app) comment editor with it -- but the full-comments overlay
      // lives on document.body, so it has to be closed explicitly or it
      // would keep showing stale data over the freshly reloaded page.
      var allOverlay = document.getElementById('all-comments-overlay');
      if (allOverlay) allOverlay.remove();
      DetailsScreen.loadRelease(release.id);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Comment: submit failed', err);
    });
  },

  showAllComments: function(release) {
    if (document.getElementById('all-comments-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'voiceover-picker';
    overlay.id = 'all-comments-overlay';

    var closeDialog = function() { overlay.remove(); };
    overlay.closeDialog = closeDialog;

    var header = document.createElement('div');
    header.className = 'voiceover-picker-header';
    var backBtn = document.createElement('button');
    backBtn.className = 'voiceover-picker-back';
    backBtn.setAttribute('data-focusable', 'true');
    backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
    backBtn.addEventListener('click', closeDialog);
    header.appendChild(backBtn);
    var headerTitle = document.createElement('div');
    headerTitle.className = 'voiceover-picker-title';
    headerTitle.textContent = 'Все комментарии';
    header.appendChild(headerTitle);
    overlay.appendChild(header);

    var list = document.createElement('div');
    list.className = 'voiceover-list voiceover-list-fullscreen all-comments-list';
    list.id = 'all-comments-list';
    list.innerHTML = '<div class="episodes-loading">Загрузка...</div>';
    overlay.appendChild(list);

    document.body.appendChild(overlay);
    setTimeout(function() { FocusManager.setFocus(backBtn); }, 50);

    this.allCommentsPage = 0;
    this.allCommentsLoading = false;
    this.allCommentsHasMore = true;
    this.loadAllCommentsPage(release, true);

    list.addEventListener('scroll', function() {
      if (list.scrollTop + list.clientHeight >= list.scrollHeight - 300) {
        DetailsScreen.loadAllCommentsPage(release, false);
      }
    });
  },

  loadAllCommentsPage: function(release, isFirst) {
    if (this.allCommentsLoading || !this.allCommentsHasMore) return;
    this.allCommentsLoading = true;

    var token = Storage.getToken();
    var self = this;
    var list = document.getElementById('all-comments-list');

    ReleaseApi.getComments(release.id, this.allCommentsPage, token).then(function(response) {
      self.allCommentsLoading = false;
      var items = response.content || [];
      if (isFirst) list.innerHTML = '';

      if (items.length === 0) {
        self.allCommentsHasMore = false;
        if (isFirst) list.innerHTML = '<div class="episodes-empty">Комментариев нет</div>';
        return;
      }

      for (var i = 0; i < items.length; i++) {
        list.appendChild(self.createCommentRow(items[i], release));
      }
      self.allCommentsPage++;

      if (isFirst) {
        setTimeout(function() {
          var first = list.querySelector('[data-focusable]');
          if (first) FocusManager.setFocus(first);
        }, 50);
      }
    }).catch(function(err) {
      self.allCommentsLoading = false;
      if (typeof Debug !== 'undefined') Debug.log('error', 'Comments: load failed', err);
      if (isFirst) list.innerHTML = '<div class="episodes-empty">Ошибка загрузки</div>';
    });
  },

  showShareDialog: function(release) {
    var existing = document.getElementById('share-dialog');
    if (existing) { existing.remove(); return; }

    var overlay = document.createElement('div');
    overlay.className = 'bookmark-picker';
    overlay.id = 'share-dialog';

    var content = document.createElement('div');
    content.className = 'share-dialog-content';

    var title = document.createElement('div');
    title.className = 'share-dialog-title';
    title.textContent = release.title_ru || release.title || '';
    content.appendChild(title);

    var url = 'https://anixart.tv/release/' + release.id;
    var urlEl = document.createElement('div');
    urlEl.className = 'share-dialog-url';
    urlEl.textContent = url;
    content.appendChild(urlEl);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'bookmark-picker-item';
    closeBtn.setAttribute('data-focusable', 'true');
    closeBtn.textContent = 'Закрыть';
    closeBtn.style.borderRadius = '16px';
    closeBtn.style.marginTop = '12px';
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });
    content.appendChild(closeBtn);

    overlay.appendChild(content);

    var container = document.getElementById('app');
    container.appendChild(overlay);

    setTimeout(function() {
      FocusManager.setFocus(closeBtn);
    }, 50);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  },

  showBookmarkPicker: function(release) {
    var existing = document.getElementById('bookmark-picker');
    if (existing) { existing.remove(); return; }

    var picker = document.createElement('div');
    picker.className = 'bookmark-picker';
    picker.id = 'bookmark-picker';

    var sheet = document.createElement('div');
    sheet.className = 'bookmark-picker-sheet';

    var title = document.createElement('div');
    title.className = 'bookmark-picker-title';
    title.textContent = 'Выберите статус просмотра';
    sheet.appendChild(title);

    var lists = [
      { status: 0, label: 'Не смотрю' },
      { status: 1, label: 'Смотрю' },
      { status: 2, label: 'В планах' },
      { status: 3, label: 'Просмотрено' },
      { status: 4, label: 'Отложено' },
      { status: 5, label: 'Брошено' }
    ];

    var currentStatus = release.profile_list_status || 0;

    for (var i = 0; i < lists.length; i++) {
      var item = lists[i];
      var btn = document.createElement('button');
      btn.className = 'bookmark-picker-item';
      btn.setAttribute('data-focusable', 'true');

      var radio = document.createElement('span');
      radio.className = 'bookmark-picker-radio';
      btn.appendChild(radio);

      var label = document.createElement('span');
      label.textContent = item.label;
      btn.appendChild(label);

      if (currentStatus === item.status) {
        btn.classList.add('active');
      }

      (function(status) {
        btn.addEventListener('click', function() {
          if (status === 0) {
            DetailsScreen.removeFromList(release);
          } else {
            DetailsScreen.addToList(release, status);
          }
        });
      })(item.status);

      sheet.appendChild(btn);
    }

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'bookmark-picker-cancel';
    cancelBtn.setAttribute('data-focusable', 'true');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', function() { picker.remove(); });
    sheet.appendChild(cancelBtn);

    picker.appendChild(sheet);

    var container = document.getElementById('app');
    container.appendChild(picker);

    setTimeout(function() {
      var active = sheet.querySelector('.bookmark-picker-item.active') || sheet.querySelector('[data-focusable]');
      if (active) FocusManager.setFocus(active);
    }, 50);

    picker.addEventListener('click', function(e) {
      if (e.target === picker) picker.remove();
    });
  },

  addToList: function(release, status) {
    var token = Storage.getToken();
    if (!token || typeof ProfileApi === 'undefined') return;

    var statusNames = { 1: 'Смотрю', 2: 'В планах', 3: 'Просмотрено', 4: 'Отложено', 5: 'Брошено' };

    ProfileApi.addToList(release.id, status, token).then(function() {
      release.profile_list_status = status;
      if (typeof Debug !== 'undefined') Debug.log('info', 'Bookmark: added to ' + statusNames[status]);

      var favBtn = document.getElementById('details-fav-btn');
      if (favBtn) {
        favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg><span>' + statusNames[status] + '</span>';
      }
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Bookmark: add failed', err);
    });

    var picker = document.getElementById('bookmark-picker');
    if (picker) picker.remove();
  },

  removeFromList: function(release) {
    var token = Storage.getToken();
    if (!token || typeof ProfileApi === 'undefined' || !release.profile_list_status) return;

    ProfileApi.removeFromList(release.id, release.profile_list_status, token).then(function() {
      release.profile_list_status = null;
      if (typeof Debug !== 'undefined') Debug.log('info', 'Bookmark: removed');

      var favBtn = document.getElementById('details-fav-btn');
      if (favBtn) {
        favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Не смотрю</span>';
      }
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Bookmark: remove failed', err);
    });

    var picker = document.getElementById('bookmark-picker');
    if (picker) picker.remove();
  },

  renderFavoriteBtn: function(btn, release) {
    var filled = !!release.is_favorite;
    var icon = filled
      ? '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    var count = release.favorites_count != null ? release.favorites_count.toLocaleString('ru-RU') : 'Избранное';
    btn.innerHTML = icon + '<span>' + count + '</span>';
    btn.classList.toggle('active', filled);
  },

  toggleFavorite: function(release) {
    var token = Storage.getToken();
    if (!token || typeof ProfileApi === 'undefined') return;
    var self = this;
    var btn = document.getElementById('details-favorite-btn');

    var wasFavorite = !!release.is_favorite;
    var request = wasFavorite
      ? ProfileApi.removeFavorite(release.id, token)
      : ProfileApi.addFavorite(release.id, token);

    request.then(function() {
      release.is_favorite = !wasFavorite;
      release.favorites_count = (release.favorites_count || 0) + (wasFavorite ? -1 : 1);
      if (btn) self.renderFavoriteBtn(btn, release);
      if (typeof Debug !== 'undefined') Debug.log('info', 'Favorite: ' + (wasFavorite ? 'removed' : 'added'));
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Favorite: toggle failed', err);
    });
  }
};
