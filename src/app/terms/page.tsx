import { ChevronLeft, Scale } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-8 group text-gray-500 hover:text-black transition-colors font-mono uppercase text-xs font-bold"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="mb-12 border-l-8 border-yellow-400 pl-8">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-yellow-500" />
          <span className="font-mono text-sm font-bold text-yellow-600 uppercase tracking-[0.2em]">
            Operational Directive
          </span>
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
          Terms of Use
        </h1>
        <p className="font-mono text-sm text-gray-400 uppercase tracking-widest leading-none">
          Revision: 4.2 // Sector: Global Arcade
        </p>
      </div>

      <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] space-y-10 font-mono text-sm leading-relaxed text-gray-700">
        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-yellow-50 px-2 py-1 inline-block border-2 border-black">
            01. Acceptance of Code
          </h2>
          <p>
            By entering the UniGames platform, you agree to abide by these
            terms. This is a binding agreement between you and UniGames
            regarding your use of the website and all associated gaming
            services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-yellow-50 px-2 py-1 inline-block border-2 border-black">
            02. Fair Play Policy
          </h2>
          <p>
            We maintain a high standard of conduct within our digital domain.
            You are strictly prohibited from:
          </p>
          <ul className="list-none space-y-3 font-bold text-black uppercase text-xs tracking-tight">
            <li>[X] Reverse engineering embedded game engines.</li>
            <li>
              [X] Utilizing automated scripts (bots) to manipulate high scores.
            </li>
            <li>
              [X] Disrupting the experience of other players through network
              interference.
            </li>
            <li>
              [X] Commercializing UniGames content without explicit permit.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-yellow-50 px-2 py-1 inline-block border-2 border-black">
            03. Intellectual Property
          </h2>
          <p>
            The UniGames platform, including its visual design, branding, and
            proprietary assets, is protected by copyright. The individual games
            hosted on the platform are the property of their respective
            developers and are licensed for play only. No ownership rights are
            transferred to the user.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black uppercase text-black italic bg-yellow-50 px-2 py-1 inline-block border-2 border-black">
            04. Limitation of Liability
          </h2>
          <p>
            UniGames provides games "as is." We do not guarantee a bug-free
            experience or uninterrupted service. We are not liable for any data
            loss occurring through local storage malfunction or game errors.
          </p>
        </section>

        <section className="space-y-4 border-2 border-black p-6 bg-gray-50 italic">
          <h2 className="text-sm font-black uppercase text-black not-italic mb-2 underline decoration-yellow-400 decoration-2">
            05. Termination
          </h2>
          <p>
            UniGames reserves the right to restrict access to any IP address
            found to be in violation of the Fair Play Policy without prior
            notice.
          </p>
        </section>

        <div className="pt-12 border-t-2 border-black border-dashed flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest">
          <span>Effective immediately upon access</span>
        </div>
      </div>
    </div>
  );
}
