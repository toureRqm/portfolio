import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Linkedin, Github, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { postContact } from '../hooks/useApi';
import type { Profile, ContactFormData } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ContactProps {
  profile: Profile | null;
}

const INITIAL_FORM: ContactFormData = {
  sender_name: '',
  sender_email: '',
  message: '',
};

export default function Contact({ profile }: ContactProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const { t } = useTranslation();

  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      await postContact(form);
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setStatus('error');
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response
      ) {
        const responseData = (err.response as { data?: { error?: string } }).data;
        setErrorMsg(responseData?.error ?? t('contact.error'));
      } else {
        setErrorMsg(t('contact.error'));
      }
    }
  };

  const socials = [
    {
      label: 'LinkedIn',
      href: profile?.linkedin_url ?? 'https://www.linkedin.com/in/abdou-rahmane-toure-986358216/',
      icon: Linkedin,
    },
    {
      label: 'GitHub',
      href: profile?.github_url ?? 'https://github.com/abdourahmane',
      icon: Github,
    },
    {
      label: 'Email',
      href: `mailto:${profile?.email ?? 'abdourahmane.toure674@gmail.com'}`,
      icon: Mail,
    },
  ];

  return (
    <section id="contact" ref={sectionRef} className="py-24 md:py-32 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(201,169,110,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="w-full px-[10%] relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="section-label justify-center mb-4">{t('contact.section_label')}</p>
          <h2 className="section-title mb-4">
            Let's <span className="text-gold italic">Work Together</span>
          </h2>
          <p className="font-grotesk text-text-secondary mx-auto" style={{ fontSize: 'clamp(0.9rem, 1.1vw, 1.15rem)', maxWidth: '52ch' }}>
            {t('contact.tagline')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="sender_name" className="block font-grotesk text-sm text-text-secondary mb-1.5">
                  Name
                </label>
                <input
                  id="sender_name"
                  name="sender_name"
                  type="text"
                  required
                  value={form.sender_name}
                  onChange={handleChange}
                  placeholder={t('contact.name_placeholder')}
                  className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 font-grotesk text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-gold transition-colors duration-300"
                />
              </div>

              <div>
                <label htmlFor="sender_email" className="block font-grotesk text-sm text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  id="sender_email"
                  name="sender_email"
                  type="email"
                  required
                  value={form.sender_email}
                  onChange={handleChange}
                  placeholder={t('contact.email_placeholder')}
                  className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 font-grotesk text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-gold transition-colors duration-300"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-grotesk text-sm text-text-secondary mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('contact.message_placeholder')}
                  className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 font-grotesk text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-gold transition-colors duration-300 resize-none"
                />
              </div>

              {/* Feedback */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-grotesk"
                >
                  <CheckCircle size={16} />
                  {t('contact.success')}
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-grotesk"
                >
                  <AlertCircle size={16} />
                  {errorMsg}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {t('contact.submit')}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info & socials */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-syne font-bold text-text-primary mb-3" style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.8rem)' }}>
                Let's connect
              </h3>
              <p className="font-grotesk text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(0.85rem, 1vw, 1.1rem)' }}>
                Whether you have a project in mind, a job opportunity, or just want to say hi —
                my inbox is always open. I'll try to get back to you within 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.label !== 'Email' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-card hover:border-gold hover:shadow-[0_0_20px_rgba(201,169,110,0.08)] transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:border-gold group-hover:text-gold text-text-secondary transition-all duration-300">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-grotesk font-medium text-sm text-text-primary group-hover:text-gold transition-colors duration-300">
                        {social.label}
                      </p>
                      <p className="font-grotesk text-xs text-text-secondary">
                        {social.label === 'Email'
                          ? profile?.email ?? 'abdourahmane.toure674@gmail.com'
                          : social.label === 'LinkedIn'
                          ? 'linkedin.com/in/abdou-rahmane'
                          : 'github.com/abdourahmane'}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
