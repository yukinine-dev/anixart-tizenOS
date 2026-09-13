var DiscoverScreen = {
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

    var promises = [DiscoverApi.getInteresting().catch(function() { return null; })];
    if (token) {
      promises.push(DiscoverApi.getRecommendations(0, 0, token).catch(function() { return null; }));
    }

    Promise.all(promises).then(function(results) {
      if (skeleton) skeleton.remove();

      var interesting = results[0];
      if (interesting && interesting.content && interesting.content.length > 0) {
        content.appendChild(HomeScreen.createInterestingSection(interesting.content));
      }

      content.appendChild(self.createActionGrid());

      if (token) {
        var recommendations = results[1];
        if (recommendations && recommendations.content && recommendations.content.length > 0) {
          content.appendChild(HomeScreen.createReleaseSection('Рекомендации', 'На основе ваших оценок', recommendations.content, true));
        } else {
          var recSection = document.createElement('div');
          recSection.className = 'home-section';
          var recTitle = document.createElement('div');
          recTitle.className = 'section-header';
          recTitle.innerHTML = '<div class="section-header-left"><span class="section-title">Рекомендации</span><span class="section-subtitle">На основе ваших оценок</span></div>';
          recSection.appendChild(recTitle);
          var recEmpty = document.createElement('div');
          recEmpty.className = 'discover-rec-empty';
          recEmpty.textContent = 'Продолжайте смотреть и оценивать аниме. Чем честнее выставлены оценки, тем точнее будут подобраны рекомендации.';
          recSection.appendChild(recEmpty);
          content.appendChild(recSection);
        }
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
      { label: 'Популярное', icon: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" fill="currentColor"/></svg>', action: function() { App.showScreen('release-list', { mode: 'watching', title: 'Популярное' }); } },
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
      if (release && release.id) {
        App.showScreen('details', { releaseId: release.id });
      }
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Discover: random failed', err);
    });
  }
};
