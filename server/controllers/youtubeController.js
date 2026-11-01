const asyncHandler = require("../utils/asyncHandler");
const { getVideoForQuery } = require("../services/youtubeService");

exports.getVideo = asyncHandler(async (req, res) => {
  const video = await getVideoForQuery(req.validatedQuery.query);
  res.json({
    success: true,
    data: {
      ...video,
      embedUrl: `https://www.youtube-nocookie.com/embed/${video.videoId}`,
    },
  });
});