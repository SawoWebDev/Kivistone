import { useState } from 'react';
import Button from '../Button/Button.jsx';
import { countries } from '../../data/countries.js';
import './ContactForm.css';

const EMPTY = { name: '', email: '', country: '', subject: '', message: '' };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please tell us your name.';
  if (!values.email.trim()) errors.email = 'Please add an email so we can reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'That email address looks incomplete.';
  if (!values.message.trim()) errors.message = 'Let us know what you need.';
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus('sending');
    // TODO: point this at the real enquiry endpoint (e.g. POST /api/enquiries).
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus('sent');
    setValues(EMPTY);
  };

  if (status === 'sent') {
    return (
      <div className="form-card form-sent" role="status">
        <div className="sent-ic"><i className="fa-solid fa-check" aria-hidden="true" /></div>
        <h3>Message sent</h3>
        <p>Thanks for reaching out. Our sales team in Cebu will get back to you within two business days.</p>
        <Button variant="gold" onClick={() => setStatus('idle')}>Send another message</Button>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="cf-name">Your name <span className="req">required</span></label>
          <input
            id="cf-name" type="text" autoComplete="name" value={values.name} onChange={update('name')}
            aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined}
          />
          {errors.name && <span className="err" id="cf-name-err">{errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="cf-email">Your email <span className="req">required</span></label>
          <input
            id="cf-email" type="email" autoComplete="email" value={values.email} onChange={update('email')}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined}
          />
          {errors.email && <span className="err" id="cf-email-err">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="cf-country">Country</label>
          <div className="select-wrap">
            <select id="cf-country" value={values.country} onChange={update('country')}>
              <option value="">Select a country</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <i className="fa-solid fa-chevron-down" aria-hidden="true" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="cf-subject">Subject</label>
          <input id="cf-subject" type="text" value={values.subject} onChange={update('subject')} />
        </div>

        <div className="field field-full">
          <label htmlFor="cf-message">Your message <span className="req">required</span></label>
          <textarea
            id="cf-message" rows={6} value={values.message} onChange={update('message')}
            placeholder="Product, quantity, destination port, anything that helps us quote accurately."
            aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined}
          />
          {errors.message && <span className="err" id="cf-message-err">{errors.message}</span>}
        </div>
      </div>

      <div className="form-foot">
        <Button variant="gold" type="submit" icon="fa-solid fa-paper-plane" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
