import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
export function Footer() {
  return <footer className="studio-footer"><div className="footer-top"><div><Link to="/" className="wordmark">serene<span>BEAUTY STUDIO</span></Link><p>Beauty, made personal.<br />Your little escape in Kampala.</p></div><nav aria-label="Footer navigation"><Link to="/services">Our services</Link><Link to="/contact">Get in touch</Link><Link to="/book">Book an appointment <ArrowUpRight size={15} /></Link></nav><div className="footer-location"><span>FIND YOUR MOMENT</span><p>Hair. Nails. Makeup. Skincare.<br />Kampala, Uganda · Prices in UGX</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Serene Beauty Studio</span><span>Powered by Gency Bookings</span></div></footer>;
}
