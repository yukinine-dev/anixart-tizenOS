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

    if (release.status) {
      var statuses = { 1: 'Онгоинг', 2: 'Вышел', 3: 'Анонс' };
      if (statuses[release.status]) {
        var statusBadge = document.createElement('span');
        statusBadge.className = 'badge';
        statusBadge.textContent = statuses[release.status];
        badges.appendChild(statusBadge);
      }
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
      DetailsScreen.loadEpisodes(release.id);
    });
    actions.appendChild(watchBtn);

    var favBtn = document.createElement('button');
    favBtn.className = 'details-action-btn';
    favBtn.setAttribute('data-focusable', 'true');
    favBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Закладка</span>';
    actions.appendChild(favBtn);

    var shareBtn = document.createElement('button');
    shareBtn.className = 'details-action-btn';
    shareBtn.setAttribute('data-focusable', 'true');
    shareBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/></svg><span>Поделиться</span>';
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

    if (release.genres && release.genres.length > 0) {
      var genresSection = document.createElement('div');
      genresSection.className = 'details-section';
      var genresTitle = document.createElement('div');
      genresTitle.className = 'details-section-title';
      genresTitle.textContent = 'Жанры';
      genresSection.appendChild(genresTitle);
      var genresList = document.createElement('div');
      genresList.className = 'details-genres';
      for (var i = 0; i < release.genres.length; i++) {
        var chip = document.createElement('span');
        chip.className = 'genre-chip';
        chip.textContent = release.genres[i].name || release.genres[i];
        genresList.appendChild(chip);
      }
      genresSection.appendChild(genresList);
      scroll.appendChild(genresSection);
    }

    var episodesSection = document.createElement('div');
    episodesSection.className = 'details-section';
    episodesSection.id = 'episodes-section';
    var epTitle = document.createElement('div');
    epTitle.className = 'details-section-title';
    epTitle.textContent = 'Эпизоды';
    episodesSection.appendChild(epTitle);
    var epContainer = document.createElement('div');
    epContainer.id = 'episodes-container';
    epContainer.className = 'episodes-container';
    var epLoading = document.createElement('div');
    epLoading.className = 'episodes-loading';
    epLoading.textContent = 'Загрузка...';
    epContainer.appendChild(epLoading);
    episodesSection.appendChild(epContainer);
    scroll.appendChild(episodesSection);

    container.appendChild(scroll);

    this.loadEpisodesList(release.id);

    setTimeout(function() {
      FocusManager.setFocus(watchBtn);
    }, 200);
  },

  loadedEpisodes: [],

  loadEpisodesList: function(releaseId) {
    var token = Storage.getToken();
    var container = document.getElementById('episodes-container');
    var self = this;

    ReleaseApi.getSources(releaseId, token).then(function(response) {
      var sources = response.content || response || [];
      if (sources.length > 0) {
        return ReleaseApi.getEpisodes(releaseId, sources[0].id, token);
      }
      return ReleaseApi.getEpisodes(releaseId, null, token);
    }).then(function(response) {
      var episodes = response.content || response || [];
      self.loadedEpisodes = episodes;
      if (!container) return;
      container.innerHTML = '';

      if (episodes.length === 0) {
        container.innerHTML = '<div class="episodes-empty">Нет доступных эпизодов</div>';
        return;
      }

      var list = document.createElement('div');
      list.className = 'episodes-list section-scroll';

      for (var i = 0; i < episodes.length; i++) {
        var ep = episodes[i];
        var epCard = document.createElement('div');
        epCard.className = 'episode-card';
        epCard.setAttribute('data-focusable', 'true');

        var epNum = document.createElement('div');
        epNum.className = 'episode-number';
        epNum.textContent = (ep.position != null ? ep.position : (i + 1));
        epCard.appendChild(epNum);

        var epName = document.createElement('div');
        epName.className = 'episode-name';
        epName.textContent = ep.name || ('Эпизод ' + (ep.position != null ? ep.position : (i + 1)));
        epCard.appendChild(epName);

        (function(idx) {
          epCard.addEventListener('click', function() {
            DetailsScreen.openPlayer(idx);
          });
        })(i);

        list.appendChild(epCard);
      }

      container.appendChild(list);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Episodes: failed to load for release ' + releaseId, err);
      if (container) {
        container.innerHTML = '<div class="episodes-empty">Ошибка загрузки эпизодов</div>';
      }
    });
  },

  openPlayer: function(episodeIndex) {
    var release = this.currentRelease;
    if (!release || !this.loadedEpisodes.length) return;
    App.showScreen('player', {
      releaseTitle: release.title_ru || release.title || '',
      episodes: this.loadedEpisodes,
      episodeIndex: episodeIndex || 0
    });
  },

  loadEpisodes: function(releaseId) {
    if (this.loadedEpisodes && this.loadedEpisodes.length > 0) {
      this.openPlayer(0);
    } else {
      var section = document.getElementById('episodes-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
};
