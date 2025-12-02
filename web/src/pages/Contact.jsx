import { useState, useEffect } from 'react';
import s from './Contact.module.css';

// ============================================
// RECAPTCHA v3 - Same key as other pages
// ============================================
const RECAPTCHA_SITE_KEY = "6Le4Kx0sAAAAAPB0_JDv-THqzHkU-G4jc9sXS708";
// ============================================

function Contact() {
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

            const response = await fetch('http://localhost:3001/contact/send', {
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

            const response = await fetch('http://localhost:3001/newsletter/subscribe', {
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
                <h1>Contact Us</h1>
                <p>We'd love to hear from you</p>
            </section>

            <section className={s['content']}>
                <div className={s['container']}>
                    <div className={s['contact-grid']}>
                        {/* Contact Form */}
                        <div className={s['form-section']}>
                            <h2>Send a Message</h2>
                            <form className={s['form']} onSubmit={handleSubmit}>
                                <div className={s['form-group']}>
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={s['form-group']}>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={s['form-group']}>
                                    <label htmlFor="subject">Subject</label>
                                    <select
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a topic</option>
                                        <option value="order">Bread Orders</option>
                                        <option value="course">Course Inquiry</option>
                                        <option value="private">Private Lesson</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className={s['form-group']}>
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        placeholder="How can we help you?"
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
                                    {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
                                </button>
                                {submitStatus === 'success' && (
                                    <p className={s['form-success']}>Message sent! We'll get back to you soon.</p>
                                )}
                                {submitStatus === 'error' && (
                                    <p className={s['form-error']}>Something went wrong. Please try again.</p>
                                )}
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className={s['info-section']}>
                            <div className={s['info-card']}>
                                <h3>Weekly Fresh Bread</h3>
                                <p>Subscribe to our weekly email to see available breads and place your order.</p>
                                <button
                                    onClick={() => setShowSignupModal(true)}
                                    className={s['info-link-button']}
                                >
                                    Sign Up →
                                </button>
                            </div>

                            <div className={s['info-card']}>
                                <h3>Course Bookings</h3>
                                <p>Interested in a baking class? Send us a message with your preferred dates.</p>
                                <a href="/courses" className={s['info-link']}>View Courses →</a>
                            </div>

                            <div className={s['info-card']}>
                                <h3>Connect</h3>
                                <p>Follow our baking journey on social media for daily updates and behind-the-scenes content.</p>
                                <div className={s['social-links']}>
                                    <a href="#" className={s['social-link']}>Instagram</a>
                                    <a href="#" className={s['social-link']}>Facebook</a>
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
                        <h2>Weekly Fresh Bread</h2>
                        <p>Sign up to receive our weekly bread list and reserve your favourites.</p>

                        {signupStatus === 'success' ? (
                            <div className={s['modal-success']}>
                                <p>Thank you! You're now subscribed.</p>
                                <button onClick={closeSignupModal} className={s['modal-button']}>Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSignupSubmit} className={s['modal-form']}>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={signupStatus === 'loading'}>
                                    {signupStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                                </button>
                                {signupStatus === 'exists' && (
                                    <p className={s['modal-info']}>You're already subscribed!</p>
                                )}
                                {signupStatus === 'error' && (
                                    <p className={s['modal-error']}>Something went wrong. Please try again.</p>
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
