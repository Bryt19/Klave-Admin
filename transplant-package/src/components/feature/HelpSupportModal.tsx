import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface HelpSupportModalProps {
  onClose: () => void;
}

type FormType = 'bug' | 'support' | 'feature' | null;

export default function HelpSupportModal({ onClose }: HelpSupportModalProps) {
  const { user, pharmacySettings } = useApp();

  const [formType, setFormType] = useState<FormType>(null);
  const [email, setEmail] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [featureSuggestion, setFeatureSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (pharmacySettings?.name || user?.pharmacyName) {
      setPharmacyName(pharmacySettings?.name || user?.pharmacyName || '');
    }
  }, [user, pharmacySettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formType === 'feature') {
      if (!email.trim() || !featureSuggestion.trim()) {
        toast.error('Please fill in both email and your feature suggestion.');
        return;
      }
    } else {
      if (!email.trim() || !pharmacyName.trim() || !subject.trim() || !description.trim()) {
        toast.error('Please fill in all required fields.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/mzdorjer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType === 'feature' ? 'Feature Suggestion' : formType === 'bug' ? 'Bug Report' : 'Support Request',
          userEmail: email,
          pharmacyName: pharmacyName || user?.pharmacyName || 'N/A',
          userName: user?.name || 'N/A',
          subject: formType === 'feature' ? `Feature Request from ${pharmacyName || email}` : subject,
          description: formType === 'feature' ? featureSuggestion : description,
        }),
      });

      if (response.ok) {
        if (formType === 'feature') {
          setSuccessMessage('Thank you for your suggestion. We review all feedback carefully.');
        } else {
          setSuccessMessage('Your report has been received. We will respond within 24 hours.');
        }
        setSubmitted(true);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again or contact support directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-card border border-border-light dark:border-border-dark p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10">
              <i className="ri-customer-service-2-line text-primary-500 text-base"></i>
            </div>
            <h2 className="text-base font-heading font-700 text-gray-900 dark:text-white">Help & Support</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 rounded-full bg-success-50 dark:bg-success-500/10">
              <i className="ri-check-line text-success-500 text-2xl"></i>
            </div>
            <p className="text-base font-heading font-600 text-gray-900 dark:text-white mb-2">
              {formType === 'feature' ? 'Suggestion Received' : 'Report Received'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-4">
              {successMessage}
            </p>
            <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-500/5 border border-primary-500/10 text-left">
              <p className="text-xs font-heading font-600 text-primary-600 dark:text-primary-400 mb-1">Need a faster response?</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-body leading-relaxed">
                Contact us directly at <span className="font-semibold text-gray-800 dark:text-gray-200">info.klavora@gmail.com</span> or call/WhatsApp <span className="font-semibold text-gray-800 dark:text-gray-200">+233 203 604 957</span>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-5 h-btn px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        ) : !formType ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-4">What do you need help with?</p>
            
            <button
              onClick={() => setFormType('feature')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-light dark:border-border-dark hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 flex-shrink-0">
                <i className="ri-lightbulb-line text-amber-500 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-body font-medium text-gray-900 dark:text-white">Suggest a Feature</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-body">Share ideas for new tools or improvements</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 ml-auto"></i>
            </button>

            <button
              onClick={() => setFormType('bug')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-light dark:border-border-dark hover:border-danger-500/50 hover:bg-danger-50 dark:hover:bg-danger-500/5 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-danger-50 dark:bg-danger-500/10 flex-shrink-0">
                <i className="ri-bug-line text-danger-500 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-body font-medium text-gray-900 dark:text-white">Report a Bug</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-body">Something isn't working as expected</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 ml-auto"></i>
            </button>

            <button
              onClick={() => setFormType('support')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-light dark:border-border-dark hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-500/5 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10 flex-shrink-0">
                <i className="ri-question-answer-line text-primary-500 text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-sm font-body font-medium text-gray-900 dark:text-white">Request Support</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 font-body">Get help from the Klavora team</p>
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 ml-auto"></i>
            </button>

            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-border-light dark:border-border-dark">
              <p className="text-xs font-heading font-600 text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <i className="ri-customer-service-2-line text-primary-500"></i>
                Direct Contact Information
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-body leading-relaxed">
                For immediate enquiries and faster responses, you can reach us at:
              </p>
              <div className="mt-2 space-y-1">
                <a href="mailto:info.klavora@gmail.com" className="text-[11px] text-primary-500 hover:underline block font-mono">info.klavora@gmail.com</a>
                <a href="tel:+233203604957" className="text-[11px] text-primary-500 hover:underline block font-mono">+233 203 604 957</a>
              </div>
            </div>
          </div>
        ) : formType === 'feature' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setFormType(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors mb-1"
            >
              <i className="ri-arrow-left-line text-sm"></i>
              <span className="font-body">Back</span>
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <i className="ri-lightbulb-line text-amber-500 text-sm"></i>
              </div>
              <h3 className="text-sm font-heading font-600 text-gray-900 dark:text-white">
                Suggest a Feature
              </h3>
            </div>

            <div>
              <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                Email Address <span className="text-danger-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                Feature Suggestion <span className="text-danger-500">*</span>
              </label>
              <textarea
                value={featureSuggestion}
                onChange={e => { if (e.target.value.length <= 1000) setFeatureSuggestion(e.target.value); }}
                rows={5}
                maxLength={1000}
                placeholder="Describe the feature you would like to see in Klavora..."
                required
                className="w-full px-3 py-2 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono mt-1 text-right">{featureSuggestion.length}/1000</p>
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim() || !featureSuggestion.trim()}
              className="w-full h-btn bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
            >
              {submitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setFormType(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors mb-1"
            >
              <i className="ri-arrow-left-line text-sm"></i>
              <span className="font-body">Back</span>
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${formType === 'bug' ? 'bg-danger-50 dark:bg-danger-500/10' : 'bg-primary-50 dark:bg-primary-500/10'}`}>
                <i className={`${formType === 'bug' ? 'ri-bug-line text-danger-500' : 'ri-question-answer-line text-primary-500'} text-sm`}></i>
              </div>
              <h3 className="text-sm font-heading font-600 text-gray-900 dark:text-white">
                {formType === 'bug' ? 'Report a Bug' : 'Request Support'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                  Email Address <span className="text-danger-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                  Pharmacy Name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={pharmacyName}
                  onChange={e => setPharmacyName(e.target.value)}
                  placeholder="e.g. St. Jude Pharmacy"
                  required
                  className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                Subject <span className="text-danger-500">*</span>
              </label>
              <input
                name="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={formType === 'bug' ? 'e.g. Sell page crashes on confirm' : 'e.g. Need help with restock flow'}
                required
                className="w-full h-btn px-3 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-label uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5 font-body">
                Description <span className="text-danger-500">*</span>
              </label>
              <textarea
                name="description"
                value={description}
                onChange={e => { if (e.target.value.length <= 500) setDescription(e.target.value); }}
                rows={4}
                maxLength={500}
                placeholder={formType === 'bug' ? 'Describe what happened and how to reproduce it...' : 'Describe what you need help with...'}
                required
                className="w-full px-3 py-2 rounded-btn border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-sm font-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono mt-1 text-right">{description.length}/500</p>
            </div>
            <button
              type="submit"
              disabled={submitting || !email.trim() || !pharmacyName.trim() || !subject.trim() || !description.trim()}
              className="w-full h-btn bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-btn text-sm font-medium font-body transition-colors cursor-pointer whitespace-nowrap"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
