export function Loader({ label = "Loading..." }: { label?: string }) {
  return <div className="page-state">{label}</div>;
}
