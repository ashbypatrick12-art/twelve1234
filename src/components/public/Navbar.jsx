import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <header className="site-header">
      <div className="nav-inner">
        <NavLink to="/" className="wordmark" onClick={() => setOpen(false)} aria-label="Serene Beauty Studio home">serene<span>BEAUTY STUDIO</span></NavLink>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink><NavLink to="/services">Our services</NavLink><a href="/#studio">The studio</a><NavLink to="/contact">Get in touch</NavLink>
        </nav>
        <div className="nav-actions"><NavLink to="/book" className="studio-button compact" onClick={() => setOpen(false)}>Book a visit <ArrowUpRight size={16} /></NavLink>
          <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{[['/', 'Home'], ['/services', 'Our services'], ['/#studio', 'The studio'], ['/contact', 'Get in touch']].map(([to, label]) => <a key={to} href={to} aria-current={pathname === to ? 'page' : undefined} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={18} /></a>)}</nav>}
    </header>
  );
}
