var DiscoverApi = {
  getInteresting: function() {
    return ApiClient.post('discover/interesting');
  },

  getRecommendations: function(page, previousPage, token) {
    return ApiClient.post('discover/recommendations/' + page, {
      token: token,
      queryParams: { previous_page: previousPage }
    });
  },

  getWatching: function(page, token) {
    return ApiClient.post('discover/watching/' + page, {
      token: token
    });
  },

  getDiscussing: function(token) {
    return ApiClient.post('discover/discussing', {
      token: token
    });
  },

  getComments: function() {
    return ApiClient.post('discover/comments');
  }
};
