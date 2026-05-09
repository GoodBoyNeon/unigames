import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 group text-gray-500 hover:text-black transition-colors font-mono uppercase text-xs font-bold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-12 border-l-8 border-cyan-500 pl-8">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-8 h-8 text-cyan-500" />
          <span className="font-mono text-sm font-bold text-cyan-600 uppercase tracking-[0.2em]">
            Security Protocol Alpha
          </span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
          Privacy Policy
        </h1>
        <p className="font-mono text-sm text-gray-400 uppercase tracking-widest leading-none">
          Status: Active // Last Sync: May 2026
        </p>
      </div>

      <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(6,182,212,1)] space-y-10 font-mono text-sm leading-relaxed text-gray-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-cyan-50 px-2 py-1 inline-block border-2 border-black">
            01. Data Philosophy
          </h2>
          <p>
            UniGames is built on the principle of minimal data collection. We
            believe your gaming habits are your own. We do not require account
            creation, and we do not sell your personal behavior to third-party
            data brokers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-cyan-50 px-2 py-1 inline-block border-2 border-black">
            02. Local-First Storage
          </h2>
          <p>
            To provide features like "Favorites" and "Recently Played" without
            tracking you across the web, we use **browser-based local storage**.
            This data resides exclusively on your device.
          </p>
          <ul className="list-none space-y-3">
            <li className="flex gap-4">
              <span className="text-cyan-600 font-bold">[!]</span>
              <span>
                <strong>Stored Data:</strong> Game IDs, timestamps of last play,
                and favorite status.
              </span>
            </li>
            <li className="flex gap-4">
              <span className="text-cyan-600 font-bold">[!]</span>
              <span>
                <strong>Clearing Data:</strong> You can wipe this data at any
                time by clearing your browser's site data for UniGames.
              </span>
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-cyan-50 px-2 py-1 inline-block border-2 border-black">
            03. Analytics
          </h2>
          <p>
            We use anonymized analytics to see which games are popular and how
            many players visit us daily. We strip all PII (Personally
            Identifiable Information) before processing these metrics.
          </p>
        </section>

        <div className="pt-12 border-t-2 border-black border-dashed flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest" />
      </div>
    </div>
  );
}
