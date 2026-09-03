import Navbar from './Navbar';

/**
 * Application shell: sticky navbar + main content area. Every route renders
 * inside this, so page components only need to worry about their own
 * content, not repeating navbar/chrome.
 */
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}