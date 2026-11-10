import { createBooking } from '../../../lib/store';

export async function POST({ request }) {
  try {
    const input = await request.json();
    const data = useStore();
    const result = createBooking(data, {
      serviceId: input.serviceId,
      date: input.date,
      time: input.time,
      name: input.name,
      phone: input.phone,
    });
    if (!result.ok || !result.booking) {
      return new Response(JSON.stringify({ ok: false, error: result.error || 'Booking failed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true, booking: result.booking }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
