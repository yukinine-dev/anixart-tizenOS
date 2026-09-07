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
    overlay.appendChild(topBar);

    var centerControls = document.createElement('div');
    centerControls.className = 'player-center-controls';

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
      if (self.currentEpisodeIndex < self.episodes.length - 1) {
        self.currentEpisodeIndex++;
        self.loadEpisode(self.currentEpisodeIndex);
      }
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
    var mins = Math.floor(s / 60);
    var secs = Math.floor(s % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  },

  handleKey: function(keyCode) {
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
        this.seek(-10);
        return true;
      case 39: // Right
        this.seek(10);
        return true;
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
