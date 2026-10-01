export default function Loading() {
  // Deliberately a blank dark screen matching the brand background rather
  // than a spinner — the splash intro already provides the "premium
  // first-load moment"; this only appears on subsequent navigations while
  // server data is fetched, and should be near-instant given ISR caching.
  return <div className="min-h-screen bg-vrind-black" />;
}
