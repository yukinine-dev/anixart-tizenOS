var PlayerScreen = {
  episodes: [],
  currentEpisodeIndex: 0,
  releaseTitle: '',
  releaseId: null,
  videoEl: null,
  mode: null,
  controlsTimeout: null,
  saveInterval: null,
  loadToken: 0,
  qualities: [],
  currentQualityIndex: 0,
  playbackSpeed: 1,
  speedOptions: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  OP_SKIP_SECONDS: 85,

  render: function(params) {
    var container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'screen-player';

    this.releaseId = params.releaseId || null;
    this.releaseTitle = params.releaseTitle || '';
    this.episodes = params.episodes || [];
    this.currentEpisodeIndex = params.episodeIndex || 0;

    if (this.releaseId && typeof WatchHistory !== 'undefined' && params.episodeIndex == null) {
      var saved = WatchHistory.get(this.releaseId);
      if (saved) this.currentEpisodeIndex = saved.episodeIndex || 0;
    }

    var playerWrap = document.createElement('div');
    playerWrap.className = 'player-wrap';
    playerWrap.id = 'player-wrap';

    var mediaContainer = document.createElement('div');
    mediaContainer.className = 'player-media';
    mediaContainer.id = 'player-media';
    playerWrap.appendChild(mediaContainer);

    var loading = document.createElement('div');
    loading.className = 'player-loading';
    loading.id = 'player-loading';
    loading.innerHTML = '<div class="spinner"></div><div class="player-loading-text">Получение потока...</div>';
    playerWrap.appendChild(loading);

    var overlay = document.createElement('div');
    overlay.className = 'player-overlay visible';
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

    if (this.episodes.length > 1) {
      var epListBtn = document.createElement('button');
      epListBtn.className = 'player-ep-list-btn';
      epListBtn.setAttribute('data-focusable', 'true');
      epListBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/></svg>';
      epListBtn.addEventListener('click', function() { PlayerScreen.showEpisodeList(); });
      topBar.appendChild(epListBtn);
    }

    overlay.appendChild(topBar);

    var centerControls = document.createElement('div');
    centerControls.className = 'player-center-controls';
    centerControls.id = 'player-center-controls';
    overlay.appendChild(centerControls);

    var bottomBar = document.createElement('div');
    bottomBar.className = 'player-bottom-bar';
    bottomBar.id = 'player-bottom-bar';
    overlay.appendChild(bottomBar);

    playerWrap.appendChild(overlay);
    container.appendChild(playerWrap);

    this.loadEpisode(this.currentEpisodeIndex);

    setTimeout(function() {
      FocusManager.setFocus(backBtn);
    }, 200);

    playerWrap.addEventListener('click', function(e) {
      if (e.target === playerWrap || e.target === mediaContainer || e.target.id === 'player-overlay') {
        PlayerScreen.showControls();
      }
    });
  },

  loadEpisode: function(index) {
    if (!this.episodes[index]) return;
    this.currentEpisodeIndex = index;
    var ep = this.episodes[index];
    var self = this;
    var myToken = ++this.loadToken;

    var titleEl = document.getElementById('player-ep-title');
    if (titleEl) {
      titleEl.textContent = ep.name || ('Эпизод ' + (ep.position != null ? ep.position : (index + 1)));
    }

    this.teardownMedia();
    var loadingEl = document.getElementById('player-loading');
    if (loadingEl) {
      loadingEl.style.display = 'flex';
      var loadingText = loadingEl.querySelector('.player-loading-text');
      if (loadingText) loadingText.textContent = 'Получение потока...';
    }

    if (this.releaseId && typeof WatchHistory !== 'undefined') {
      WatchHistory.save(this.releaseId, index, 0, 0);
    }

    if (ep.url && typeof KodikParser !== 'undefined' && KodikParser.isKodikUrl(ep.url)) {
      KodikParser.resolve(ep.url).then(function(qualities) {
        if (myToken !== self.loadToken) return;
        try {
          self.qualities = qualities;
          self.currentQualityIndex = 0;
          self.setupNativePlayer(qualities[0].url);
          if (typeof Debug !== 'undefined') Debug.log('info', 'Player: Kodik resolved, using native player');
        } catch (e) {
          if (typeof Debug !== 'undefined') Debug.log('error', 'Player: native setup failed, falling back to iframe: ' + e.message);
          self.teardownMedia();
          self.setupIframePlayer(ep.url);
        }
      }, function(err) {
        if (myToken !== self.loadToken) return;
        if (typeof Debug !== 'undefined') Debug.log('warn', 'Player: Kodik parse failed (' + (err && err.text) + '), falling back to iframe');
        self.setupIframePlayer(ep.url);
      });
    } else if (ep.url) {
      this.setupIframePlayer(ep.url);
    }
  },

  teardownMedia: function() {
    this.stopSaveInterval();
    var mediaContainer = document.getElementById('player-media');
    if (mediaContainer) mediaContainer.innerHTML = '';
    this.videoEl = null;
    this.mode = null;
    this.qualities = [];
    this.currentQualityIndex = 0;
    var centerControls = document.getElementById('player-center-controls');
    if (centerControls) centerControls.innerHTML = '';
    var bottomBar = document.getElementById('player-bottom-bar');
    if (bottomBar) bottomBar.innerHTML = '';
    var qualityList = document.getElementById('player-quality-list');
    if (qualityList) qualityList.remove();
    var speedList = document.getElementById('player-speed-list');
    if (speedList) speedList.remove();
  },

  setupNativePlayer: function(url) {
    this.mode = 'native';
    var mediaContainer = document.getElementById('player-media');
    var loadingEl = document.getElementById('player-loading');

    var video = document.createElement('video');
    video.className = 'player-video';
    video.id = 'player-video';
    video.autoplay = true;
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.src = url;
    video.playbackRate = this.playbackSpeed;
    this.videoEl = video;
    mediaContainer.appendChild(video);

    this.setupVideoEvents(video);
    this.buildNativeControls();

    this.safePlay(video);
    if (loadingEl) loadingEl.style.display = 'none';
  },

  safePlay: function(video) {
    // HTMLMediaElement.play() doesn't return a Promise on this TV's old
    // WebKit -- it returns undefined, so calling .catch() on it unconditionally
    // throws and (until this guard existed) silently broke native playback.
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function() {});
    }
  },

  setupIframePlayer: function(url) {
    this.mode = 'iframe';
    var mediaContainer = document.getElementById('player-media');
    var loadingEl = document.getElementById('player-loading');

    var iframe = document.createElement('iframe');
    iframe.className = 'player-iframe';
    iframe.id = 'player-iframe';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.src = url;
    mediaContainer.appendChild(iframe);

    if (loadingEl) loadingEl.style.display = 'none';
  },

  buildNativeControls: function() {
    var centerControls = document.getElementById('player-center-controls');
    var bottomBar = document.getElementById('player-bottom-bar');
    if (!centerControls || !bottomBar) return;

    var prevBtn = document.createElement('button');
    prevBtn.className = 'player-ctrl-btn';
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
    nextBtn.setAttribute('data-focusable', 'true');
    nextBtn.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor"/></svg>';
    nextBtn.addEventListener('click', function() { PlayerScreen.nextEpisode(); });
    centerControls.appendChild(nextBtn);

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
    epIndicator.textContent = (this.currentEpisodeIndex + 1) + ' / ' + this.episodes.length;
    timeRow.appendChild(epIndicator);

    var timeDuration = document.createElement('span');
    timeDuration.className = 'player-time';
    timeDuration.id = 'player-time-duration';
    timeDuration.textContent = '0:00';
    timeRow.appendChild(timeDuration);

    var extraControls = document.createElement('div');
    extraControls.className = 'player-extra-controls';

    var skipOpBtn = document.createElement('button');
    skipOpBtn.className = 'player-skip-op-btn';
    skipOpBtn.setAttribute('data-focusable', 'true');
    skipOpBtn.title = 'Пропустить опенинг';
    skipOpBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" fill="currentColor"/></svg>';
    skipOpBtn.addEventListener('click', function() { PlayerScreen.seek(PlayerScreen.OP_SKIP_SECONDS); });
    extraControls.appendChild(skipOpBtn);

    if (this.qualities && this.qualities.length > 1) {
      var qualityBtn = document.createElement('button');
      qualityBtn.className = 'player-quality-btn';
      qualityBtn.id = 'player-quality-btn';
      qualityBtn.setAttribute('data-focusable', 'true');
      qualityBtn.textContent = this.qualities[this.currentQualityIndex].quality + 'p';
      qualityBtn.addEventListener('click', function() { PlayerScreen.showQualityList(); });
      extraControls.appendChild(qualityBtn);
    }

    var speedBtn = document.createElement('button');
    speedBtn.className = 'player-speed-btn';
    speedBtn.id = 'player-speed-btn';
    speedBtn.setAttribute('data-focusable', 'true');
    speedBtn.textContent = this.formatSpeed(this.playbackSpeed);
    speedBtn.addEventListener('click', function() { PlayerScreen.showSpeedList(); });
    extraControls.appendChild(speedBtn);

    timeRow.appendChild(extraControls);

    bottomBar.appendChild(timeRow);
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

  nextEpisode: function() {
    if (this.currentEpisodeIndex < this.episodes.length - 1) {
      this.saveProgress();
      this.loadEpisode(this.currentEpisodeIndex + 1);
      this.showControls();
    }
  },

  prevEpisode: function() {
    if (this.currentEpisodeIndex > 0) {
      this.saveProgress();
      this.loadEpisode(this.currentEpisodeIndex - 1);
      this.showControls();
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

  showQualityList: function() {
    var existing = document.getElementById('player-quality-list');
    if (existing) { existing.remove(); return; }
    if (!this.qualities || this.qualities.length < 2) return;

    var panel = document.createElement('div');
    panel.className = 'player-ep-list player-quality-list';
    panel.id = 'player-quality-list';

    var panelTitle = document.createElement('div');
    panelTitle.className = 'player-ep-list-title';
    panelTitle.textContent = 'Качество';
    panel.appendChild(panelTitle);

    var list = document.createElement('div');
    list.className = 'player-ep-list-scroll';

    for (var i = 0; i < this.qualities.length; i++) {
      var q = this.qualities[i];
      var item = document.createElement('button');
      item.className = 'player-ep-list-item' + (i === this.currentQualityIndex ? ' active' : '');
      item.setAttribute('data-focusable', 'true');
      item.textContent = q.quality + 'p';

      (function(idx) {
        item.addEventListener('click', function() {
          PlayerScreen.switchQuality(idx);
          var panel = document.getElementById('player-quality-list');
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
      if (activeItem) FocusManager.setFocus(activeItem);
    }, 50);
  },

  switchQuality: function(index) {
    if (!this.qualities || !this.qualities[index] || !this.videoEl) return;
    this.currentQualityIndex = index;
    this.switchSource(this.qualities[index].url);

    var btn = document.getElementById('player-quality-btn');
    if (btn) btn.textContent = this.qualities[index].quality + 'p';
  },

  switchSource: function(url) {
    if (!this.videoEl) return;
    var self = this;
    var resumeTime = this.videoEl.currentTime;
    var wasPaused = this.videoEl.paused;
    var mediaContainer = document.getElementById('player-media');
    var loadingEl = document.getElementById('player-loading');

    if (loadingEl) {
      loadingEl.style.display = 'flex';
      var loadingText = loadingEl.querySelector('.player-loading-text');
      if (loadingText) loadingText.textContent = 'Переключение...';
    }

    // Reusing the same <video> via src+load() for a new source silently
    // dropped the audio track and left a stale/corrupt HLS session (garbage
    // duration, black frame) on this TV's decoder -- recreate the element
    // instead, mirroring the already-reliable initial-load path.
    this.videoEl.pause();
    this.videoEl.src = '';
    if (mediaContainer) mediaContainer.innerHTML = '';

    var video = document.createElement('video');
    video.className = 'player-video';
    video.id = 'player-video';
    video.preload = 'auto';
    video.setAttribute('playsinline', '');
    video.src = url;
    video.playbackRate = this.playbackSpeed;
    this.videoEl = video;
    if (mediaContainer) mediaContainer.appendChild(video);

    this.setupVideoEvents(video);

    var onReady = function() {
      video.removeEventListener('loadedmetadata', onReady);
      video.currentTime = resumeTime;
      if (loadingEl) loadingEl.style.display = 'none';
      if (!wasPaused) self.safePlay(video);
    };
    video.addEventListener('loadedmetadata', onReady);
  },

  formatSpeed: function(rate) {
    return rate === 1 ? 'Обычная' : (rate + 'x');
  },

  showSpeedList: function() {
    var existing = document.getElementById('player-speed-list');
    if (existing) { existing.remove(); return; }

    var self = this;
    var panel = document.createElement('div');
    panel.className = 'player-ep-list player-quality-list';
    panel.id = 'player-speed-list';

    var panelTitle = document.createElement('div');
    panelTitle.className = 'player-ep-list-title';
    panelTitle.textContent = 'Скорость';
    panel.appendChild(panelTitle);

    var list = document.createElement('div');
    list.className = 'player-ep-list-scroll';

    for (var i = 0; i < this.speedOptions.length; i++) {
      var rate = this.speedOptions[i];
      var item = document.createElement('button');
      item.className = 'player-ep-list-item' + (rate === this.playbackSpeed ? ' active' : '');
      item.setAttribute('data-focusable', 'true');
      item.textContent = this.formatSpeed(rate);

      (function(r) {
        item.addEventListener('click', function() {
          self.setPlaybackSpeed(r);
          var panel = document.getElementById('player-speed-list');
          if (panel) panel.remove();
          self.showControls();
        });
      })(rate);

      list.appendChild(item);
    }

    panel.appendChild(list);

    var wrap = document.getElementById('player-wrap');
    if (wrap) wrap.appendChild(panel);

    setTimeout(function() {
      var activeItem = panel.querySelector('.player-ep-list-item.active');
      if (activeItem) FocusManager.setFocus(activeItem);
    }, 50);
  },

  setPlaybackSpeed: function(rate) {
    this.playbackSpeed = rate;
    if (this.videoEl) this.videoEl.playbackRate = rate;
    var btn = document.getElementById('player-speed-btn');
    if (btn) btn.textContent = this.formatSpeed(rate);
  },

  togglePlay: function() {
    if (!this.videoEl) return;
    if (this.videoEl.paused) {
      this.safePlay(this.videoEl);
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
    var qualityList = document.getElementById('player-quality-list');
    var speedList = document.getElementById('player-speed-list');
    if (epList || qualityList || speedList) return;

    var overlay = document.getElementById('player-overlay');
    if (overlay) overlay.classList.add('visible');

    if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
    var self = this;
    this.controlsTimeout = setTimeout(function() {
      self.hideControls();
    }, 4000);
  },

  hideControls: function() {
    if (this.mode === 'native' && this.videoEl && this.videoEl.paused) return;
    var overlay = document.getElementById('player-overlay');
    if (overlay) overlay.classList.remove('visible');
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
    var qualityList = document.getElementById('player-quality-list');
    var speedList = document.getElementById('player-speed-list');

    switch (keyCode) {
      case 415: // Play
      case 10252: // PlayPause
        if (this.mode === 'native') { this.togglePlay(); return true; }
        break;
      case 413: // Stop
        App.goBack();
        return true;
      case 417: // FastForward
        if (this.mode === 'native') { this.seek(30); return true; }
        break;
      case 412: // Rewind
        if (this.mode === 'native') { this.seek(-30); return true; }
        break;
      case 37: // Left
        if (!epList && !qualityList && !speedList && this.mode === 'native') { this.seek(-10); return true; }
        break;
      case 39: // Right
        if (!epList && !qualityList && !speedList && this.mode === 'native') { this.seek(10); return true; }
        break;
      case 10009: // Back (Tizen)
      case 8:     // Backspace
        if (speedList) { speedList.remove(); return true; }
        if (qualityList) { qualityList.remove(); return true; }
        if (epList) { epList.remove(); return true; }
        break;
    }
    return false;
  },

  saveProgress: function() {
    if (this.mode !== 'native') return;
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
    this.loadToken++;
    this.saveProgress();
    this.stopSaveInterval();
    if (this.videoEl) {
      this.videoEl.pause();
      this.videoEl.src = '';
    }
    var mediaContainer = document.getElementById('player-media');
    if (mediaContainer) mediaContainer.innerHTML = '';
    if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
  }
};
