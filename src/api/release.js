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
  },

  voteAdd: function(releaseId, vote, token) {
    return ApiClient.get('release/vote/add/' + releaseId + '/' + vote, { token: token });
  },

  voteDelete: function(releaseId, token) {
    return ApiClient.get('release/vote/delete/' + releaseId, { token: token });
  },

  getComments: function(releaseId, page, token) {
    return ApiClient.get('release/comment/all/' + releaseId + '/' + page, {
      token: token,
      queryParams: { sort: 1 }
    });
  },

  addComment: function(releaseId, message, parentCommentId, replyToProfileId, isSpoiler, token) {
    return ApiClient.post('release/comment/add/' + releaseId, {
      token: token,
      json: {
        message: message,
        parentCommentId: parentCommentId || null,
        replyToProfileId: replyToProfileId || null,
        spoiler: !!isSpoiler
      }
    });
  },

  editComment: function(commentId, message, isSpoiler, token) {
    return ApiClient.post('release/comment/edit/' + commentId, {
      token: token,
      json: { message: message, spoiler: !!isSpoiler }
    });
  },

  deleteComment: function(commentId, token) {
    return ApiClient.get('release/comment/delete/' + commentId, { token: token });
  },

  voteComment: function(commentId, action, token) {
    return ApiClient.get('release/comment/vote/' + commentId + '/' + action, { token: token });
  },

  getCommentReplies: function(commentId, token) {
    return ApiClient.get('release/comment/replies/' + commentId + '/0', {
      token: token,
      queryParams: { sort: 2 }
    });
  }
};
