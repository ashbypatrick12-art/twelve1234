import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { addService, updateService, removeService } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatUGX, formatDuration } from '../../lib/format';
import { formatDateLong } from '../../lib/format';

const CATEGORIES = ['Hair', 'Nails', 'Makeup', 'Skincare'];
const PRESETS = ['/images/service-silk-press.jpg', '/images/service-gel-manicure.jpg', '/images/service-pedicure.jpg', '/images/service-bridal.jpg'];

export function ServicesPage({ data }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState('all');
  const [confirming, setConfirming] = useState(null);

  const services = (data.services || []).filter((s) => active === 'all' || (active === 'active' && s.active) || (active === 'inactive' && !s.active) || s.category === active);
  const activeCount = services.filter((s) => s.active).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-2xl">Services</h3>
          <p className="text-sm text-muted mt-1">Add, edit and disable the menu. Historical bookings keep their original details.</p>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          Add service
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['all', 'active'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActive(filter)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition ${active === filter ? 'bg-charcoal text-white' : 'bg-ivory text-muted border border-line hover:bg-white'}`}
          >
            {filter === 'all' ? 'All' : filter === 'active' ? 'Active' : 'Inactive'}
            <span className="ml-1.5 text-xs opacity-70">({filter === 'all' ? services.length : active === 'active' ? activeCount : services.length - activeCount})</span>
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted">No services yet. Add the first one.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-base">{service.name}</h4>
                  <button
                    onClick={() => { setEditing(service); setFormValues(service); setOpen(true); }}
                    className="p-1.5 rounded-xl text-muted hover:text-charcoal hover:bg-ivory transition"
                    aria-label={`Edit ${service.name}`}
                  >
                    <Pencil className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-muted mt-1">{service.category} · {formatDuration(service.duration)}</p>
                <p className="text-sm text-muted mt-2 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-semibold text-charcoal">{formatUGX(service.price)}</span>
                  <label className="text-xs text-sage cursor-pointer">
                    {service.active ? 'Enabled' : 'Disabled'}
                    <input
                      type="checkbox"
                      defaultChecked={service.active}
                      onChange={(event) => updateService(data, service.id, { active: event.target.checked })}
                      className="rounded border-line text-sage focus:ring-sage"
                    />
                  </label>
                </div>
                <button
                  onClick={() => setConfirming(service)}
                  className="mt-4 text-xs font-semibold text-amber-700 hover:text-amber-800 transition"
                >
                  Delete service
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit service' : 'Add a service'}
        description="The public booking system will update with these details."
        size="lg"
        actions={
          <>
            <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Cancel</button>
          </>
        }
      >
        <ServiceForm key={editing?.id || 'new'} init={editing} data={data} onSaved={() => { setOpen(false); setEditing(null); }} onCancel={() => setOpen(false)} />
      </Modal>

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="Delete this service?"
        description="Services stay in the menu but their public booking options are removed. Historical bookings keep everything about this service."
        size="sm"
        actions={
          <>
            <button onClick={() => setConfirming(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Cancel</button>
            <button onClick={() => { removeService(data, confirming.id); setConfirming(null); }} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500 transition">Delete</button>
          </>
        }
      >
        <p className="text-sm text-muted">Delete <span className="font-medium text-charcoal">{confirming?.name}</span>?</p>
      </Modal>
    </div>
  );
}

function ServiceForm({ init, data, onSaved, onCancel }) {
  const [name, setName] = useState(init?.name || '');
  const [category, setCategory] = useState(init?.category || 'Hair');
  const [description, setDescription] = useState(init?.description || '');
  const [price, setPrice] = useState(init?.price || '');
  const [duration, setDuration] = useState(init?.duration || '');
  const [image, setImage] = useState(init?.image || '/images/service-silk-press.jpg');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    const has = {};
    if (!name.trim()) { next.name = ''; has.name = true; }
    if (!category) has.category = true;
    if (!description.trim()) has.description = true;
    if (!Number.isFinite(Number(price)) || Number(price) <= 0) has.price = true;
    if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) has.duration = true;
    setErrors(has);
    if (Object.keys(has).length > 0) return;
    const payload = { name: name.trim(), category, description: description.trim(), price: Number(price), duration: Number(duration), image, active: init?.active !== false };
    const result = init ? updateService(data, init.id, payload) : addService(data, payload);
    if (!result.ok) {
      setSubmitError(result.error || 'Could not save this service. Please check the details.');
      return;
    }
    setSubmitError('');
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Service name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full rounded-2xl border ${errors.name ? 'border-amber-500' : 'border-line'} bg-white px-4 py-3 text-sm`} placeholder="Signature Silk Press" />
        </div>
        <div>
          <label className="label">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={`w-full rounded-2xl border ${errors.description ? 'border-amber-500' : 'border-line'} bg-white px-4 py-3 text-sm`} placeholder="A short, inviting description of the service." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price (UGX)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full rounded-2xl border ${errors.price ? 'border-amber-500' : 'border-line'} bg-white px-4 py-3 text-sm`} placeholder="120000" />
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className={`w-full rounded-2xl border ${errors.duration ? 'border-amber-500' : 'border-line'} bg-white px-4 py-3 text-sm`} placeholder="90" />
        </div>
      </div>
      <div>
        <label className="label">Image URL</label>
        <div className="flex gap-2">
          <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm" placeholder="Public image URL" />
          <div className="flex gap-1.5">
            {PRESETS.map((preset) => (
              <button type="button" key={preset} onClick={() => setImage(preset)} className={`w-8 h-8 rounded-full bg-no-repeat bg-center border ${image === preset ? 'border-sage' : 'border-line'}`} style={{ backgroundImage: `url(${preset})` }} title={preset} />
            ))}
          </div>
        </div>
      </div>
      {errors.name && <p className="text-xs text-amber-700">Please enter a service name.</p>}
      {errors.category && <p className="text-xs text-amber-700">Please choose a category.</p>}
      {errors.description && <p className="text-xs text-amber-700">Please write a description.</p>}
      {errors.price && <p className="text-xs text-amber-700">Enter a valid price.</p>}
      {errors.duration && <p className="text-xs text-amber-700">Enter the duration in minutes.</p>}
      {submitError && <p role="alert" className="text-xs text-amber-700">{submitError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Cancel</button>
        <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-charcoal text-white hover:bg-charcoal/90 transition">Save</button>
      </div>
    </form>
  );
}
