import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { formatUGX } from '../../lib/format';

const CATEGORIES = [
  { name: 'All', value: '' },
  { name: 'Hair', value: 'Hair' },
  { name: 'Nails', value: 'Nails' },
  { name: 'Makeup', value: 'Makeup' },
  { name: 'Skincare', value: 'Skincare' },
];

export function Services() {
  const [category, setCategory] = useState('');

  return (
    <div>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="max-w-xl">
          <p className="section-title__eyebrow">Menu</p>
          <h2 className="font-display text-3xl sm:text-4xl mt-2">Services</h2>
          <p className="mt-3 text-muted leading-relaxed">
            Every service includes a consultation, clean tools, and a finished look you can walk
            out of. Prices are shown in Ugandan shillings.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              onClick={() => setCategory(item.value)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                category === item.value
                  ? 'bg-charcoal text-white shadow-soft'
                  : 'bg-ivory text-charcoal border border-line hover:bg-white'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {[
            { id: 'svc-silk-press', category: 'Hair', name: 'Signature Silk Press', price: 120000, duration: 90, image: 'service-silk-press' },
            { id: 'svc-precision-cut', category: 'Hair', name: 'Precision Cut & Style', price: 80000, duration: 60, image: 'service-precision-cut' },
            { id: 'svc-texture', category: 'Hair', name: 'Curl & Texture Styling', price: 95000, duration: 75, image: 'service-texture' },
            { id: 'svc-scalp-ritual', category: 'Hair', name: 'Scalp & Steam Ritual', price: 70000, duration: 60, image: 'service-scalp-ritual' },
            { id: 'svc-gel-manicure', category: 'Nails', name: 'Classic Gel Manicure', price: 55000, duration: 45, image: 'service-gel-manicure' },
            { id: 'svc-pedicure', category: 'Nails', name: 'Luxury Spa Pedicure', price: 75000, duration: 60, image: 'service-pedicure' },
            { id: 'svc-almond-set', category: 'Nails', name: 'Almond Sculpted Set', price: 110000, duration: 90, image: 'service-almond-set' },
            { id: 'svc-nail-art', category: 'Nails', name: 'Nail Art & Detail', price: 35000, duration: 30, image: 'service-nail-art' },
            { id: 'svc-soft-glam', category: 'Makeup', name: 'Soft Glam Session', price: 150000, duration: 90, image: 'service-soft-glam' },
            { id: 'svc-bridal', category: 'Makeup', name: 'Bridal Glow Package', price: 350000, duration: 150, image: 'service-bridal' },
            { id: 'svc-natural-look', category: 'Makeup', name: 'Natural Day Look', price: 95000, duration: 60, image: 'service-natural-look' },
            { id: 'svc-radiance-facial', category: 'Skincare', name: 'Radiance Facial', price: 130000, duration: 75, image: 'service-radiance-facial' },
            { id: 'svc-hydra-glow', category: 'Skincare', name: 'Hydra Glow Treatment', price: 160000, duration: 90, image: 'service-hydra-glow' },
            { id: 'svc-calm-clear', category: 'Skincare', name: 'Calm & Clear Facial', price: 110000, duration: 60, image: 'service-calm-clear' },
          ]
            .filter((service) => !category || service.category === category)
            .map((service) => (
            <Card key={service.id} className="p-0 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`/images/${service.image}.jpg`}
                  alt={service.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-charcoal">
                  {service.category}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-charcoal">
                  {service.duration >= 60 ? `${service.duration / 60} hr` : `${service.duration} min`}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-base">{service.name}</h3>
                <p className="text-lg font-semibold mt-1">{formatUGX(service.price)}</p>
                <p className="text-sm text-muted mt-1.5">{service.duration} minutes · consultation included</p>
                <Link
                  to={`/book?service=${service.id}`}
                  className="mt-4 text-sm font-semibold text-sage hover:text-sagedeep transition"
                >
                  Choose a time
                  <ArrowRight className="w-4 h-4 ml-1.5 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {category && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              Showing all <span className="font-medium text-charcoal">{category}</span> services
              for now. No matches? That’s okay — check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
