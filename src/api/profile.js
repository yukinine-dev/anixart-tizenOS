var ProfileApi = {
  LISTS: {
    watching: 1,
    planned: 2,
    watched: 3,
    delayed: 4,
    dropped: 5
  },

  getProfile: function(profileId, token) {
    return ApiClient.post('profile/' + profileId, { token: token });
  },

  getList: function(profileId, listType, page, token) {
    page = page || 0;
    return ApiClient.post('profile/list/' + listType + '/' + page, {
      token: token,
      queryParams: { profile_id: profileId }
    });
  },

  addToList: function(releaseId, listType, token) {
    return ApiClient.post('profile/list/add', {
      token: token,
      formData: { release_id: releaseId, status: listType }
    });
  },

  removeFromList: function(releaseId, token) {
    return ApiClient.post('profile/list/delete', {
      token: token,
      formData: { release_id: releaseId }
    });
  }
};
