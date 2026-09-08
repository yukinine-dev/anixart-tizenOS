var WatchHistory = {
  STORAGE_KEY: 'anixart_watch_history',

  getAll: function() {
    try {
      var data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  get: function(releaseId) {
    var all = this.getAll();
    return all[releaseId] || null;
  },

  save: function(releaseId, episodeIndex, currentTime, duration) {
    var all = this.getAll();
    all[releaseId] = {
      episodeIndex: episodeIndex,
      currentTime: currentTime,
      duration: duration || 0,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  },

  remove: function(releaseId) {
    var all = this.getAll();
    delete all[releaseId];
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  },

  getProgress: function(releaseId) {
    var entry = this.get(releaseId);
    if (!entry || !entry.duration) return 0;
    return Math.min(1, entry.currentTime / entry.duration);
  },

  getRecent: function(limit) {
    var all = this.getAll();
    var entries = [];
    for (var id in all) {
      if (all.hasOwnProperty(id)) {
        entries.push({ releaseId: id, data: all[id] });
      }
    }
    entries.sort(function(a, b) { return b.data.updatedAt - a.data.updatedAt; });
    return entries.slice(0, limit || 20);
  }
};
