const VideoCache = require("../models/VideoCache");
const { AppError } = require("../utils/errors");

const normalize = (q) => q.toLowerCase().replace(/\s+/g, " ").trim();

const decodeEntities = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const QUOTA_REASONS = new Set(["quotaExceeded", "dailyLimitExceeded", "rateLimitExceeded"]);

async function searchYouTube(query) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new AppError("Videos are not configured on the server", {
      statusCode: 503,
      code: "YOUTUBE_NOT_CONFIGURED",
    });
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    safeSearch: "strict",
    relevanceLanguage: "en",
    maxResults: "5",
    key,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason;
    console.error("[youtube]", res.status, reason, body?.error?.message);

    if (res.status === 403 && QUOTA_REASONS.has(reason)) {
      throw new AppError("The daily video quota has been reached. Try again tomorrow.", {
        statusCode: 503,
        code: "YOUTUBE_QUOTA_EXCEEDED",
      });
    }
    throw new AppError("Could not load a video right now", { statusCode: 502, code: "YOUTUBE_FAILED" });
  }

  const data = await res.json();
  const item = data.items?.find((i) => i.id?.videoId);
  if (!item) {
    throw new AppError("No video found for this topic", { statusCode: 404, code: "VIDEO_NOT_FOUND" });
  }

  return {
    videoId: item.id.videoId,
    title: decodeEntities(item.snippet?.title),
    channel: decodeEntities(item.snippet?.channelTitle),
  };
}

// Returns a cached result when we have one; otherwise searches and saves it
async function getVideoForQuery(rawQuery) {
  const query = normalize(rawQuery);

  const cached = await VideoCache.findOne({ query }).lean();
  if (cached) return { videoId: cached.videoId, title: cached.title, channel: cached.channel };

  const video = await searchYouTube(query);
  await VideoCache.updateOne({ query }, { $set: { ...video, query } }, { upsert: true }).catch((err) =>
    console.warn("[youtube] cache write failed:", err.message)
  );
  return video;
}

module.exports = { getVideoForQuery };