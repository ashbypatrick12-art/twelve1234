import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react';
import { formatUGX } from '../../lib/format';

const treatments = [
  { id: 'silk-press', category: 'HAIR', name: 'Signature Silk Press', price: 120000, duration: 90 },
  { id: 'gel-manicure', category: 'NAILS', name: 'Classic Gel Manicure', price: 55000, duration: 45 },
  { id: 'soft-glam', category: 'MAKEUP', name: 'Soft Glam Session', price: 150000, duration: 90 },
  { id: 'radiance-facial', category: 'SKINCARE', name: 'Radiance Facial', price: 130000, duration: 75 },
];

export function Home() {
  return (
    <>
      <section className="studio-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> YOUR LITTLE ESCAPE IN KAMPALA</p>
          <h1>A little time.<br />All <em>for you.</em></h1>
          <p className="hero-description">Good hair days. A fresh set. Skin that feels like you again. Make room for a little self-care at Serene Beauty Studio.</p>
          <div className="hero-actions"><Link to="/book" className="studio-button">Book your appointment <ArrowUpRight size={19} /></Link><Link to="/services" className="text-link">Explore our services <ArrowRight size={17} /></Link></div>
          <div className="hero-note"><CalendarDays size={17} /><span>Your service. Your time. No account needed.</span></div>
        </div>
        <div className="hero-visual">
          <img src="/images/hero.jpg" alt="A welcoming beauty studio with thoughtfully styled interiors" fetchPriority="high" />
          <span className="image-label">SLOW DOWN. FEEL GOOD.</span>
          <div className="hero-image-note"><Sparkles size={24} /><div>Beauty, made personal.<span>A moment of calm, just for you.</span></div></div>
        </div>
      </section>
      <div className="studio-strip"><span><MapPin size={17} /> Kampala, Uganda</span><span><Clock3 size={17} /> Time for your kind of beauty</span><span><Sparkles size={17} /> Hair · Nails · Makeup · Skincare</span></div>
      <section className="home-section" id="services">
        <div className="section-heading"><div><p className="eyebrow">THE SERVICE EDIT</p><h2>Find your feel-good.</h2></div><Link to="/services" className="text-link">View all services <ArrowUpRight size={18} /></Link></div>
        <div className="treatment-grid">{treatments.map((service) => <Link to={`/book?service=svc-${service.id}`} className="treatment" key={service.id}><div className="treatment-image"><img src={`/images/service-${service.id}.jpg`} alt={service.name} loading="lazy" /><span className="treatment-arrow"><ArrowUpRight size={21} /></span></div><div className="treatment-meta"><span>{service.category}</span><span>{service.duration} MIN</span></div><h3>{service.name}</h3><p>{formatUGX(service.price)}<span> / session</span></p></Link>)}</div>
      </section>
      <section className="studio-story home-section" id="studio"><div className="story-photo"><img src="/images/about.jpg" alt="A quiet corner of Serene Beauty Studio" loading="lazy" /><span>A little less rush.<br /><em>A little more you.</em></span></div><div className="story-copy"><p className="eyebrow">WELCOME TO SERENE</p><h2>Come as you are.<br />Leave feeling <em>like you.</em></h2><p>There’s something special about setting aside time for yourself. A quiet chair, a thoughtful consultation, and the little details that make a look your own.</p><p>From your everyday routine to your biggest moments, find your next hair, nail, makeup or skincare appointment here.</p><Link to="/services" className="text-link">Find your next treatment <ArrowRight size={18} /></Link></div></section>
      <section className="booking-intro home-section"><div><p className="eyebrow">LESS PLANNING. MORE PAMPERING.</p><h2>Your next appointment,<br /><em>made simple.</em></h2><Link to="/book" className="studio-button">Let’s book you in <ArrowUpRight size={18} /></Link></div><ol>{[['Choose your treatment', 'Browse the menu and find a little something for you.'], ['Find your moment', 'Pick an available day and a time that fits your plans.'], ['Make it yours', 'Add your details and review your appointment.']].map(([title, text], i) => <li key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
      <section className="closing-note"><Sparkles size={26} /><p>A little self-care goes a long way.</p><Link to="/book" className="text-link">Make time for yourself <ArrowUpRight size={18} /></Link></section>
    </>
  );
}
