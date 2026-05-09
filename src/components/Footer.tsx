import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-8 border-purple-600 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-6">
            Uni<span className="text-purple-500">Games</span>
          </h2>
          <p className="font-mono text-gray-400 max-w-md leading-relaxed">
            A showcase of indie web games. Built for the modern player with a
            passion for classic games.
          </p>
        </div>

        <div>
          <h3 className="font-sans font-bold uppercase tracking-widest text-purple-500 mb-6 underline">
            Platform
          </h3>
          <ul className="space-y-3 font-mono text-sm">
            <li>
              <Link href="/library" className="hover:text-purple-400">
                All Games
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:text-purple-400">
                Favorites
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans font-bold uppercase tracking-widest text-purple-500 mb-6 underline">
            Legal
          </h3>
          <ul className="space-y-3 font-mono text-sm">
            <li>
              <Link href="/privacy" className="hover:text-purple-400">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-purple-400">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-purple-400">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500 uppercase">
        <p>© 2026 UniGames. All rights reserved.</p>
        <div className="flex gap-8">
          <a
            href="#"
            className="hover:text-white transition-colors underline underline-offset-4 decoration-purple-600"
          >
            Twitter
          </a>
          <a
            href="https://discord.com/users/816253376962625537"
            className="hover:text-white transition-colors underline underline-offset-4 decoration-purple-600"
          >
            Discord
          </a>
          <Link
            href="https://github.com/goodboyneon/unigames"
            className="hover:text-white transition-colors underline underline-offset-4 decoration-purple-600"
          >
            Github
          </Link>
        </div>
      </div>
    </footer>
  );
}
