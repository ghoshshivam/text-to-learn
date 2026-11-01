export default function HeadingBlock({ text, isFirst }) {
  return isFirst ? (
    <h2 className="pt-2 text-2xl font-bold text-slate-900">{text}</h2>
  ) : (
    <h3 className="pt-4 text-xl font-semibold text-slate-900">{text}</h3>
  );
}