'use client';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import ContactFormCard, { type ContactFormData, type ContactStatus } from './ContactFormCard';

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<ContactStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendToGoogleSheets = async (data: typeof formData) => {
    try {
      // Google Sheets Web App URL (you'll add this later)
      const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || '';
      
      if (GOOGLE_SHEET_URL) {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      console.log('Google Sheets error (non-critical):', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Send email via EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_name: 'Muhammad Faisal Abshar',
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
      );

      // Send to Google Sheets (non-blocking)
      sendToGoogleSheets(formData);

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: unknown) {
      setStatus('error');
      setErrorMessage(error instanceof Error && error.message ? error.message : 'Failed to send message. Please try again.');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Contact Me</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Get In Touch</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-1/2 space-y-8">
            <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Let&apos;s Connect</h3>
            <p className="opacity-70" style={{ color: 'var(--foreground)' }}>Feel free to reach out for collaborations, opportunities, or just to say hi.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20" style={{ backgroundColor: 'var(--card)' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Phone</h4>
                  <p className="opacity-70" style={{ color: 'var(--foreground)' }}>03072173457</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20" style={{ backgroundColor: 'var(--card)' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Email</h4>
                  <p className="opacity-70" style={{ color: 'var(--foreground)' }}>faisalabshar2002@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20" style={{ backgroundColor: 'var(--card)' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Location</h4>
                  <p className="opacity-70" style={{ color: 'var(--foreground)' }}>Karachi, Pakistan</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-primary/20 flex gap-4">
              <a href="https://linkedin.com/in/faisal-abshar-0057b01b1" target="_blank" rel="noreferrer" className="relative w-10 h-10 flex items-center justify-center rounded-full opacity-70 transition-all overflow-hidden group" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                <span className="absolute inset-0 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:text-white transition-colors duration-300"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://github.com/MuhammadFaisal2002" target="_blank" rel="noreferrer" className="relative w-10 h-10 flex items-center justify-center rounded-full opacity-70 transition-all overflow-hidden group" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
                <span className="absolute inset-0 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:text-white transition-colors duration-300"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path></svg>
              </a>
            </div>
          </motion.div>

          <ContactFormCard
            formData={formData}
            status={status}
            errorMessage={errorMessage}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={() => setStatus('idle')}
          />
        </div>
      </div>
    </section>
  );
}
