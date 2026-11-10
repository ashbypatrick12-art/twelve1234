import { addDaysISO, dayOfWeek, isPastSlot, todayISO } from './dates';

export const STANDARD_SLOT_TIMES = [
  '09:00',
  '10:30',
  '12:00',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
];

const SEED_SERVICES = [
  {
    id: 'svc-silk-press',
    name: 'Signature Silk Press',
    category: 'Hair',
    description:
      'A cleansing wash, precision blow-dry and glossy press that leaves natural hair smooth, light and full of movement.',
    price: 120000,
    duration: 90,
    image: '/images/service-silk-press.jpg',
  },
  {
    id: 'svc-precision-cut',
    name: 'Precision Cut & Style',
    category: 'Hair',
    description:
      'A face-framing cut tailored to your texture and routine, finished with a polished, salon-fresh blow-out.',
    price: 80000,
    duration: 60,
    image: '/images/service-precision-cut.jpg',
  },
  {
    id: 'svc-texture',
    name: 'Curl & Texture Styling',
    category: 'Hair',
    description:
      'Curl-defining care for coils and waves — hydrated, shaped and styled to hold its natural pattern all week.',
    price: 95000,
    duration: 75,
    image: '/images/service-texture.jpg',
  },
  {
    id: 'svc-scalp-ritual',
    name: 'Scalp & Steam Ritual',
    category: 'Hair',
    description:
      'A restorative steam treatment with a soothing scalp massage and a deeply conditioning mask.',
    price: 70000,
    duration: 60,
    image: '/images/service-scalp-ritual.jpg',
  },
  {
    id: 'svc-gel-manicure',
    name: 'Classic Gel Manicure',
    category: 'Nails',
    description:
      'Careful shaping, cuticle work and a long-wear gel finish in the shade of your choice.',
    price: 55000,
    duration: 45,
    image: '/images/service-gel-manicure.jpg',
  },
  {
    id: 'svc-pedicure',
    name: 'Luxury Spa Pedicure',
    category: 'Nails',
    description:
      'A warm soak, gentle exfoliation and relaxing foot massage, finished with a flawless polish.',
    price: 75000,
    duration: 60,
    image: '/images/service-pedicure.jpg',
  },
  {
    id: 'svc-almond-set',
    name: 'Almond Sculpted Set',
    category: 'Nails',
    description:
      'Sculpted almond extensions shaped by hand for an elegant, natural-looking finish.',
    price: 110000,
    duration: 90,
    image: '/images/service-almond-set.jpg',
  },
  {
    id: 'svc-nail-art',
    name: 'Nail Art & Detail',
    category: 'Nails',
    description:
      'Hand-painted detail, chrome or minimalist line work added to any manicure or set.',
    price: 35000,
    duration: 30,
    image: '/images/service-nail-art.jpg',
  },
  {
    id: 'svc-soft-glam',
    name: 'Soft Glam Session',
    category: 'Makeup',
    description:
      'Skin-first makeup with soft definition, lashes and a lasting finish for any occasion.',
    price: 150000,
    duration: 90,
    image: '/images/service-soft-glam.jpg',
  },
  {
    id: 'svc-bridal',
    name: 'Bridal Glow Package',
    category: 'Makeup',
    description:
      'A trial-informed bridal look with luminous skin, long-wear artistry and touch-up guidance.',
    price: 350000,
    duration: 150,
    image: '/images/service-bridal.jpg',
  },
  {
    id: 'svc-natural-look',
    name: 'Natural Day Look',
    category: 'Makeup',
    description:
      'Barely-there makeup that evens tone and enhances your features for everyday wear.',
    price: 95000,
    duration: 60,
    image: '/images/service-natural-look.jpg',
  },
  {
    id: 'svc-radiance-facial',
    name: 'Radiance Facial',
    category: 'Skincare',
    description:
      'A deep-cleanse and brightening facial designed to restore glow, soften texture and rebalance skin.',
    price: 130000,
    duration: 75,
    image: '/images/service-radiance-facial.jpg',
  },
  {
    id: 'svc-hydra-glow',
    name: 'Hydra Glow Treatment',
    category: 'Skincare',
    description:
      'Intensive hydration with a calming facial massage for tired, dehydrated or dull skin.',
    price: 160000,
    duration: 90,
    image: '/images/service-hydra-glow.jpg',
  },
  {
    id: 'svc-calm-clear',
    name: 'Calm & Clear Facial',
    category: 'Skincare',
    description:
      'A gentle clarifying treatment for congested or sensitive skin, with no harsh downtime.',
    price: 110000,
    duration: 60,
    image: '/images/service-calm-clear.jpg',
  },
];

const SEED_WEEKLY = [
  { day: 0, open: false, start: '10:00', end: '16:00' },
  { day: 1, open: true, start: '09:00', end: '19:00' },
  { day: 2, open: true, start: '09:00', end: '19:00' },
  { day: 3, open: true, start: '09:00', end: '19:00' },
  { day: 4, open: true, start: '09:00', end: '19:00' },
  { day: 5, open: true, start: '09:00', end: '20:00' },
  { day: 6, open: true, start: '09:00', end: '18:00' },
];

const SEED_PEOPLE = [
  { name: 'Amina Nakato', phone: '0772123456' },
  { name: 'Brenda Achieng', phone: '0758901234' },
  { name: 'Grace Namusoke', phone: '0705334455' },
  { name: 'Patricia Atim', phone: '0782411223' },
  { name: 'Sharon Kirabo', phone: '0777001122' },
  { name: 'Joan Namuli', phone: '0752003344' },
  { name: 'Esther Auma', phone: '0709112233' },
];

const SEED_BOOKINGS = [
  { offset: 0, time: '10:30', person: 0, service: 'svc-silk-press', status: 'confirmed', bookedDaysAgo: 2 },
  { offset: 0, time: '15:00', person: 1, service: 'svc-pedicure', status: 'confirmed', bookedDaysAgo: 1 },
  { offset: 1, time: '12:00', person: 2, service: 'svc-bridal', status: 'confirmed', bookedDaysAgo: 4 },
  { offset: 1, time: '16:30', person: 3, service: 'svc-soft-glam', status: 'confirmed', bookedDaysAgo: 1 },
  { offset: 2, time: '09:00', person: 4, service: 'svc-texture', status: 'confirmed', bookedDaysAgo: 3 },
  { offset: 3, time: '13:30', person: 6, service: 'svc-radiance-facial', status: 'confirmed', bookedDaysAgo: 2 },
  { offset: 5, time: '10:30', person: 5, service: 'svc-almond-set', status: 'confirmed', bookedDaysAgo: 1 },
  { offset: -1, time: '09:00', person: 4, service: 'svc-gel-manicure', status: 'completed', bookedDaysAgo: 6 },
  { offset: -1, time: '15:00', person: 5, service: 'svc-soft-glam', status: 'cancelled', bookedDaysAgo: 5 },
  { offset: -2, time: '10:30', person: 3, service: 'svc-radiance-facial', status: 'completed', bookedDaysAgo: 9 },
  { offset: -3, time: '13:30', person: 6, service: 'svc-silk-press', status: 'completed', bookedDaysAgo: 11 },
];

const REF_CHOICES = [
  '7K2M9Q',
  '4R8T1W',
  '9P3L6Z',
  '2H5N8C',
  '6B1V4X',
  '3D7J5A',
  '8S2G9E',
  '5M4K1T',
  '1W8R3Y',
  '7C6P2L',
  '4N9B7H',
];

function isoAtDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Collect open dates walking forwards (or backwards) from today. */
function collectOpenDates(weekly, count, direction = 1) {
  const dates = [];
  let cursor = todayISO();
  let guard = 0;
  while (dates.length < count && guard < 200) {
    const day = weekly.find((slot) => slot.day === dayOfWeek(cursor));
    if (day?.open) dates.push(cursor);
    cursor = addDaysISO(cursor, direction);
    guard += 1;
  }
  return dates;
}

export function createSeedData() {
  const services = SEED_SERVICES.map((service, index) => ({
    ...service,
    active: true,
    createdAt: isoAtDaysAgo(30 - index),
  }));

  const weekly = SEED_WEEKLY.map((entry) => ({ ...entry }));

  const slots = [];
  const seenSlots = new Set();
  for (let offset = 0; offset <= 41; offset += 1) {
    const date = addDaysISO(todayISO(), offset);
    const day = weekly.find((slot) => slot.day === dayOfWeek(date));
    if (!day?.open) continue;
    for (const time of STANDARD_SLOT_TIMES) {
      if (time < day.start || time >= day.end) continue;
      if (isPastSlot(date, time)) continue;
      const key = `${date}-${time}`;
      if (seenSlots.has(key)) continue;
      seenSlots.add(key);
      slots.push({ id: `slot-${key}`, date, time });
    }
  }

  const futureDates = collectOpenDates(weekly, 8, 1);
  const pastDates = collectOpenDates(weekly, 5, -1);

  const bookings = [];
  const usedSlots = new Set();
  const usedRefs = new Set();
  const customerByPhone = new Map();
  const serviceById = new Map(services.map((service) => [service.id, service]));

  SEED_BOOKINGS.forEach((seed, index) => {
    const person = SEED_PEOPLE[seed.person];
    const service = serviceById.get(seed.service);
    if (!person || !service) return;

    const date =
      seed.offset < 0 ? pastDates[Math.abs(seed.offset) - 1] : futureDates[seed.offset];
    if (!date) return;

    const key = `${date}-${seed.time}`;
    if (usedSlots.has(key)) return;
    usedSlots.add(key);
    if (!seenSlots.has(key)) {
      seenSlots.add(key);
      slots.push({ id: `slot-${key}`, date, time: seed.time });
    }

    const reference = REF_CHOICES[index % REF_CHOICES.length];
    if (usedRefs.has(reference)) return;
    usedRefs.add(reference);

    const customer = customerByPhone.get(person.phone) || null;
    if (!customer) {
      const record = {
        id: `cus-${person.phone}`,
        name: person.name,
        phone: person.phone,
        createdAt: isoAtDaysAgo(40 - index),
        updatedAt: isoAtDaysAgo(seed.bookedDaysAgo),
      };
      customerByPhone.set(person.phone, record);
      bookings.push({
        id: `bk-seed-${index + 1}`,
        reference,
        customerId: record.id,
        customerName: person.name,
        customerPhone: person.phone,
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        serviceImage: service.image,
        price: service.price,
        duration: service.duration,
        date,
        time: seed.time,
        status: seed.status,
        createdAt: isoAtDaysAgo(seed.bookedDaysAgo),
        updatedAt: isoAtDaysAgo(seed.bookedDaysAgo),
      });
    }
  });

  return {
    version: 1,
    settings: {
      salonName: 'Serene Beauty Studio',
      tagline: 'Beauty, made personal.',
      description:
        'A calm, considered beauty studio in the heart of Kampala — hair, nails, makeup and skin, all under one roof.',
      phone: '+256 700 000 000',
      whatsapp: '256700000000',
      email: 'hello@serenebeauty.example',
      address: 'Plot 12, Acacia Avenue, Kololo, Kampala',
      instagram: '@serenebeautystudio',
      currency: 'UGX',
      demoNote:
        'Serene Beauty Studio is a demo salon. All contact details are placeholders for this demonstration.',
    },
    services,
    availability: {
      weekly,
      closedDates: [],
    },
    slots,
    customers: [],
    bookings,
  };
}
