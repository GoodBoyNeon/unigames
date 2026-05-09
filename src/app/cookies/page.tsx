import { ChevronLeft, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 group text-gray-500 hover:text-black transition-colors font-mono uppercase text-xs font-bold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Arcade
      </Link>

      <div className="mb-12 border-l-8 border-orange-500 pl-8">
        <div className="flex items-center gap-3 mb-4">
          <Cookie className="w-8 h-8 text-orange-500" />
          <span className="font-mono text-sm font-bold text-orange-600 uppercase tracking-[0.2em]">
            Storage Manifest
          </span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
          Cookie Policy
        </h1>
        <p className="font-mono text-sm text-gray-400 uppercase tracking-widest leading-none">
          Edition: Beta-V // Type: Functional Storage
        </p>
      </div>

      <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] space-y-10 font-mono text-sm leading-relaxed text-gray-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-orange-50 px-2 py-1 inline-block border-2 border-black">
            01. What We Use
          </h2>
          <p>
            UniGames uses "Cookies" and "Local Storage" to remember who you are
            across sessions. Without these small pieces of data, the platform
            wouldn't know your high scores or which games you've favorited.
          </p>
        </section>

        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-black p-4 space-y-2">
              <h3 className="font-black uppercase text-xs text-orange-600 underline">
                Essential
              </h3>
              <p className="text-[11px]">
                Necessary for platform stability, navigation, and core UI
                functionality. Cannot be disabled.
              </p>
            </div>
            <div className="border-2 border-black p-4 space-y-2">
              <h3 className="font-black uppercase text-xs text-orange-600 underline">
                Functional
              </h3>
              <p className="text-[11px]">
                Enables the "Favorites" list and "Recently Played" section.
                Stored locally on your machine.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-orange-50 px-2 py-1 inline-block border-2 border-black">
            02. Third-Party Cookies
          </h2>
          <p>
            Individual games may place their own cookies to track game progress
            or save settings.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-orange-50 px-2 py-1 inline-block border-2 border-black">
            03. Cookie Control
          </h2>
          <p>
            Most web browsers allow you to control cookies through their
            settings preferences. However, if you limit the ability of websites
            to set cookies, you may worsen your overall user experience, as it
            will no longer be personalized to you.
          </p>
          <div className="bg-black text-white p-6 font-bold text-center border-2 border-orange-500 uppercase text-xs tracking-widest">
            UniGames does Not use Marketing or Tracking pixels.
          </div>
        </section>

        <div className="pt-12 border-t-2 border-black border-dashed flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest" />
      </div>
    </div>
  );
}
