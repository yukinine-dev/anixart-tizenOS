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
      favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg><span>' + (statusNames[release.profile_list_status] || 'Закладка') + '</span>';
    } else {
      favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Закладка</span>';
    }

    favBtn.addEventListener('click', function() {
      DetailsScreen.showBookmarkPicker(release);
    });
    actions.appendChild(favBtn);

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
    this.renderCommentsSection(release, scroll);
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

      row.appendChild(card);
    }

    section.appendChild(row);
  },

  renderRatingSection: function(release, scroll) {
    if (!release.vote_count) return;

    var section = this.addSection(scroll, 'Рейтинг');
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
    scoreCount.textContent = release.vote_count + ' голосов';
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

    section.appendChild(wrap);

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
    if (total === 0) return;

    var divider = document.createElement('div');
    divider.className = 'details-inner-divider';
    section.appendChild(divider);

    var listsTitle = document.createElement('div');
    listsTitle.className = 'details-subsection-title';
    listsTitle.textContent = 'В списках у людей';
    section.appendChild(listsTitle);

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

    section.appendChild(listsWrap);
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
    if (!comments || comments.length === 0) return;

    var section = this.addSection(scroll, 'Комментарии (' + (release.comments_count || comments.length) + ')');
    var list = document.createElement('div');
    list.className = 'comments-list';

    for (var i = 0; i < comments.length; i++) {
      var c = comments[i];
      var row = document.createElement('div');
      row.className = 'comment-row';
      row.setAttribute('data-focusable', 'true');

      var avatar = document.createElement('div');
      avatar.className = 'comment-avatar';
      if (c.profile && c.profile.avatar) {
        var avImg = document.createElement('img');
        avImg.src = c.profile.avatar;
        avImg.alt = '';
        avatar.appendChild(avImg);
      }
      row.appendChild(avatar);

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
      head.appendChild(time);
      body.appendChild(head);

      var message = document.createElement('div');
      message.className = 'comment-message';
      message.textContent = c.message || '';
      body.appendChild(message);

      row.appendChild(body);
      list.appendChild(row);
    }

    section.appendChild(list);
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

    var lists = [
      { status: 1, label: 'Смотрю' },
      { status: 2, label: 'В планах' },
      { status: 3, label: 'Просмотрено' },
      { status: 4, label: 'Отложено' },
      { status: 5, label: 'Брошено' }
    ];

    for (var i = 0; i < lists.length; i++) {
      var item = lists[i];
      var btn = document.createElement('button');
      btn.className = 'bookmark-picker-item';
      btn.setAttribute('data-focusable', 'true');
      btn.textContent = item.label;

      if (release.profile_list_status === item.status) {
        btn.classList.add('active');
      }

      (function(status) {
        btn.addEventListener('click', function() {
          DetailsScreen.addToList(release, status);
        });
      })(item.status);

      picker.appendChild(btn);
    }

    if (release.profile_list_status) {
      var removeBtn = document.createElement('button');
      removeBtn.className = 'bookmark-picker-item bookmark-picker-remove';
      removeBtn.setAttribute('data-focusable', 'true');
      removeBtn.textContent = 'Удалить из списка';
      removeBtn.addEventListener('click', function() {
        DetailsScreen.removeFromList(release);
      });
      picker.appendChild(removeBtn);
    }

    var container = document.getElementById('app');
    container.appendChild(picker);

    setTimeout(function() {
      var first = picker.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
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
    if (!token || typeof ProfileApi === 'undefined') return;

    ProfileApi.removeFromList(release.id, token).then(function() {
      release.profile_list_status = null;
      if (typeof Debug !== 'undefined') Debug.log('info', 'Bookmark: removed');

      var favBtn = document.getElementById('details-fav-btn');
      if (favBtn) {
        favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Закладка</span>';
      }
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Bookmark: remove failed', err);
    });

    var picker = document.getElementById('bookmark-picker');
    if (picker) picker.remove();
  }
};
