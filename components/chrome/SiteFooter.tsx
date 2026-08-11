export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="footer-name">William “Drew” Baker</p>
          <p className="footer-note">
            Software, geospatial intelligence, and risk-aware tools for work where the limits matter.
          </p>
        </div>
        <nav className="footer-links" aria-label="External profile links">
          <a href="https://github.com/drwbkr1" target="_blank" rel="noreferrer">
            GitHub <span className="sr-only">(opens in a new tab)</span> ↗
          </a>
          <a href="https://www.linkedin.com/in/william-baker-843946162/" target="_blank" rel="noreferrer">
            LinkedIn <span className="sr-only">(opens in a new tab)</span> ↗
          </a>
        </nav>
      </div>
    </footer>
  );
}
