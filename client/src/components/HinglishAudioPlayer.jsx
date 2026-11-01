import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Headphones, Loader2 } from "lucide-react";
import { audioApi, getErrorMessage } from "../utils/api";
import ErrorMessage from "./ErrorMessage";

const SPEEDS = [0.75, 1, 1.25, 1.5];

function useElapsed(active) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "lesson";

export default function HinglishAudioPlayer({ lessonId, lessonTitle }) {
  const [url, setUrl] = useState(null);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => audioApi.generate(lessonId),
    onSuccess: (blob) => setUrl(URL.createObjectURL(blob)),
  });
  const seconds = useElapsed(isPending);

  // free the audio memory when the player goes away or a new file replaces it
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Hinglish audio explanation</h2>
            <p className="text-sm text-slate-500">Listen to this lesson explained in simple Hindi + English.</p>
          </div>
        </div>

        {!url && (
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4" />}
            {isPending ? `Creating audio... ${seconds}s` : "Listen in Hinglish"}
          </button>
        )}
      </div>

      {isPending && (
        <p className="mt-3 text-sm text-slate-500">
          First time only: translating and recording takes up to a minute. Next time it plays instantly.
        </p>
      )}

      {error && (
        <div className="mt-4">
          <ErrorMessage message={getErrorMessage(error)} onRetry={() => mutate()} />
        </div>
      )}

      {url && (
        <div className="mt-4 space-y-3">
          <audio
            ref={audioRef}
            src={url}
            controls
            autoPlay
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = speed;
            }}
            className="w-full"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}x
                  </option>
                ))}
              </select>
            </label>
            <a
              href={url}
              download={`${slug(lessonTitle)}-hinglish.wav`}
              className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:underline"
            >
              <Download className="h-4 w-4" /> Download audio
            </a>
          </div>
        </div>
      )}
    </section>
  );
}