var Debug = {
  MAX_LOGS: 200,
  logs: [],
  visible: false,
  filter: 'all',
  panelEl: null,
  listEl: null,
  counterEl: null,

  LEVELS: {
    info: { label: 'INFO', color: '#6979ce' },
    api: { label: 'API', color: '#73c978' },
    warn: { label: 'WARN', color: '#ffd468' },
    error: { label: 'ERR', color: '#ff605b' },
    nav: { label: 'NAV', color: '#c373c9' }
  },

  init: function() {
    this.createPanel();
    this.hookConsole();
    this.log('info', 'Debug panel ready. Green button or "i" key to toggle.');
  },

  log: function(level, message, data) {
    var entry = {
      time: new Date(),
      level: level,
      message: message,
      data: data || null
    };

    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    if (this.counterEl) {
      var errors = 0;
      for (var i = 0; i < this.logs.length; i++) {
        if (this.logs[i].level === 'error') errors++;
      }
      this.counterEl.textContent = errors > 0 ? errors : '';
      this.counterEl.style.display = errors > 0 ? 'flex' : 'none';
    }

    if (this.visible && this.listEl) {
      this.appendLogEl(entry);
      this.listEl.scrollTop = this.listEl.scrollHeight;
    }
  },

  hookConsole: function() {
    var self = this;
    var origError = console.error;
    var origWarn = console.warn;

    console.error = function() {
      var msg = Array.prototype.slice.call(arguments).map(function(a) {
        return typeof a === 'object' ? JSON.stringify(a) : String(a);
      }).join(' ');
      self.log('error', msg);
      origError.apply(console, arguments);
    };

    console.warn = function() {
      var msg = Array.prototype.slice.call(arguments).map(function(a) {
        return typeof a === 'object' ? JSON.stringify(a) : String(a);
      }).join(' ');
      self.log('warn', msg);
      origWarn.apply(console, arguments);
    };

    window.onerror = function(msg, src, line, col, err) {
      var loc = src ? src.split('/').pop() + ':' + line : '';
      self.log('error', msg + (loc ? ' (' + loc + ')' : ''));
    };

    window.addEventListener('unhandledrejection', function(e) {
      var msg = e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled rejection';
      self.log('error', 'Promise: ' + msg);
    });
  },

  logApi: function(method, url, status, duration, error) {
    var shortUrl = url.replace('https://api-s.anixsekai.com/', '');
    if (shortUrl.indexOf('token=') !== -1) {
      shortUrl = shortUrl.replace(/token=[^&]+/, 'token=***');
    }
    var msg = method + ' ' + shortUrl + ' -> ' + status + ' (' + duration + 'ms)';
    this.log(error ? 'error' : 'api', msg, error || null);
  },

  logNav: function(action, detail) {
    this.log('nav', action + (detail ? ': ' + detail : ''));
  },

  createPanel: function() {
    var panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.className = 'debug-panel';

    var header = document.createElement('div');
    header.className = 'debug-header';

    var title = document.createElement('span');
    title.className = 'debug-title';
    title.textContent = 'Debug Logs';
    header.appendChild(title);

    var filters = document.createElement('div');
    filters.className = 'debug-filters';

    var filterNames = ['all', 'api', 'error', 'warn', 'nav', 'info'];
    for (var i = 0; i < filterNames.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'debug-filter-btn' + (filterNames[i] === 'all' ? ' active' : '');
      btn.textContent = filterNames[i].toUpperCase();
      btn.setAttribute('data-filter', filterNames[i]);
      btn.setAttribute('data-focusable', 'true');
      (function(f) {
        btn.addEventListener('click', function() {
          Debug.setFilter(f);
        });
      })(filterNames[i]);
      filters.appendChild(btn);
    }
    header.appendChild(filters);

    var actions = document.createElement('div');
    actions.className = 'debug-actions';

    var clearBtn = document.createElement('button');
    clearBtn.className = 'debug-clear-btn';
    clearBtn.textContent = 'Clear';
    clearBtn.setAttribute('data-focusable', 'true');
    clearBtn.addEventListener('click', function() {
      Debug.clear();
    });
    actions.appendChild(clearBtn);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'debug-close-btn';
    closeBtn.textContent = 'X';
    closeBtn.setAttribute('data-focusable', 'true');
    closeBtn.addEventListener('click', function() {
      Debug.toggle();
    });
    actions.appendChild(closeBtn);

    header.appendChild(actions);
    panel.appendChild(header);

    var list = document.createElement('div');
    list.className = 'debug-list';
    list.id = 'debug-list';
    panel.appendChild(list);

    this.panelEl = panel;
    this.listEl = list;
    document.body.appendChild(panel);

    var badge = document.createElement('div');
    badge.id = 'debug-badge';
    badge.className = 'debug-badge';
    badge.style.display = 'none';
    this.counterEl = badge;
    document.body.appendChild(badge);
  },

  toggle: function() {
    this.visible = !this.visible;
    if (this.panelEl) {
      this.panelEl.classList.toggle('open', this.visible);
    }
    if (this.visible) {
      this.renderLogs();
    }
  },

  setFilter: function(filter) {
    this.filter = filter;
    var btns = this.panelEl.querySelectorAll('.debug-filter-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-filter') === filter);
    }
    this.renderLogs();
  },

  clear: function() {
    this.logs = [];
    if (this.listEl) this.listEl.innerHTML = '';
    if (this.counterEl) {
      this.counterEl.textContent = '';
      this.counterEl.style.display = 'none';
    }
    this.log('info', 'Logs cleared');
  },

  renderLogs: function() {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
    for (var i = 0; i < this.logs.length; i++) {
      if (this.filter !== 'all' && this.logs[i].level !== this.filter) continue;
      this.appendLogEl(this.logs[i]);
    }
    this.listEl.scrollTop = this.listEl.scrollHeight;
  },

  appendLogEl: function(entry) {
    if (this.filter !== 'all' && entry.level !== this.filter) return;

    var row = document.createElement('div');
    row.className = 'debug-row';

    var time = document.createElement('span');
    time.className = 'debug-time';
    var d = entry.time;
    time.textContent = this.pad(d.getHours()) + ':' + this.pad(d.getMinutes()) + ':' + this.pad(d.getSeconds());
    row.appendChild(time);

    var levelInfo = this.LEVELS[entry.level] || this.LEVELS.info;
    var badge = document.createElement('span');
    badge.className = 'debug-level';
    badge.style.color = levelInfo.color;
    badge.textContent = levelInfo.label;
    row.appendChild(badge);

    var msg = document.createElement('span');
    msg.className = 'debug-msg';
    msg.textContent = entry.message;
    row.appendChild(msg);

    if (entry.data) {
      var dataStr = typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 2);
      if (dataStr.length > 300) dataStr = dataStr.substring(0, 300) + '...';
      var dataEl = document.createElement('div');
      dataEl.className = 'debug-data';
      dataEl.textContent = dataStr;
      row.appendChild(dataEl);
    }

    if (entry.level === 'error') {
      row.classList.add('debug-row-error');
    }

    this.listEl.appendChild(row);
  },

  pad: function(n) {
    return n < 10 ? '0' + n : String(n);
  }
};
