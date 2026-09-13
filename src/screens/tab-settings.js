var TabSettingsScreen = {
  FILTER_DEFAULT: {
    country: null, season: null, sort: 0, source: null, studio: null,
    age_ratings: [], category_id: null, end_year: null,
    episode_duration_from: null, episode_duration_to: null,
    episodes_from: null, episodes_to: null, genres: [],
    is_genres_exclude_mode_enabled: false, profile_list_exclusions: [],
    start_year: null, status_id: null, types: []
  },

  COUNTRIES: ['Япония', 'Китай', 'Южная Корея'],
  CATEGORIES: [{ v: 1, l: 'Сериал' }, { v: 2, l: 'Полнометражный фильм' }, { v: 3, l: 'OVA' }, { v: 4, l: 'Дорама' }],
  STATUSES: [{ v: 1, l: 'Вышел' }, { v: 2, l: 'Выходит' }, { v: 3, l: 'Анонс' }],
  SEASONS: [{ v: 1, l: 'Зима' }, { v: 2, l: 'Весна' }, { v: 3, l: 'Лето' }, { v: 4, l: 'Осень' }],
  AGE_RATINGS: [{ v: 1, l: '0+' }, { v: 2, l: '6+' }, { v: 3, l: '12+' }, { v: 4, l: '16+' }, { v: 5, l: '18+' }],
  PROFILE_LISTS: [{ v: 0, l: 'Избранное' }, { v: 1, l: 'Смотрю' }, { v: 2, l: 'В планах' }, { v: 3, l: 'Просмотрено' }, { v: 4, l: 'Отложено' }, { v: 5, l: 'Брошено' }],
  SOURCES: ['Оригинал', 'Манга', 'Веб-манга', 'Енкома', 'Ранобэ', 'Новелла', 'Веб-новелла', 'Визуальная новелла', 'Игра', 'Карточная игра', 'Книга', 'Книга с картинками', 'Музыка', 'Радио', 'Более одного', 'Другое'],
  SORTS: [{ v: 0, l: 'По дате добавления' }, { v: 1, l: 'По рейтингу' }, { v: 2, l: 'По годам' }, { v: 3, l: 'По популярности' }],
  EPISODE_COUNTS: [
    { l: 'Неважно', from: null, to: null },
    { l: 'От 1 до 12', from: 1, to: 12 },
    { l: 'От 13 до 25', from: 13, to: 25 },
    { l: 'От 26 до 100', from: 26, to: 100 },
    { l: 'Больше 100', from: 100, to: null }
  ],
  EPISODE_DURATIONS: [
    { l: 'Неважно', from: null, to: null },
    { l: 'До 10 минут', from: 1, to: 10 },
    { l: 'До 30 минут', from: 1, to: 30 },
    { l: 'Более 30 минут', from: 30, to: null }
  ],
  GENRE_GROUPS: [
    { name: 'Нет категории', genres: ['авангард', 'гурман', 'драма', 'комедия', 'повседневность', 'приключения', 'романтика', 'сверхъестественное', 'спорт', 'тайна', 'триллер', 'ужасы', 'фантастика', 'фэнтези', 'экшен', 'эротика', 'этти'] },
    { name: 'Аудитория', genres: ['детское', 'дзёсей', 'сэйнэн', 'сёдзё', 'сёдзё-ай', 'сёнен', 'сёнен-ай'] },
    { name: 'Тематика', genres: ['CGDCT', 'антропоморфизм', 'боевые искусства', 'вампиры', 'взрослые персонажи', 'видеоигры', 'военное', 'выживание', 'гарем', 'гонки', 'городское фэнтези', 'гэг-юмор', 'детектив', 'жестокость', 'забота о детях', 'злодейка', 'игра с высокими ставками', 'идолы (жен.)', 'идолы (муж.)', 'изобразительное искусство', 'исполнительское искусство', 'исторический', 'исэкай', 'иясикэй', 'командный спорт', 'космос', 'кроссдрессинг', 'культура отаку', 'любовный многоугольник', 'магическая смена пола', 'махо-сёдзё', 'медицина', 'меха', 'мифология', 'музыка', 'образовательное', 'организованная преступность', 'пародия', 'питомцы', 'психологическое', 'путешествие во времени', 'работа', 'реверс-гарем', 'реинкарнация', 'романтический подтекст', 'самураи', 'спортивные единоборства', 'стратегические игры', 'супер сила', 'удостоено наград', 'хулиганы', 'школа', 'шоу-бизнес'] }
  ],
  STUDIOS: ['A-1 Pictures', 'A.C.G.T', 'ACTAS, Inc', 'ACiD FiLM', 'AIC A.S.T.A', 'AIC PLUS', 'AIC Spirits', 'AIC', 'Animac', 'ANIMATE', 'Aniplex', 'ARMS', 'Artland', 'ARTMIC Studios', 'Asahi Production', 'Asia-Do', 'ASHI', 'Asread', 'Asmik Ace', 'Aubeck', 'BM Entertainment', 'Bandai Visua', 'Barnum Studio', 'Bee Train', 'BeSTACK', 'Blender Foundation', 'Bones', 'Brains Base', 'Bridge', 'Cinema Citrus', 'Chaos Project', 'Cherry Lips', 'David Production', 'Daume', 'Doumu', 'Dax International', 'DLE INC', 'Digital Frontier', 'Digital Works', 'Diomedea', 'DIRECTIONS Inc', 'Dogakobo', 'Dofus', 'Encourage Films', 'Feel', 'Fifth Avenue', 'Five Ways', 'Fuji TV', 'Foursome', 'GRAM Studio', 'G&G Entertainment', 'Gainax', 'GANSIS', 'Gathering', 'Gonzino', 'Gonzo', 'GoHands', 'Green Bunny', 'Group TAC', 'Hal Film Maker', 'Hasbro Studios', 'h.m.p', 'Himajin', 'Hoods Entertainment', 'Idea Factory', 'J.C.Staff', 'KANSAI', 'Kaname Production', 'Kitty Films', 'Knack', 'Kokusai Eigasha', 'KSS (студия)', 'Kyoto Animation', 'Lemon Heart', 'LMD', 'Madhouse Studios', 'Magic Bus', 'Manglobe Inc.', 'Manpuku Jinja', 'MAPPA', 'Milky', 'Minamimachi Bugyosho', 'Media Blasters', 'Mook Animation', 'Moonrock', 'MOVIC', 'Mushi Productions', 'Natural High', 'Nippon Animation', 'Nomad', 'Lerche', 'OB Planning', 'Office AO', 'Ordet', 'Oriental Light and Magic', 'OLM Inc.', 'P.A. Works', 'Palm Studio', 'Pastel', 'Phoenix Entertainment', 'Picture Magic', 'Pink', 'Pink Pineapple', 'Planet', 'Plum', 'PPM', 'Primastea', 'Production I.G', 'Project No.9', 'Radix', 'Rikuentai', 'Robot', 'Satelight', 'Seven', 'Seven Arcs', 'Shaft', 'Silver Link', 'Shinei Animation', 'Shogakukan Music & Digital Entertainment', 'Soft on Demand', 'Starchild Records', 'Studio 9 Maiami', 'Studio Tulip', 'Studio 4°C', 'Studio e.go!', 'Studio A.P.P.P', 'Studio Barcelona', 'Studio Blanc', 'Studio Comet', 'Studio Deen', 'Studio Fantasia', 'Studio Flag', 'Studio Gallop', 'Studio Ghibli', 'Studio Guts', 'Studio Gokumi', 'Studio Rikka', 'Studio Hibari', 'Studio Junio', 'Studio Khara', 'Studio Live', 'Studio Matrix', 'Studio Pierrot', 'Studio Egg', 'Sunrise', 'Synergy SP', 'Synergy Japan', 'Tatsunoko Production', 'Tele-Cartoon Japan', 'Telecom Animation Film', 'Tezuka Productions', 'The Answer Studio', 'TMS', 'TNK', 'Toei Animation', 'Tokyo Kids', 'TYO Animations', 'Transarts', 'Triangle Staff', 'Trinet Entertainment', 'Ufotable', 'Vega Entertainment', 'Victor Entertainment', 'Viewworks', 'White Fox', 'Wonder Farm', 'XEBEC-M2', 'Xebec', 'Yumeta Company', 'Zexcs', 'Zuiyo Eizo', '8bit'],

  filter: null,
  voiceoverTypes: null,

  render: function() {
    this.filter = Storage.getMyTabFilter() || this.cloneDefault();

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
    titleEl.textContent = 'Настройки вкладки';
    toolbar.appendChild(titleEl);

    container.appendChild(toolbar);

    var content = document.createElement('div');
    content.className = 'release-list-content tab-settings-content';
    content.id = 'tab-settings-content';
    container.appendChild(content);

    var bottomNav = BottomNav.render('home');
    container.appendChild(bottomNav);

    this.renderForm();

    setTimeout(function() {
      var first = content.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 100);
  },

  cloneDefault: function() {
    var f = {};
    for (var k in this.FILTER_DEFAULT) { f[k] = this.FILTER_DEFAULT[k]; }
    f.age_ratings = []; f.genres = []; f.profile_list_exclusions = []; f.types = [];
    return f;
  },

  renderForm: function() {
    var content = document.getElementById('tab-settings-content');
    content.innerHTML = '';
    var self = this;

    var note = document.createElement('div');
    note.className = 'tab-settings-note';
    note.textContent = 'Выберите с помощью фильтров то, что хотите видеть на своей вкладке. Изменения будут доступны только на этом устройстве.';
    content.appendChild(note);

    var f = this.filter;

    content.appendChild(this.buildRow('Страна', f.country || 'Неважно', function() {
      self.openSingle('Страна', self.COUNTRIES.map(function(c) { return { value: c, label: c }; }), f.country, function(v) { f.country = v; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Категория', this.labelFor(this.CATEGORIES, f.category_id), function() {
      self.openSingle('Категория', self.CATEGORIES.map(function(c) { return { value: c.v, label: c.l }; }), f.category_id, function(v) { f.category_id = v; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Жанры', f.genres.length ? f.genres.join(', ') : 'Неважно', function() {
      self.openGenres(f, function() { self.renderForm(); });
    }, 'Покажем релизы хотя бы с одним выбранным жанром.'));

    content.appendChild(this.buildRow('Исключить закладки', this.labelsFor(this.PROFILE_LISTS, f.profile_list_exclusions), function() {
      self.openMulti('Исключить закладки', self.PROFILE_LISTS.map(function(x) { return { value: x.v, label: x.l }; }), f.profile_list_exclusions, function(vals) { f.profile_list_exclusions = vals; self.renderForm(); });
    }, 'Исключит из выдачи все релизы, содержащиеся в вышеуказанных списках закладок.'));

    content.appendChild(this.buildRow('Варианты озвучек', f.types.length ? (f.types.length + ' выбрано') : 'Неважно', function() {
      self.openVoiceoverTypes(f, function() { self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Студия', f.studio || 'Неважно', function() {
      self.openSingle('Студия', self.STUDIOS.map(function(s) { return { value: s, label: s }; }), f.studio, function(v) { f.studio = v; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Первоисточник', f.source || 'Неважно', function() {
      self.openSingle('Первоисточник', self.SOURCES.map(function(s) { return { value: s, label: s }; }), f.source, function(v) { f.source = v; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Год: от', f.start_year || 'Неважно', function() {
      self.openSingle('Год: от', self.yearOptions(), f.start_year, function(v) { f.start_year = v; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Год: до', f.end_year || 'Неважно', function() {
      self.openSingle('Год: до', self.yearOptions(), f.end_year, function(v) { f.end_year = v; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Сезон', this.labelFor(this.SEASONS, f.season), function() {
      self.openSingle('Сезон', self.SEASONS.map(function(s) { return { value: s.v, label: s.l }; }), f.season, function(v) { f.season = v; self.renderForm(); });
    }));

    var epLabel = this.presetLabel(this.EPISODE_COUNTS, f.episodes_from, f.episodes_to);
    content.appendChild(this.buildRow('Эпизодов', epLabel, function() {
      self.openPreset('Эпизодов', self.EPISODE_COUNTS, f.episodes_from, f.episodes_to, function(from, to) { f.episodes_from = from; f.episodes_to = to; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Статус', this.labelFor(this.STATUSES, f.status_id), function() {
      self.openSingle('Статус', self.STATUSES.map(function(s) { return { value: s.v, label: s.l }; }), f.status_id, function(v) { f.status_id = v; self.renderForm(); });
    }));

    var durLabel = this.presetLabel(this.EPISODE_DURATIONS, f.episode_duration_from, f.episode_duration_to);
    content.appendChild(this.buildRow('Длительность эпизода', durLabel, function() {
      self.openPreset('Длительность эпизода', self.EPISODE_DURATIONS, f.episode_duration_from, f.episode_duration_to, function(from, to) { f.episode_duration_from = from; f.episode_duration_to = to; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Возрастное ограничение', this.labelsFor(this.AGE_RATINGS, f.age_ratings), function() {
      self.openMulti('Возрастное ограничение', self.AGE_RATINGS.map(function(x) { return { value: x.v, label: x.l }; }), f.age_ratings, function(vals) { f.age_ratings = vals; self.renderForm(); });
    }));

    content.appendChild(this.buildRow('Сортировка', this.labelFor(this.SORTS, f.sort) || 'По дате добавления', function() {
      self.openSingle('Сортировка', self.SORTS.map(function(s) { return { value: s.v, label: s.l }; }), f.sort, function(v) { f.sort = v; self.renderForm(); });
    }, 'Сначала недавно добавленное и обновлённое'));

    var buttons = document.createElement('div');
    buttons.className = 'tab-settings-buttons';

    var resetBtn = document.createElement('button');
    resetBtn.className = 'tab-settings-reset-btn';
    resetBtn.setAttribute('data-focusable', 'true');
    resetBtn.textContent = 'Сбросить';
    resetBtn.addEventListener('click', function() {
      self.filter = self.cloneDefault();
      self.renderForm();
    });
    buttons.appendChild(resetBtn);

    var applyBtn = document.createElement('button');
    applyBtn.className = 'tab-settings-apply-btn';
    applyBtn.setAttribute('data-focusable', 'true');
    applyBtn.textContent = 'Применить';
    applyBtn.addEventListener('click', function() {
      Storage.setMyTabFilter(self.filter);
      App.goBack();
    });
    buttons.appendChild(applyBtn);

    content.appendChild(buttons);
  },

  labelFor: function(list, value) {
    if (value == null) return 'Неважно';
    for (var i = 0; i < list.length; i++) {
      if (list[i].v === value) return list[i].l;
    }
    return 'Неважно';
  },

  labelsFor: function(list, values) {
    if (!values || values.length === 0) return 'Неважно';
    var labels = [];
    for (var i = 0; i < list.length; i++) {
      if (values.indexOf(list[i].v) !== -1) labels.push(list[i].l);
    }
    return labels.join(', ') || 'Неважно';
  },

  presetLabel: function(list, from, to) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].from === from && list[i].to === to) return list[i].l;
    }
    return 'Неважно';
  },

  yearOptions: function() {
    var opts = [];
    for (var y = 2026; y >= 1990; y--) opts.push({ value: y, label: String(y) });
    return opts;
  },

  buildRow: function(label, valueText, onClick, note) {
    var row = document.createElement('button');
    row.className = 'tab-settings-row';
    row.setAttribute('data-focusable', 'true');

    var labelEl = document.createElement('div');
    labelEl.className = 'tab-settings-row-label';
    labelEl.textContent = label;
    row.appendChild(labelEl);

    var valueEl = document.createElement('div');
    valueEl.className = 'tab-settings-row-value';
    valueEl.textContent = valueText;
    row.appendChild(valueEl);

    row.addEventListener('click', onClick);

    var wrap = document.createElement('div');
    wrap.appendChild(row);

    if (note) {
      var noteEl = document.createElement('div');
      noteEl.className = 'tab-settings-row-note';
      noteEl.textContent = note;
      wrap.appendChild(noteEl);
    }

    return wrap;
  },

  openPreset: function(title, presets, curFrom, curTo, onApply) {
    var options = presets.map(function(p) { return { value: p.l, label: p.l }; });
    var current = this.presetLabel(presets, curFrom, curTo);
    this.openSingle(title, options, current, function(label) {
      for (var i = 0; i < presets.length; i++) {
        if (presets[i].l === label) { onApply(presets[i].from, presets[i].to); return; }
      }
    });
  },

  openVoiceoverTypes: function(f, done) {
    var self = this;
    if (this.voiceoverTypes) {
      this.openMulti('Варианты озвучек', this.voiceoverTypes, f.types, function(vals) { f.types = vals; done(); });
      return;
    }
    var token = Storage.getToken();
    ApiClient.get('type/all', { token: token }).then(function(response) {
      self.voiceoverTypes = (response.types || []).map(function(t) { return { value: t.id, label: t.name }; });
      self.openMulti('Варианты озвучек', self.voiceoverTypes, f.types, function(vals) { f.types = vals; done(); });
    }).catch(function() {});
  },

  openGenres: function(f, done) {
    var options = [];
    for (var i = 0; i < this.GENRE_GROUPS.length; i++) {
      var group = this.GENRE_GROUPS[i];
      for (var j = 0; j < group.genres.length; j++) {
        options.push({ value: group.genres[j], label: group.genres[j] });
      }
    }
    this.openMulti('Жанры', options, f.genres, function(vals) { f.genres = vals; done(); });
  },

  openSingle: function(title, options, current, onSelect) {
    var existing = document.getElementById('tab-settings-picker');
    if (existing) existing.remove();

    var picker = document.createElement('div');
    picker.className = 'bookmark-picker';
    picker.id = 'tab-settings-picker';

    var sheet = document.createElement('div');
    sheet.className = 'bookmark-picker-sheet tab-settings-picker-sheet';

    var titleEl = document.createElement('div');
    titleEl.className = 'bookmark-picker-title';
    titleEl.textContent = title;
    sheet.appendChild(titleEl);

    var list = document.createElement('div');
    list.className = 'tab-settings-picker-list';

    var noneBtn = document.createElement('button');
    noneBtn.className = 'bookmark-picker-item' + (current == null ? ' active' : '');
    noneBtn.setAttribute('data-focusable', 'true');
    var noneRadio = document.createElement('span');
    noneRadio.className = 'bookmark-picker-radio';
    noneBtn.appendChild(noneRadio);
    var noneLabel = document.createElement('span');
    noneLabel.textContent = 'Неважно';
    noneBtn.appendChild(noneLabel);
    noneBtn.addEventListener('click', function() { picker.remove(); onSelect(null); });
    list.appendChild(noneBtn);

    for (var i = 0; i < options.length; i++) {
      (function(opt) {
        var btn = document.createElement('button');
        btn.className = 'bookmark-picker-item' + (current === opt.value ? ' active' : '');
        btn.setAttribute('data-focusable', 'true');
        var radio = document.createElement('span');
        radio.className = 'bookmark-picker-radio';
        btn.appendChild(radio);
        var label = document.createElement('span');
        label.textContent = opt.label;
        btn.appendChild(label);
        btn.addEventListener('click', function() { picker.remove(); onSelect(opt.value); });
        list.appendChild(btn);
      })(options[i]);
    }

    sheet.appendChild(list);

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'bookmark-picker-cancel';
    cancelBtn.setAttribute('data-focusable', 'true');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', function() { picker.remove(); });
    sheet.appendChild(cancelBtn);

    picker.appendChild(sheet);
    document.getElementById('app').appendChild(picker);

    setTimeout(function() {
      var active = list.querySelector('.bookmark-picker-item.active') || list.querySelector('[data-focusable]');
      if (active) FocusManager.setFocus(active);
    }, 50);

    picker.addEventListener('click', function(e) { if (e.target === picker) picker.remove(); });
  },

  openMulti: function(title, options, current, onApply) {
    var existing = document.getElementById('tab-settings-picker');
    if (existing) existing.remove();
    current = current || [];
    var selected = current.slice();

    var picker = document.createElement('div');
    picker.className = 'bookmark-picker';
    picker.id = 'tab-settings-picker';

    var sheet = document.createElement('div');
    sheet.className = 'bookmark-picker-sheet tab-settings-picker-sheet';

    var titleEl = document.createElement('div');
    titleEl.className = 'bookmark-picker-title';
    titleEl.textContent = title;
    sheet.appendChild(titleEl);

    var list = document.createElement('div');
    list.className = 'tab-settings-picker-list';

    for (var i = 0; i < options.length; i++) {
      (function(opt) {
        var btn = document.createElement('button');
        btn.className = 'bookmark-picker-item' + (selected.indexOf(opt.value) !== -1 ? ' active' : '');
        btn.setAttribute('data-focusable', 'true');
        var box = document.createElement('span');
        box.className = 'bookmark-picker-checkbox';
        btn.appendChild(box);
        var label = document.createElement('span');
        label.textContent = opt.label;
        btn.appendChild(label);
        btn.addEventListener('click', function() {
          var idx = selected.indexOf(opt.value);
          if (idx === -1) { selected.push(opt.value); btn.classList.add('active'); }
          else { selected.splice(idx, 1); btn.classList.remove('active'); }
        });
        list.appendChild(btn);
      })(options[i]);
    }

    sheet.appendChild(list);

    var applyBtn = document.createElement('button');
    applyBtn.className = 'bookmark-picker-cancel tab-settings-picker-apply';
    applyBtn.setAttribute('data-focusable', 'true');
    applyBtn.textContent = 'Готово';
    applyBtn.addEventListener('click', function() { picker.remove(); onApply(selected); });
    sheet.appendChild(applyBtn);

    picker.appendChild(sheet);
    document.getElementById('app').appendChild(picker);

    setTimeout(function() {
      var first = list.querySelector('[data-focusable]');
      if (first) FocusManager.setFocus(first);
    }, 50);

    picker.addEventListener('click', function(e) { if (e.target === picker) picker.remove(); });
  }
};
