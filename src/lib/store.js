import { useSyncExternalStore } from 'react';
import { createSeedData } from './seed';
import { addDaysISO, dayOfWeek, isPastSlot, todayISO, timeToMinutes } from './dates';
import { formatPhone, isValidUgandanPhone, normalizePhone } from './format';

export const STORAGE_KEY = 'gency-bookings:v1';
export const ADMIN_SESSION_KEY = 'gency-bookings:admin:auth';

function createStore(storage) {
  const storageBackend = storage || (typeof localStorage !== 'undefined' ? localStorage : null);

  let state = loadState();
  const listeners = new Set();

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue);
        if (
          incoming &&
          typeof incoming.version === 'number' &&
          Array.isArray(incoming.services) &&
          Array.isArray(incoming.bookings) &&
          Array.isArray(incoming.slots) &&
          Array.isArray(incoming.customers) &&
          incoming.availability &&
          Array.isArray(incoming.availability.weekly) &&
          Array.isArray(incoming.availability.closedDates)
        ) {
          state = incoming;
          emit();
        }
      } catch (error) {
        console.error('Gency Bookings: failed to sync another tab', error);
      }
    });
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot() {
    return state;
  }

  function persist(next = state) {
    state = next;
    if (storageBackend) {
      try {
        storageBackend.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Gency Bookings: could not persist data', error);
      }
    }
    emit();
  }

  function loadState() {
    if (!storageBackend) return createSeedData();
    try {
      const raw = storageBackend.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.version === 'number' &&
          Array.isArray(parsed.services) &&
          Array.isArray(parsed.bookings) &&
          Array.isArray(parsed.slots) &&
          Array.isArray(parsed.customers) &&
          parsed.availability &&
          Array.isArray(parsed.availability.weekly) &&
          Array.isArray(parsed.availability.closedDates)
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Gency Bookings: failed to read stored data', error);
    }
    return createSeedData();
  }

  // --- Simple read helpers ---

  function isDateOpen(data, date) {
    const day = data?.availability?.weekly?.find((w) => w.day === dayOfWeek(date));
    if (!day?.open) return false;
    return !data.availability.closedDates.includes(date);
  }

  function getDayHours(data, date) {
    const day = data?.availability?.weekly?.find((w) => w.day === dayOfWeek(date));
    return day ? { open: day.open, start: day.start, end: day.end } : null;
  }

  function getSlotsForDate(data, date) {
    return data?.slots?.filter((slot) => slot.date === date).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)) || [];
  }

  function getBookedTimes(data, date) {
    const taken = new Set();
    for (const booking of data?.bookings || []) {
      if (booking.date === date && booking.status !== 'cancelled') {
        taken.add(booking.time);
      }
    }
    return taken;
  }

  function getAvailableSlots(data, date, { includePast = false } = {}) {
    const slots = getSlotsForDate(data, date);
    if (slots.length === 0) return [];
    return slots.filter((slot) => {
      if (!includePast && isPastSlot(date, slot.time)) return false;
      return !getBookedTimes(data, date).has(slot.time);
    });
  }

  function dateHasAvailability(data, date) {
    return isDateOpen(data, date) && getAvailableSlots(data, date).length > 0;
  }

  function isSlotBooked(data, date, time) {
    return getBookedTimes(data, date).has(time);
  }

  function getOpenTimeRange(data, date) {
    const day = data?.availability?.weekly?.find((w) => w.day === dayOfWeek(date));
    if (!day?.open) return null;
    return { start: day.start, end: day.end };
  }

  function nextOpenDate(data, iso) {
    let cursor = addDaysISO(iso || todayISO(), 1);
    for (let i = 0; i < 90; i += 1) {
      if (dateHasAvailability(data, cursor)) return cursor;
      cursor = addDaysISO(cursor, 1);
    }
    return null;
  }

  // --- Customers ---

  function getCustomer(data, phone) {
    const normalized = normalizePhone(phone);
    return (data?.customers || []).find(
      (customer) => normalizePhone(customer.phone) === normalized,
    );
  }

  function upsertCustomer(data, customer) {
    const existingIndex = (data?.customers || []).findIndex(
      (item) => normalizePhone(item.phone) === normalizePhone(customer.phone),
    );
    const nextCustomers = [...(data?.customers || [])];
    if (existingIndex >= 0) {
      nextCustomers[existingIndex] = {
        ...nextCustomers[existingIndex],
        ...customer,
        phone: customer.phone,
        updatedAt: new Date().toISOString(),
      };
    } else {
      nextCustomers.push({
        ...customer,
        id: customer.id || `cus-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        updatedAt: new Date().toISOString(),
      });
    }
    persist({ ...data, customers: nextCustomers });
    return nextCustomers;
  }

  // --- Services ---

  function getActiveServices(data) {
    return (data?.services || []).filter((service) => service.active).sort((a, b) => a.name.localeCompare(b.name));
  }

  function getServicesByCategory(data, category) {
    return (data?.services || [])
      .filter((service) => service.category === category && service.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function addService(data, input) {
    const name = String(input?.name || '').trim();
    const category = String(input?.category || '').trim();
    const description = String(input?.description || '').trim();

    if (!name) return { ok: false, field: 'name', error: 'Please give the service a name.' };
    if (!category) return { ok: false, field: 'category', error: 'Please choose a category.' };
    if (!description) return { ok: false, field: 'description', error: 'Please write a short description.' };
    if (typeof input.price !== 'number' || input.price <= 0)
      return { ok: false, field: 'price', error: 'Enter a valid price in UGX.' };
    if (!Number.isInteger(input.duration) || input.duration <= 0)
      return { ok: false, field: 'duration', error: 'Enter the service duration in minutes.' };

    const services = [...(data?.services || [])];
    const id = `svc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const service = {
      id,
      name,
      category,
      description,
      price: input.price,
      duration: input.duration,
      image: input.image || '/images/service-silk-press.jpg',
      active: input.active !== false,
      createdAt: new Date().toISOString(),
    };
    services.push(service);
    persist({ ...data, services });
    return { ok: true, service };
  }

  function updateService(data, id, patch) {
    const nextServices = (data?.services || []).map((service) => (
      service.id === id ? { ...service, ...patch, id } : service
    ));
    persist({ ...data, services: nextServices });
    return { ok: true, services: nextServices };
  }

  function removeService(data, id) {
    const service = (data?.services || []).find((item) => item.id === id);
    if (!service) return { ok: false, error: 'Service not found.' };
    const nextServices = (data?.services || []).filter((item) => item.id !== id);
    persist({ ...data, services: nextServices });
    return { ok: true, serviceId: service.id, serviceName: service.name };
  }

  // --- Bookings ---

  const VALID_REFERENCE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function generateReference(bookings) {
    const ids = (bookings || []).map((booking) => booking.reference).filter(Boolean);
    for (let attempt = 0; attempt < 60; attempt += 1) {
      let reference = 'GB-';
      for (let i = 0; i < 6; i += 1) {
        reference += VALID_REFERENCE_CHARS.charAt(Math.floor(Math.random() * VALID_REFERENCE_CHARS.length));
      }
      if (!ids.includes(reference)) return reference;
    }
    return `GB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  }

  function createBooking(data, input) {
    const name = String(input?.name || '').trim();
    const rawPhone = String(input?.phone || '').trim();
    const date = String(input?.date || '').trim();
    const time = String(input?.time || '').trim();

    if (!name) return { ok: false, field: 'name', error: 'Please enter your full name.' };
    if (name.length < 2) return { ok: false, field: 'name', error: 'That name is too short.' };
    if (!isValidUgandanPhone(input?.phone))
      return { ok: false, field: 'phone', error: 'Please use 07XXXXXXXX or +256XXXXXXXXX.' };

    const service = (data?.services || []).find((item) => item.id === input.serviceId && item.active);
    if (!service) return { ok: false, field: 'service', error: 'The service you chose is no longer available.' };

    if (!date || !time) return { ok: false, field: 'slot', error: 'Please choose a date and time.' };

    if (isPastSlot(date, time)) {
      return { ok: false, field: 'slot', error: 'That time has already passed. Please choose another.' };
    }

    const dayHours = getDayHours(data, date);
    if (!dayHours?.open) return { ok: false, field: 'slot', error: 'The studio is closed on that day.' };
    if (time < dayHours.start || time >= dayHours.end) return { ok: false, field: 'slot', error: 'That time is outside the studio hours.' };

    const slotKey = `${date}-${time}`;
    if (!data?.slots.some((slot) => slot.date === date && slot.time === time)) {
      return { ok: false, field: 'slot', error: 'That time slot has not been configured yet.' };
    }
    if (isSlotBooked(data, date, time)) {
      return { ok: false, field: 'slot', error: 'Sorry — this slot was just booked. Pick another time.' };
    }

    const normalizedPhone = normalizePhone(rawPhone);
    const existingCustomer = getCustomer(data, rawPhone);

    const booking = {
      id: `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      reference: generateReference(data?.bookings || []),
      customerId: existingCustomer?.id || `cus-${normalizedPhone}`,
      customerName: name,
      customerPhone: normalizedPhone,
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
      serviceImage: service.image,
      price: service.price,
      duration: service.duration,
      date,
      time,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const customer = existingCustomer
      ? { ...existingCustomer, name, phone: normalizedPhone, updatedAt: booking.createdAt }
      : {
          id: `cus-${normalizedPhone}`,
          name,
          phone: normalizedPhone,
          createdAt: booking.createdAt,
          updatedAt: booking.createdAt,
        };

    const nextBookings = [booking, ...(data?.bookings || [])].sort(
      (a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt) ||
        a.date.localeCompare(b.date) ||
        a.time.localeCompare(b.time),
    );
    const nextCustomers = getCustomer(data, rawPhone)
      ? upsertCustomer(data, customer)
      : [...(data?.customers || []), customer];

    const next = {
      ...data,
      bookings: nextBookings,
      customers: nextCustomers,
      slots: [
        ...data.slots?.filter((slot) => !(slot.date === date && slot.time === time)) || [],
        { id: `slot-${date}-${time}`, date, time },
      ],
    };
    persist(next);
    return { ok: true, booking, customers: nextCustomers };
  }

  function cancelBooking(data, id) {
    const booking = (data?.bookings || []).find((item) => item.id === id);
    if (!booking) return { ok: false, error: 'Booking not found.' };
    if (booking.status !== 'confirmed') return { ok: false, error: 'This booking cannot be cancelled in its current state.' };
    const nextBookings = (data?.bookings || []).map((item) =>
      item.id === id ? { ...item, status: 'cancelled', updatedAt: new Date().toISOString() } : item,
    );
    const next = { ...data, bookings: nextBookings };
    persist(next);
    return { ok: true, booking: { id, status: 'cancelled', updatedAt: new Date().toISOString() } };
  }

  function completeBooking(data, id) {
    const booking = (data?.bookings || []).find((item) => item.id === id);
    if (!booking) return { ok: false, error: 'Booking not found.' };
    if (booking.status !== 'confirmed') return { ok: false, error: 'This booking is already recorded as completed.' };
    const nextBookings = (data?.bookings || []).map((item) =>
      item.id === id ? { ...item, status: 'completed', updatedAt: new Date().toISOString() } : item,
    );
    const next = { ...data, bookings: nextBookings };
    persist(next);
    return { ok: true, booking: { id, status: 'completed', updatedAt: new Date().toISOString() } };
  }

  // --- Availability ---

  function getOpenDays(data) {
    return data?.availability?.weekly?.filter((w) => w.open) || [];
  }

  function addClosedDate(data, date) {
    if (!date || data.availability.closedDates.includes(date)) return data;
    const next = { ...data, availability: { ...data.availability, closedDates: [...data.availability.closedDates, date] } };
    persist(next);
    return next;
  }

  function removeClosedDate(data, date) {
    if (!date) return data;
    const next = {
      ...data,
      availability: { ...data.availability, closedDates: data.availability.closedDates.filter((d) => d !== date) },
    };
    persist(next);
    return next;
  }

  function updateWeeklyDay(data, day, patch) {
    const weekly = data?.availability?.weekly?.map((w) => (w.day === day ? { ...w, ...patch, id: w.day } : w)) || [];
    const next = { ...data, availability: { ...data.availability, weekly } };
    persist(next);
    return next;
  }

  function addSlot(data, date, time) {
    if (!date || !time) return { ok: false, error: 'Choose a date and time first.' };
    if (isPastSlot(date, time)) return { ok: false, error: 'Choose a future date and time.' };
    if (data.availability.closedDates.includes(date)) {
      return { ok: false, error: 'This date is marked as closed. Remove it from Closed dates first.' };
    }
    const day = data.availability.weekly.find((w) => w.day === dayOfWeek(date));
    if (!day?.open) return { ok: false, error: 'Add this slot on a day the studio is open.' };
    if (time < day.start || time >= day.end) {
      return { ok: false, error: `Choose a time between ${day.start} and ${day.end}.` };
    }
    if (data.slots.some((s) => s.date === date && s.time === time)) {
      return { ok: false, error: 'A slot at that time already exists.' };
    }
    const next = { ...data, slots: [...data.slots, { id: `slot-${date}-${time}`, date, time }] };
    persist(next);
    return { ok: true };
  }

  function removeSlot(data, id) {
    const slot = data.slots?.find((s) => s.id === id);
    if (!slot) return { ok: false, error: 'Slot not found.' };
    const activeBookings = (data.bookings || []).filter((b) => b.date === slot.date && b.time === slot.time && b.status !== 'cancelled');
    if (activeBookings.length > 0) {
      return { ok: false, error: 'This slot is still booked. Remove the booking first.' };
    }
    const next = { ...data, slots: data.slots.filter((s) => s.id !== id) };
    persist(next);
    return { ok: true };
  }

  // --- Admin auth ---

  function isAdminAuthed() {
    if (typeof sessionStorage === 'undefined') return false;
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function loginAdmin() {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch (error) {
        console.error('Gency Bookings: could not open admin session', error);
      }
    }
    persist();
  }

  function logoutAdmin() {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      } catch (error) {
        console.error('Gency Bookings: could not close admin session', error);
      }
    }
  }

  return {
    state, subscribe, persist, getSnapshot, loadState,
    isDateOpen, getDayHours, getSlotsForDate, getBookedTimes, getAvailableSlots, dateHasAvailability, isSlotBooked, getOpenTimeRange, nextOpenDate,
    getCustomer, upsertCustomer, getActiveServices, getServicesByCategory, addService, updateService, removeService,
    createBooking, cancelBooking, completeBooking,
    getOpenDays, addClosedDate, removeClosedDate, updateWeeklyDay, addSlot, removeSlot,
    isAdminAuthed, loginAdmin, logoutAdmin,
  };
}

// Singleton for the browser app
let appStore = null;

export function useStore() {
  if (!appStore) {
    appStore = createStore();
  }
  return useSyncExternalStore(appStore.subscribe, appStore.getSnapshot, appStore.getSnapshot);
}

// Exports for tests and module use
export function createTestStore() {
  return createStore();
}

function getAppStore() {
  if (!appStore) appStore = createStore();
  return appStore;
}

export const isDateOpen = (...args) => getAppStore().isDateOpen(...args);
export const getDayHours = (...args) => getAppStore().getDayHours(...args);
export const getSlotsForDate = (...args) => getAppStore().getSlotsForDate(...args);
export const getBookedTimes = (...args) => getAppStore().getBookedTimes(...args);
export const getAvailableSlots = (...args) => getAppStore().getAvailableSlots(...args);
export const dateHasAvailability = (...args) => getAppStore().dateHasAvailability(...args);
export const isSlotBooked = (...args) => getAppStore().isSlotBooked(...args);
export const getOpenTimeRange = (...args) => getAppStore().getOpenTimeRange(...args);
export const nextOpenDate = (...args) => getAppStore().nextOpenDate(...args);
export const getCustomer = (...args) => getAppStore().getCustomer(...args);
export const upsertCustomer = (...args) => getAppStore().upsertCustomer(...args);
export const getActiveServices = (...args) => getAppStore().getActiveServices(...args);
export const getServicesByCategory = (...args) => getAppStore().getServicesByCategory(...args);
export const addService = (...args) => getAppStore().addService(...args);
export const updateService = (...args) => getAppStore().updateService(...args);
export const removeService = (...args) => getAppStore().removeService(...args);
export const createBooking = (...args) => getAppStore().createBooking(...args);
export const cancelBooking = (...args) => getAppStore().cancelBooking(...args);
export const completeBooking = (...args) => getAppStore().completeBooking(...args);
export const getOpenDays = (...args) => getAppStore().getOpenDays(...args);
export const addClosedDate = (...args) => getAppStore().addClosedDate(...args);
export const removeClosedDate = (...args) => getAppStore().removeClosedDate(...args);
export const updateWeeklyDay = (...args) => getAppStore().updateWeeklyDay(...args);
export const addSlot = (...args) => getAppStore().addSlot(...args);
export const removeSlot = (...args) => getAppStore().removeSlot(...args);
export const isAdminAuthed = (...args) => getAppStore().isAdminAuthed(...args);
export const loginAdmin = (...args) => getAppStore().loginAdmin(...args);
export const logoutAdmin = (...args) => getAppStore().logoutAdmin(...args);
