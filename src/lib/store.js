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

  function persist() {
    if (storageBackend) {
      try {
        storageBackend.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Gency Bookings: could not persist data', error);
      }
    }
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
          Array.isArray(parsed.availability)
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
    persist();
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
    persist();
    return { ok: true, service };
  }

  function updateService(data, id, patch) {
    const nextServices = (data?.services || []).map((service) => {
      if (service.id !== id) return service;
      return { ...service, ...patch, id };
    });
    persist();
    return { ok: true, services: nextServices };
  }

  function removeService(data, id) {
    const service = (data?.services || []).find((item) => item.id === id);
    if (!service) return { ok: false, error: 'Service not found.' };
    persist();
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
    if (!data.availability.weekly.find((w) => w.day === dayOfWeek(date))?.open) {
      return { ok: false, error: 'Add this slot on a day the studio is open.' };
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

export const isDateOpen = createTestStore().isDateOpen;
export const getDayHours = createTestStore().getDayHours;
export const getSlotsForDate = createTestStore().getSlotsForDate;
export const getBookedTimes = createTestStore().getBookedTimes;
export const getAvailableSlots = createTestStore().getAvailableSlots;
export const dateHasAvailability = createTestStore().dateHasAvailability;
export const isSlotBooked = createTestStore().isSlotBooked;
export const getOpenTimeRange = createTestStore().getOpenTimeRange;
export const nextOpenDate = createTestStore().nextOpenDate;
export const getCustomer = createTestStore().getCustomer;
export const upsertCustomer = createTestStore().upsertCustomer;
export const getActiveServices = createTestStore().getActiveServices;
export const getServicesByCategory = createTestStore().getServicesByCategory;
export const addService = createTestStore().addService;
export const updateService = createTestStore().updateService;
export const removeService = createTestStore().removeService;
export const createBooking = createTestStore().createBooking;
export const cancelBooking = createTestStore().cancelBooking;
export const completeBooking = createTestStore().completeBooking;
export const getOpenDays = createTestStore().getOpenDays;
export const addClosedDate = createTestStore().addClosedDate;
export const removeClosedDate = createTestStore().removeClosedDate;
export const updateWeeklyDay = createTestStore().updateWeeklyDay;
export const addSlot = createTestStore().addSlot;
export const removeSlot = createTestStore().removeSlot;
export const isAdminAuthed = createTestStore().isAdminAuthed;
export const loginAdmin = createTestStore().loginAdmin;
export const logoutAdmin = createTestStore().logoutAdmin;
