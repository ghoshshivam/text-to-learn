import { ExternalLink } from "lucide-react";
import { useVideo } from "../../hooks/useCourses";

export default function VideoBlock({ query }) {
  const { data, isLoading, isError } = useVideo(query);
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  if (isLoading) {
    return <div className="aspect-video w-full animate-pulse rounded-xl bg-slate-200" aria-label="Loading video" />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p>We couldn't load a video for this lesson.</p>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:underline"
        >
          Search YouTube for "{query}" <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <figure className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm">
        <iframe
          src={`${data.embedUrl}?rel=0`}
          title={data.title || query}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      {data.title && (
        <figcaption className="text-sm text-slate-500">
          {data.title} <span className="text-slate-400">· {data.channel}</span>
        </figcaption>
      )}
    </figure>
  );
}
