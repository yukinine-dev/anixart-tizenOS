var ReleaseApi = {
  getRelease: function(releaseId, token) {
    return ApiClient.get('release/' + releaseId, {
      token: token
    });
  },

  getVoiceovers: function(releaseId, token) {
    return ApiClient.get('episode/' + releaseId, {
      token: token
    });
  },

  getSources: function(releaseId, voiceoverId, token) {
    return ApiClient.get('episode/' + releaseId + '/' + voiceoverId, {
      token: token
    });
  },

  getEpisodes: function(releaseId, voiceoverId, sourceId, token) {
    return ApiClient.get('episode/' + releaseId + '/' + voiceoverId + '/' + sourceId, {
      token: token
    });
  }
};
