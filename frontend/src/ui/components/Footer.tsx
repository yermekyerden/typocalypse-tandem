import GitHubLogo from '@/assets/icons/GitHub.png';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-mist-950 to-mist-800 text-yellow-50 p-3">
      <div className="mx-auto flex items-center justify-between max-w-8xl px-4">
        <p className="text-sm">&copy; 2026 Terminal Dojo</p>

        <a
          href="https://rs.school/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:text-yellow-400"
        >
          The Rolling Scopes School
        </a>

        <a
          href="https://github.com/yermekyerden/typocalypse-tandem"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm hover:text-yellow-400"
        >
          <img src={GitHubLogo} alt="GitHub Logo" className="h-6 w-6" />
        </a>
      </div>
    </footer>
  );
}
