import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">404 - Page Not Found</h2>
      <p className="text-slate-600 mb-6 text-sm">The compliance page or resource you requested could not be found.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
