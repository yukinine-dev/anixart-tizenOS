var DiscoverScreen = {
  MONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'май', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],

  render: function() {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-home';

    var toolbar = HomeScreen.createToolbar();
    container.appendChild(toolbar);

    var mainScroll = document.createElement('div');
    mainScroll.id = 'main-scroll';
    mainScroll.className = 'main-scroll';

    var content = document.createElement('div');
    content.className = 'home-content';
    content.id = 'discover-content';

    var skeleton = HomeScreen.createSkeleton();
    content.appendChild(skeleton);

    mainScroll.appendChild(content);
    container.appendChild(mainScroll);

    var bottomNav = BottomNav.render('discover');
    container.appendChild(bottomNav);

    this.loadData();
  },

  loadData: function() {
    var token = Storage.getToken();
    var content = document.getElementById('discover-content');
    var skeleton = document.getElementById('skeleton');
    var self = this;

    var promises = [
      DiscoverApi.getInteresting().catch(function() { return null; }),
      DiscoverApi.getComments().catch(function() { return null; }),
      DiscoverApi.getCollections(0, token).catch(function() { return null; })
    ];
    if (token) {
      promises.push(
        DiscoverApi.getRecommendations(0, 0, token).catch(function() { return null; }),
        DiscoverApi.getDiscussing(token).catch(function() { return null; }),
        DiscoverApi.getWatching(0, token).catch(function() { return null; })
      );
    }

    Promise.all(promises).then(function(results) {
      if (skeleton) skeleton.remove();

      var interesting = results[0];
      if (interesting && interesting.content && interesting.content.length > 0) {
        content.appendChild(HomeScreen.createInterestingSection(interesting.content));
      }

      content.appendChild(self.createActionGrid());

      if (token) {
        var recommendations = results[3];
        if (recommendations && recommendations.content && recommendations.content.length > 0) {
          content.appendChild(HomeScreen.createReleaseSection('Рекомендации', 'На основе ваших оценок', recommendations.content, true));
        } else {
          content.appendChild(self.createRecommendationsEmpty());
        }

        var discussing = results[4];
        if (discussing && discussing.content && discussing.content.length > 0) {
          content.appendChild(self.createDiscussingSection(discussing.content));
        }
      } else {
        content.appendChild(self.createRecommendationsEmpty());
      }

      content.appendChild(self.createSocialRow());

      if (token) {
        var watching = results[5];
        if (watching && watching.content && watching.content.length > 0) {
          content.appendChild(HomeScreen.createReleaseSection('Смотрят сейчас', null, watching.content, true));
        }
      }

      var collections = results[2];
      if (collections && collections.content && collections.content.length > 0) {
        content.appendChild(self.createCollectionsSection(collections.content));
      }

      var comments = results[1];
      if (comments && comments.content && comments.content.length > 0) {
        content.appendChild(self.createCommentsSection(comments.content));
      }

      setTimeout(function() { FocusManager.focusFirst(content); }, 100);
    }).catch(function() {
      if (skeleton) skeleton.remove();
      var errorEl = document.createElement('div');
      errorEl.className = 'error-state';
      errorEl.textContent = 'Ошибка загрузки. Нажмите OK для повтора.';
      errorEl.setAttribute('data-focusable', 'true');
      errorEl.addEventListener('click', function() {
        content.innerHTML = '';
        content.appendChild(HomeScreen.createSkeleton());
        self.loadData();
      });
      content.appendChild(errorEl);
    });
  },

  createActionGrid: function() {
    var section = document.createElement('div');
    section.className = 'discover-actions';

    var actions = [
      { label: 'Популярное', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" fill="currentColor"/></svg>', action: function() { App.showScreen('popular'); } },
      { label: 'Расписание', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="currentColor"/></svg>', action: function() { App.showScreen('search'); } },
      { label: 'Коллекции', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm2 5h12v2H6zm3 5h6v2H9z" fill="currentColor"/></svg>', action: function() { App.showScreen('release-list', { mode: 'collections', title: 'Коллекции' }); } },
      { label: 'Фильтр', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor"/></svg>', action: function() { App.showScreen('search'); } },
      { label: 'Рандом', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" fill="currentColor"/></svg>', action: function() { DiscoverScreen.goRandom(); } }
    ];

    for (var i = 0; i < actions.length; i++) {
      var item = actions[i];
      var btn = document.createElement('button');
      btn.className = 'discover-action-btn';
      btn.setAttribute('data-focusable', 'true');
      btn.innerHTML = item.icon + '<span>' + item.label + '</span>';
      btn.addEventListener('click', item.action);
      section.appendChild(btn);
    }

    return section;
  },

  goRandom: function() {
    var token = Storage.getToken();
    ApiClient.get('release/random', { token: token, queryParams: { extended_mode: true } }).then(function(response) {
      var release = response.release;
      if (release && release.id) App.showScreen('details', { releaseId: release.id });
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Discover: random failed', err);
    });
  },

  createRecommendationsEmpty: function() {
    var section = document.createElement('div');
    section.className = 'home-section';

    var header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<div class="section-header-left"><span class="section-title">Рекомендации</span><span class="section-subtitle">На основе ваших оценок</span></div>';
    section.appendChild(header);

    var box = document.createElement('div');
    box.className = 'discover-rec-empty';

    var text = document.createElement('div');
    text.textContent = 'Продолжайте смотреть и оценивать аниме. Чем честнее выставлены оценки, тем точнее будут подобраны рекомендации.';
    box.appendChild(text);

    var moreBtn = document.createElement('button');
    moreBtn.className = 'discover-rec-more-btn';
    moreBtn.setAttribute('data-focusable', 'true');
    moreBtn.textContent = 'Узнать подробнее';
    box.appendChild(moreBtn);

    section.appendChild(box);
    return section;
  },

  createDiscussingSection: function(items) {
    var section = document.createElement('div');
    section.className = 'home-section discover-discussing-section';

    var header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<div class="section-header-left"><span class="section-title">Обсуждаемое сегодня</span></div>';
    section.appendChild(header);

    var list = document.createElement('div');
    list.className = 'discover-discussing-list';

    for (var i = 0; i < items.length; i++) {
      list.appendChild(this.createDiscussingCard(items[i]));
    }

    section.appendChild(list);
    return section;
  },

  createDiscussingCard: function(release) {
    var card = document.createElement('div');
    card.className = 'discover-discussing-card';
    card.setAttribute('data-focusable', 'true');

    var poster = document.createElement('div');
    poster.className = 'discover-discussing-poster';
    var img = document.createElement('img');
    img.src = release.image || '';
    img.alt = release.title_ru || '';
    img.loading = 'lazy';
    poster.appendChild(img);
    card.appendChild(poster);

    var info = document.createElement('div');
    info.className = 'discover-discussing-info';

    var title = document.createElement('div');
    title.className = 'discover-discussing-title';
    title.textContent = release.title_ru || release.title || '';
    info.appendChild(title);

    var meta = document.createElement('div');
    meta.className = 'discover-discussing-meta';
    var epText = release.episodes_released && release.episodes_total
      ? release.episodes_released + ' из ' + release.episodes_total + ' эп'
      : (release.episodes_total || '?') + ' эп';
    meta.textContent = epText + (release.grade ? ' · ' + parseFloat(release.grade).toFixed(1) + ' ★' : '');
    info.appendChild(meta);

    if (release.comment_per_day_count) {
      var comments = document.createElement('div');
      comments.className = 'discover-discussing-comments';
      comments.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg><span>' + release.comment_per_day_count + ' комментариев</span>';
      info.appendChild(comments);
    }

    card.appendChild(info);

    card.addEventListener('click', function() {
      App.showScreen('details', { releaseId: release.id });
    });

    return card;
  },

  createSocialRow: function() {
    var row = document.createElement('div');
    row.className = 'discover-social-row';

    var vkBtn = document.createElement('button');
    vkBtn.className = 'discover-social-btn';
    vkBtn.setAttribute('data-focusable', 'true');
    vkBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M13.16 20.31c-7.11 0-11.15-4.87-11.32-12.98h3.5c.12 5.9 2.72 8.4 4.78 8.92V7.33h3.3v5.13c2.03-.22 4.17-2.54 4.89-5.13h3.3c-.55 3.17-2.87 5.49-4.53 6.45 1.66.78 4.3 2.8 5.31 6.53h-3.63c-.78-2.48-2.74-4.4-5.34-4.66v4.66h-.26" fill="currentColor"/></svg><span>Мы ВКонтакте</span>';
    row.appendChild(vkBtn);

    var tgBtn = document.createElement('button');
    tgBtn.className = 'discover-social-btn';
    tgBtn.setAttribute('data-focusable', 'true');
    tgBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M21.94 4.34l-3.26 15.38c-.24 1.08-.89 1.35-1.8.84l-4.98-3.67-2.4 2.31c-.27.27-.49.49-1 .49l.36-5.08 9.25-8.35c.4-.36-.09-.56-.62-.2L6.03 13.05l-4.97-1.55c-1.08-.34-1.1-1.08.23-1.6L20.57 3.13c.9-.34 1.68.2 1.37 1.21z" fill="currentColor"/></svg><span>Мы в Telegram</span>';
    row.appendChild(tgBtn);

    return row;
  },

  createCollectionsSection: function(items) {
    var section = document.createElement('div');
    section.className = 'home-section';

    var header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<div class="section-header-left"><span class="section-title">Коллекции недели</span></div>' +
      '<span class="section-show-more" data-focusable="true">Показать все</span>';
    header.querySelector('.section-show-more').addEventListener('click', function() {
      App.showScreen('release-list', { mode: 'collections', title: 'Коллекции' });
    });
    section.appendChild(header);

    var scroll = document.createElement('div');
    scroll.className = 'section-scroll discover-collections-scroll';

    for (var i = 0; i < items.length; i++) {
      scroll.appendChild(this.createCollectionBanner(items[i]));
    }

    section.appendChild(scroll);
    return section;
  },

  createCollectionBanner: function(collection) {
    var card = document.createElement('div');
    card.className = 'discover-collection-banner';
    card.setAttribute('data-focusable', 'true');

    var inner = document.createElement('div');
    inner.className = 'discover-collection-banner-inner';

    var img = document.createElement('img');
    img.src = collection.image || '';
    img.alt = collection.title || '';
    img.loading = 'lazy';
    inner.appendChild(img);

    var badges = document.createElement('div');
    badges.className = 'discover-collection-badges';
    badges.innerHTML =
      '<span class="discover-collection-badge"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>' + (collection.comment_count || 0) + '</span>' +
      '<span class="discover-collection-badge"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/></svg>' + (collection.favorites_count || 0) + '</span>';
    inner.appendChild(badges);

    var overlay = document.createElement('div');
    overlay.className = 'discover-collection-title-overlay';
    overlay.textContent = collection.title || '';
    inner.appendChild(overlay);

    card.appendChild(inner);
    return card;
  },

  createCommentsSection: function(items) {
    var section = document.createElement('div');
    section.className = 'home-section discover-comments-section';

    var header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<div class="section-header-left"><span class="section-title">Комментарии недели</span></div>';
    section.appendChild(header);

    var list = document.createElement('div');
    list.className = 'discover-comments-list';

    for (var i = 0; i < items.length; i++) {
      list.appendChild(this.createCommentCard(items[i]));
    }

    section.appendChild(list);
    return section;
  },

  formatWeekCommentDate: function(timestamp) {
    var d = new Date(timestamp * 1000);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return d.getDate() + ' ' + this.MONTHS[d.getMonth()] + ' в ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  },

  createCommentCard: function(comment) {
    var self = this;
    // "release" on this endpoint is sometimes the full release object and
    // sometimes just a bare numeric id -- normalize both before using it.
    var releaseObj = (comment.release && typeof comment.release === 'object') ? comment.release : null;
    var releaseId = releaseObj ? releaseObj.id : comment.release;

    var card = document.createElement('div');
    card.className = 'discover-comment-card';

    var avatarBtn = document.createElement('button');
    avatarBtn.className = 'discover-comment-avatar-btn';
    avatarBtn.setAttribute('data-focusable', 'true');
    var avatar = document.createElement('img');
    avatar.className = 'discover-comment-avatar';
    avatar.src = (comment.profile && comment.profile.avatar) || '';
    avatar.alt = '';
    avatarBtn.appendChild(avatar);
    avatarBtn.addEventListener('click', function() {
      if (comment.profile && comment.profile.id) {
        App.showScreen('profile', { profileId: comment.profile.id });
      }
    });
    card.appendChild(avatarBtn);

    var main = document.createElement('button');
    main.className = 'discover-comment-main';
    main.setAttribute('data-focusable', 'true');

    var headText = document.createElement('div');
    headText.className = 'discover-comment-head-text';

    var nameRow = document.createElement('div');
    var name = document.createElement('span');
    name.className = 'discover-comment-name';
    name.textContent = (comment.profile && comment.profile.login) || 'Пользователь';
    nameRow.appendChild(name);
    var toRelease = document.createElement('span');
    toRelease.className = 'discover-comment-to';
    toRelease.textContent = ' к релизу';
    nameRow.appendChild(toRelease);
    headText.appendChild(nameRow);

    var releaseTitle = document.createElement('div');
    releaseTitle.className = 'discover-comment-release';
    releaseTitle.textContent = (releaseObj && releaseObj.title_ru) || '';
    headText.appendChild(releaseTitle);
    main.appendChild(headText);

    if (!releaseTitle.textContent && releaseId) {
      var token = Storage.getToken();
      ReleaseApi.getRelease(releaseId, token).then(function(response) {
        var r = response.release;
        if (r && r.title_ru) releaseTitle.textContent = r.title_ru;
      }).catch(function() {});
    }

    var body = document.createElement('div');
    body.className = 'discover-comment-body';

    if (comment.is_spoiler) {
      body.classList.add('discover-comment-spoiler');
      body.innerHTML = '<div>Комментарий может содержать спойлер.</div><div class="discover-comment-reveal">Нажмите, чтобы прочитать</div>';
    } else {
      body.textContent = comment.message;
    }
    main.appendChild(body);

    var footer = document.createElement('div');
    footer.className = 'discover-comment-footer';

    var dateWrap = document.createElement('span');
    dateWrap.className = 'discover-comment-date';
    dateWrap.textContent = self.formatWeekCommentDate(comment.timestamp);
    if (comment.is_edited) {
      dateWrap.innerHTML += ' <svg width="13" height="13" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>';
    }
    footer.appendChild(dateWrap);

    var vote = document.createElement('span');
    vote.className = 'discover-comment-vote';
    vote.textContent = comment.vote_count || comment.vote || 0;
    footer.appendChild(vote);

    main.appendChild(footer);

    // A D-pad card only has one focusable action per element, so reveal the
    // spoiler on the first OK press and only navigate to the release on the
    // next one, instead of the reference's separate tap zones. The avatar
    // is its own focusable button going straight to the author's profile.
    main.addEventListener('click', function() {
      if (comment.is_spoiler && body.classList.contains('discover-comment-spoiler')) {
        body.classList.remove('discover-comment-spoiler');
        body.textContent = comment.message;
        return;
      }
      if (releaseId) {
        App.showScreen('details', { releaseId: releaseId });
      }
    });

    card.appendChild(main);

    return card;
  }
};
