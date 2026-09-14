var CollectionApi = {
  getUserCollections: function(profileId, page, token) {
    return ApiClient.get('collection/all/profile/' + profileId + '/' + page, { token: token });
  },

  getCollectionsForRelease: function(releaseId, page, token) {
    return ApiClient.get('collection/all/release/' + releaseId + '/' + page, { token: token });
  },

  addReleaseToCollection: function(collectionId, releaseId, token) {
    return ApiClient.get('collectionMy/release/add/' + collectionId, {
      token: token,
      queryParams: { release_id: releaseId }
    });
  }
};
