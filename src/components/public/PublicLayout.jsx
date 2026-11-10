import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="min-h-screen flex flex-col bg-ivory font-sans text-charcoal">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className={pathname === '/' ? 'site-main' : 'site-main inner-page'}><Outlet /></main>
      <Footer />
    </div>
  );
}
