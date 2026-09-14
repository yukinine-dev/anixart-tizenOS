var ScheduleScreen = {
  DAYS: [
    { key: 'monday', label: 'Понедельник' },
    { key: 'tuesday', label: 'Вторник' },
    { key: 'wednesday', label: 'Среда' },
    { key: 'thursday', label: 'Четверг' },
    { key: 'friday', label: 'Пятница' },
    { key: 'saturday', label: 'Суббота' },
    { key: 'sunday', label: 'Воскресенье' }
  ],

  render: function() {
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
    titleEl.textContent = 'Расписание';
    toolbar.appendChild(titleEl);

    container.appendChild(toolbar);

    var mainScroll = document.createElement('div');
    mainScroll.id = 'main-scroll';
    mainScroll.className = 'main-scroll';

    var content = document.createElement('div');
    content.className = 'home-content';
    content.id = 'schedule-content';
    content.innerHTML = '<div class="bookmarks-loading"><div class="spinner"></div></div>';

    mainScroll.appendChild(content);
    container.appendChild(mainScroll);

    var bottomNav = BottomNav.render('discover');
    container.appendChild(bottomNav);

    this.loadData();
  },

  todayIndex: function() {
    // JS getDay(): 0=Sunday..6=Saturday -- DAYS is Monday-first, so shift by one.
    return (new Date().getDay() + 6) % 7;
  },

  loadData: function() {
    var content = document.getElementById('schedule-content');
    var token = Storage.getToken();
    var self = this;

    DiscoverApi.getSchedule(token).then(function(response) {
      content.innerHTML = '';

      var todayIdx = self.todayIndex();
      var todaySection = null;

      for (var i = 0; i < self.DAYS.length; i++) {
        var day = self.DAYS[i];
        var items = response[day.key] || [];
        if (items.length === 0) continue;

        var section = HomeScreen.createReleaseSection(day.label, null, items, false);
        if (i === todayIdx) {
          section.classList.add('schedule-today-section');
          todaySection = section;
        }
        content.appendChild(section);
      }

      if (!content.children.length) {
        content.innerHTML = '<div class="bookmarks-empty">На этой неделе ничего не выходит</div>';
        return;
      }

      setTimeout(function() {
        var target = todaySection || content.firstElementChild;
        var first = target.querySelector('[data-focusable]');
        if (first) {
          FocusManager.setFocus(first);
        } else {
          FocusManager.focusFirst(content);
        }
      }, 100);
    }).catch(function(err) {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Schedule: load failed', err);
      content.innerHTML = '<div class="bookmarks-empty">Ошибка загрузки</div>';
    });
  }
};
