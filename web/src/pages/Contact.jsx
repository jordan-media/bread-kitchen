import { useState, useEffect } from 'react';
import s from './Contact.module.css';
import { API_BASE_URL } from '../api';
import { useTranslation } from '../hooks/useTranslation';

// ============================================
// RECAPTCHA v3 - Same key as other pages
// ============================================
const RECAPTCHA_SITE_KEY = "6Le4Kx0sAAAAAPB0_JDv-THqzHkU-G4jc9sXS708";
// ============================================

function Contact() {
    const { t } = useTranslation('contact');
    const { t: tCommon } = useTranslation('common');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

    // Signup modal state
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');
    const [signupStatus, setSignupStatus] = useState(null);

    // Load reCAPTCHA v3 script on mount
    useEffect(() => {
        if (window.grecaptcha) {
            setRecaptchaLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.onload = () => {
            setRecaptchaLoaded(true);
        };
        document.head.appendChild(script);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            return;
        }

        setSubmitStatus('loading');

        try {
            // Get reCAPTCHA token
            let captchaToken = null;
            if (recaptchaLoaded && window.grecaptcha) {
                captchaToken = await new Promise((resolve, reject) => {
                    window.grecaptcha.ready(() => {
                        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' })
                            .then(resolve)
                            .catch(reject);
                    });
                });
            }

            const response = await fetch(`${API_BASE_URL}/contact/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, captchaToken })
            });

            const data = await response.json();

            if (response.ok) {
                setFormData({ name: '', email: '', subject: '', message: '' });
                setSubmitStatus('success');
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setSubmitStatus('error');
        }

        setTimeout(() => setSubmitStatus(null), 5000);
    };

    // Handle signup modal submit
    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (!signupEmail) return;

        setSignupStatus('loading');

        try {
            // Get reCAPTCHA token
            let captchaToken = null;
            if (recaptchaLoaded && window.grecaptcha) {
                captchaToken = await new Promise((resolve, reject) => {
                    window.grecaptcha.ready(() => {
                        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'subscribe' })
                            .then(resolve)
                            .catch(reject);
                    });
                });
            }

            const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail, captchaToken })
            });

            const data = await response.json();

            if (response.ok) {
                setSignupEmail('');
                setSignupStatus('success');
            } else if (data.error === 'Email already subscribed') {
                setSignupStatus('exists');
            } else {
                setSignupStatus('error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setSignupStatus('error');
        }
    };

    const closeSignupModal = () => {
        setShowSignupModal(false);
        setSignupEmail('');
        setSignupStatus(null);
    };

    return (
        <main className={s['contact']}>
            <section className={s['hero']}>
                <h1>{t('hero.title')}</h1>
                <p>{t('hero.subtitle')}</p>
            </section>

            <section className={s['content']}>
                <div className={s['container']}>
                    <div className={s['contact-grid']}>
                        {/* Contact Form */}
                        <div className={s['form-section']}>
                            <h2>{t('form.title')}</h2>
                            <form className={s['form']} onSubmit={handleSubmit}>
                                <div className={s['form-group']}>
                                    <label htmlFor="name">{t('form.name')}</label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder={t('form.namePlaceholder')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={s['form-group']}>
                                    <label htmlFor="email">{t('form.email')}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder={t('form.emailPlaceholder')}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={s['form-group']}>
                                    <label htmlFor="subject">{t('form.subject')}</label>
                                    <select
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    >
                                        <option value="">{t('form.subjectPlaceholder')}</option>
                                        <option value="order">{t('subjects.breadOrders')}</option>
                                        <option value="course">{t('subjects.courseInquiry')}</option>
                                        <option value="private">{t('subjects.privateLesson')}</option>
                                        <option value="other">{t('subjects.other')}</option>
                                    </select>
                                </div>
                                <div className={s['form-group']}>
                                    <label htmlFor="message">{t('form.message')}</label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        placeholder={t('form.messagePlaceholder')}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className={s['submit-button']}
                                    disabled={submitStatus === 'loading'}
                                >
                                    {submitStatus === 'loading' ? t('form.sending') : t('form.submit')}
                                </button>
                                {submitStatus === 'success' && (
                                    <p className={s['form-success']}>{t('form.success')}</p>
                                )}
                                {submitStatus === 'error' && (
                                    <p className={s['form-error']}>{t('form.error')}</p>
                                )}
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className={s['info-section']}>
                            <div className={s['info-card']}>
                                <h3>{t('info.weeklyBread.title')}</h3>
                                <p>{t('info.weeklyBread.description')}</p>
                                <button
                                    onClick={() => setShowSignupModal(true)}
                                    className={s['info-link-button']}
                                >
                                    {tCommon('header.ctaSignUp')} →
                                </button>
                            </div>

                            <div className={s['info-card']}>
                                <h3>{t('info.courseBookings.title')}</h3>
                                <p>{t('info.courseBookings.description')}</p>
                                <a href="/courses" className={s['info-link']}>{tCommon('nav.courses')} →</a>
                            </div>

                            <div className={s['info-card']}>
                                <h3>{t('info.connect.title')}</h3>
                                <p>{t('info.connect.description')}</p>
                                <div className={s['social-links']}>
                                    <a href="#" className={s['social-link']}>{t('social.instagram')}</a>
                                    <a href="#" className={s['social-link']}>{t('social.facebook')}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Signup Modal */}
            {showSignupModal && (
                <div className={s['modal-overlay']} onClick={closeSignupModal}>
                    <div className={s['modal']} onClick={(e) => e.stopPropagation()}>
                        <button className={s['modal-close']} onClick={closeSignupModal}>×</button>
                        <h2>{tCommon('header.modalTitle')}</h2>
                        <p>{tCommon('header.modalDescription')}</p>

                        {signupStatus === 'success' ? (
                            <div className={s['modal-success']}>
                                <p>{tCommon('newsletter.success')}</p>
                                <button onClick={closeSignupModal} className={s['modal-button']}>{tCommon('buttons.close')}</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSignupSubmit} className={s['modal-form']}>
                                <input
                                    type="email"
                                    placeholder={tCommon('newsletter.emailPlaceholder')}
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={signupStatus === 'loading'}>
                                    {signupStatus === 'loading' ? tCommon('newsletter.subscribing') : tCommon('newsletter.subscribe')}
                                </button>
                                {signupStatus === 'exists' && (
                                    <p className={s['modal-info']}>{tCommon('newsletter.alreadySubscribed')}</p>
                                )}
                                {signupStatus === 'error' && (
                                    <p className={s['modal-error']}>{tCommon('errors.generic')}</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default Contact;
