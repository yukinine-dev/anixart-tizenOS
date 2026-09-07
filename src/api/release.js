var ReleaseApi = {
  getRelease: function(releaseId, token) {
    return ApiClient.post('release/' + releaseId, {
      token: token
    });
  },

  getEpisodes: function(releaseId, sourceId, token) {
    return ApiClient.post('release/' + releaseId + '/episode', {
      token: token,
      queryParams: sourceId ? { sourceId: sourceId } : undefined
    });
  },

  getSources: function(releaseId, token) {
    return ApiClient.post('release/' + releaseId + '/source', {
      token: token
    });
  },

  getEpisodeLinks: function(releaseId, episodeId, sourceId, token) {
    var params = {};
    if (sourceId) params.sourceId = sourceId;
    return ApiClient.post('release/' + releaseId + '/episode/' + episodeId + '/link', {
      token: token,
      queryParams: params
    });
  }
};
