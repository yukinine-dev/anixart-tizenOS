var PlayerScreen = {
  videoEl: null,
  controlsTimeout: null,
  controlsVisible: true,
  episodes: [],
  currentEpisodeIndex: 0,
  releaseTitle: '',
  seeking: false,
  seekStep: 10,

  releaseId: null,
  saveInterval: null,

  render: function(params) {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-player';

    this.releaseId = params.releaseId || null;
    this.releaseTitle = params.releaseTitle || '';
    this.episodes = params.episodes || [];
    this.currentEpisodeIndex = params.episodeIndex || 0;

    if (this.releaseId && typeof WatchHistory !== 'undefined') {
      var saved = WatchHistory.get(this.releaseId);
      if (saved && params.episodeIndex == null) {
        this.currentEpisodeIndex = saved.episodeIndex || 0;
      }
    }

    var playerWrap = document.createElement('div');
    playerWrap.className = 'player-wrap';
    playerWrap.id = 'player-wrap';

    var video = document.createElement('video');
    video.className = 'player-video';
    video.id = 'player-video';
    video.autoplay = true;
    video.setAttribute('playsinline', '');
    this.videoEl = video;
    playerWrap.appendChild(video);

    var overlay = document.createElement('div');
    overlay.className = 'player-overlay';
    overlay.id = 'player-overlay';

    var topBar = document.createElement('div');
    topBar.className = 'player-top-bar';

    var backBtn = document.createElement('button');
    backBtn.className = 'player-back-btn';
    backBtn.setAttribute('data-focusable', 'true');
    backBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
    backBtn.addEventListener('click', function() { App.goBack(); });
    topBar.appendChild(backBtn);

    var titleWrap = document.createElement('div');
    titleWrap.className = 'player-title-wrap';

    var epTitle = document.createElement('div');
    epTitle.className = 'player-ep-title';
    epTitle.id = 'player-ep-title';
    titleWrap.appendChild(epTitle);

    var releaseTitle = document.createElement('div');
    releaseTitle.className = 'player-release-title';
    releaseTitle.textContent = this.releaseTitle;
    titleWrap.appendChild(releaseTitle);

    topBar.appendChild(titleWrap);

    var epListBtn = document.createElement('button');
    epListBtn.className = 'player-ep-list-btn';
    epListBtn.setAttribute('data-focusable', 'true');
    epListBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/></svg>';
    epListBtn.addEventListener('click', function() { PlayerScreen.showEpisodeList(); });
    topBar.appendChild(epListBtn);

    overlay.appendChild(topBar);

    var centerControls = document.createElement('div');
    centerControls.className = 'player-center-controls';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'player-ctrl-btn';
    prevBtn.id = 'player-prev-btn';
    prevBtn.setAttribute('data-focusable', 'true');
    prevBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor"/></svg>';
    prevBtn.addEventListener('click', function() { PlayerScreen.prevEpisode(); });
    centerControls.appendChild(prevBtn);

    var rwdBtn = document.createElement('button');
    rwdBtn.className = 'player-ctrl-btn';
    rwdBtn.setAttribute('data-focusable', 'true');
    rwdBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" fill="currentColor"/></svg>';
    rwdBtn.addEventListener('click', function() { PlayerScreen.seek(-10); });
    centerControls.appendChild(rwdBtn);

    var playBtn = document.createElement('button');
    playBtn.className = 'player-play-btn';
    playBtn.id = 'player-play-btn';
    playBtn.setAttribute('data-focusable', 'true');
    playBtn.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    playBtn.addEventListener('click', function() { PlayerScreen.togglePlay(); });
    centerControls.appendChild(playBtn);

    var fwdBtn = document.createElement('button');
    fwdBtn.className = 'player-ctrl-btn';
    fwdBtn.setAttribute('data-focusable', 'true');
    fwdBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" fill="currentColor"/></svg>';
    fwdBtn.addEventListener('click', function() { PlayerScreen.seek(10); });
    centerControls.appendChild(fwdBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'player-ctrl-btn';
    nextBtn.id = 'player-next-btn';
    nextBtn.setAttribute('data-focusable', 'true');
    nextBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor"/></svg>';
    nextBtn.addEventListener('click', function() { PlayerScreen.nextEpisode(); });
    centerControls.appendChild(nextBtn);

    overlay.appendChild(centerControls);

    var bottomBar = document.createElement('div');
    bottomBar.className = 'player-bottom-bar';

    var progress = document.createElement('div');
    progress.className = 'player-progress';
    progress.id = 'player-progress';
    progress.setAttribute('data-focusable', 'true');

    var progressBar = document.createElement('div');
    progressBar.className = 'player-progress-bar';
    progressBar.id = 'player-progress-bar';
    progress.appendChild(progressBar);

    progress.addEventListener('click', function(e) {
      var rect = progress.getBoundingClientRect();
      var ratio = (e.clientX - rect.left) / rect.width;
      if (PlayerScreen.videoEl && PlayerScreen.videoEl.duration) {
        PlayerScreen.videoEl.currentTime = ratio * PlayerScreen.videoEl.duration;
      }
    });
    bottomBar.appendChild(progress);

    var timeRow = document.createElement('div');
    timeRow.className = 'player-time-row';

    var timeCurrent = document.createElement('span');
    timeCurrent.className = 'player-time';
    timeCurrent.id = 'player-time-current';
    timeCurrent.textContent = '0:00';
    timeRow.appendChild(timeCurrent);

    var epIndicator = document.createElement('span');
    epIndicator.className = 'player-ep-indicator';
    epIndicator.id = 'player-ep-indicator';
    timeRow.appendChild(epIndicator);

    var timeDuration = document.createElement('span');
    timeDuration.className = 'player-time';
    timeDuration.id = 'player-time-duration';
    timeDuration.textContent = '0:00';
    timeRow.appendChild(timeDuration);

    bottomBar.appendChild(timeRow);
    overlay.appendChild(bottomBar);

    playerWrap.appendChild(overlay);
    container.appendChild(playerWrap);

    this.setupVideoEvents(video);
    this.loadEpisode(this.currentEpisodeIndex);
    this.showControls();
    this.updateEpIndicator();

    playerWrap.addEventListener('click', function(e) {
      if (e.target === playerWrap || e.target === video || e.target.id === 'player-overlay') {
        PlayerScreen.showControls();
      }
    });
  },

  setupVideoEvents: function(video) {
    var self = this;

    video.addEventListener('timeupdate', function() {
      if (!video.duration) return;
      var pct = (video.currentTime / video.duration) * 100;
      var bar = document.getElementById('player-progress-bar');
      if (bar) bar.style.width = pct + '%';
      var cur = document.getElementById('player-time-current');
      if (cur) cur.textContent = self.formatTime(video.currentTime);
    });

    video.addEventListener('loadedmetadata', function() {
      var dur = document.getElementById('player-time-duration');
      if (dur) dur.textContent = self.formatTime(video.duration);

      if (self.releaseId && typeof WatchHistory !== 'undefined') {
        var saved = WatchHistory.get(self.releaseId);
        if (saved && saved.episodeIndex === self.currentEpisodeIndex && saved.currentTime > 5) {
          video.currentTime = saved.currentTime;
        }
      }
    });

    video.addEventListener('play', function() {
      self.updatePlayBtn(true);
      self.startSaveInterval();
    });
    video.addEventListener('pause', function() {
      self.updatePlayBtn(false);
      self.saveProgress();
      self.stopSaveInterval();
    });

    video.addEventListener('ended', function() {
      self.nextEpisode();
    });

    video.addEventListener('error', function() {
      if (typeof Debug !== 'undefined') Debug.log('error', 'Player: video error', video.error);
    });
  },

  loadEpisode: function(index) {
    if (!this.episodes[index]) return;
    var ep = this.episodes[index];

    var titleEl = document.getElementById('player-ep-title');
    if (titleEl) {
      titleEl.textContent = ep.name || ('Эпизод ' + (ep.position != null ? ep.position : (index + 1)));
    }

    var url = ep.url || ep.hls || '';
    if (!url && ep.links && ep.links.length > 0) {
      for (var i = 0; i < ep.links.length; i++) {
        if (ep.links[i].hls) { url = ep.links[i].hls; break; }
        if (ep.links[i].url) { url = ep.links[i].url; break; }
      }
    }

    if (typeof Debug !== 'undefined') Debug.log('info', 'Player: loading ep ' + index + ' url=' + (url ? url.substring(0, 60) : 'none'));

    if (url && this.videoEl) {
      this.videoEl.src = url;
      this.videoEl.play().catch(function() {});
    }

    this.updateEpIndicator();
  },

  nextEpisode: function() {
    if (this.currentEpisodeIndex < this.episodes.length - 1) {
      this.saveProgress();
      this.currentEpisodeIndex++;
      this.loadEpisode(this.currentEpisodeIndex);
      this.showControls();
    }
  },

  prevEpisode: function() {
    if (this.currentEpisodeIndex > 0) {
      this.saveProgress();
      this.currentEpisodeIndex--;
      this.loadEpisode(this.currentEpisodeIndex);
      this.showControls();
    }
  },

  updateEpIndicator: function() {
    var el = document.getElementById('player-ep-indicator');
    if (el) {
      el.textContent = (this.currentEpisodeIndex + 1) + ' / ' + this.episodes.length;
    }
  },

  showEpisodeList: function() {
    var existing = document.getElementById('player-ep-list');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.className = 'player-ep-list';
    panel.id = 'player-ep-list';

    var panelTitle = document.createElement('div');
    panelTitle.className = 'player-ep-list-title';
    panelTitle.textContent = 'Эпизоды';
    panel.appendChild(panelTitle);

    var list = document.createElement('div');
    list.className = 'player-ep-list-scroll';

    for (var i = 0; i < this.episodes.length; i++) {
      var ep = this.episodes[i];
      var item = document.createElement('button');
      item.className = 'player-ep-list-item' + (i === this.currentEpisodeIndex ? ' active' : '');
      item.setAttribute('data-focusable', 'true');
      item.textContent = (ep.position != null ? ep.position : (i + 1)) + '. ' + (ep.name || ('Эпизод ' + (ep.position != null ? ep.position : (i + 1))));

      (function(idx) {
        item.addEventListener('click', function() {
          PlayerScreen.saveProgress();
          PlayerScreen.currentEpisodeIndex = idx;
          PlayerScreen.loadEpisode(idx);
          var panel = document.getElementById('player-ep-list');
          if (panel) panel.remove();
          PlayerScreen.showControls();
        });
      })(i);

      list.appendChild(item);
    }

    panel.appendChild(list);

    var wrap = document.getElementById('player-wrap');
    if (wrap) wrap.appendChild(panel);

    setTimeout(function() {
      var activeItem = panel.querySelector('.player-ep-list-item.active');
      if (activeItem) {
        FocusManager.setFocus(activeItem);
        activeItem.scrollIntoView({ block: 'center' });
      }
    }, 50);
  },

  togglePlay: function() {
    if (!this.videoEl) return;
    if (this.videoEl.paused) {
      this.videoEl.play().catch(function() {});
    } else {
      this.videoEl.pause();
    }
    this.showControls();
  },

  seek: function(seconds) {
    if (!this.videoEl || !this.videoEl.duration) return;
    this.videoEl.currentTime = Math.max(0, Math.min(this.videoEl.duration, this.videoEl.currentTime + seconds));
    this.showControls();
  },

  updatePlayBtn: function(playing) {
    var btn = document.getElementById('player-play-btn');
    if (!btn) return;
    if (playing) {
      btn.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>';
    } else {
      btn.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
    }
  },

  showControls: function() {
    var epList = document.getElementById('player-ep-list');
    if (epList) return;

    var overlay = document.getElementById('player-overlay');
    if (overlay) overlay.classList.add('visible');
    this.controlsVisible = true;

    if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
    var self = this;
    this.controlsTimeout = setTimeout(function() {
      self.hideControls();
    }, 4000);
  },

  hideControls: function() {
    if (this.videoEl && this.videoEl.paused) return;
    var overlay = document.getElementById('player-overlay');
    if (overlay) overlay.classList.remove('visible');
    this.controlsVisible = false;
  },

  formatTime: function(s) {
    if (!s || isNaN(s)) return '0:00';
    var hours = Math.floor(s / 3600);
    var mins = Math.floor((s % 3600) / 60);
    var secs = Math.floor(s % 60);
    if (hours > 0) {
      return hours + ':' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  },

  handleKey: function(keyCode) {
    var epList = document.getElementById('player-ep-list');

    switch (keyCode) {
      case 415: // Play
      case 10252: // PlayPause
        this.togglePlay();
        return true;
      case 413: // Stop
        App.goBack();
        return true;
      case 417: // FastForward
        this.seek(30);
        return true;
      case 412: // Rewind
        this.seek(-30);
        return true;
      case 37: // Left
        if (!epList) { this.seek(-10); return true; }
        break;
      case 39: // Right
        if (!epList) { this.seek(10); return true; }
        break;
      case 10009: // Back (Tizen)
      case 8:     // Backspace
        if (epList) { epList.remove(); return true; }
        break;
    }
    return false;
  },

  saveProgress: function() {
    if (!this.releaseId || !this.videoEl || typeof WatchHistory === 'undefined') return;
    if (!this.videoEl.duration || this.videoEl.duration < 1) return;
    WatchHistory.save(this.releaseId, this.currentEpisodeIndex, this.videoEl.currentTime, this.videoEl.duration);
  },

  startSaveInterval: function() {
    this.stopSaveInterval();
    var self = this;
    this.saveInterval = setInterval(function() {
      self.saveProgress();
    }, 10000);
  },

  stopSaveInterval: function() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  },

  destroy: function() {
    this.saveProgress();
    this.stopSaveInterval();
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.src = '';
    }
    if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
  }
};
