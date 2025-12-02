import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import h from './Header.module.css';

// ============================================
// RECAPTCHA v3 - Same key as other pages
// ============================================
const RECAPTCHA_SITE_KEY = "6Le4Kx0sAAAAAPB0_JDv-THqzHkU-G4jc9sXS708";
// ============================================

function Header() {
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');
    const [signupStatus, setSignupStatus] = useState(null);
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

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

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (!signupEmail) return;

        setSignupStatus('loading');

        try {
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
        <>
            <header className={h['header']}>
                <nav className={h['nav-bar']}>
                    {/* Left - Logo */}
                    <Link to="/" className={h['logo']}>
                        <img src="/BreadKitchenLogo.png" alt="Bread Kitchen" />
                    </Link>

                    {/* Center - Nav Links */}
                    <div className={h['nav-links']}>
                        <Link to="/courses" className={h['nav-link']}>Courses</Link>
                        <Link to="/products" className={h['nav-link']}>Menu</Link>
                        <Link to="/about" className={h['nav-link']}>About</Link>
                        <Link to="/contact" className={h['nav-link']}>Contact</Link>
                    </div>

                    {/* Right - CTAs */}
                    <div className={h['cta-group']}>
                        <Link to="/courses" className={h['cta-solid']}>Courses</Link>
                        <button onClick={() => setShowSignupModal(true)} className={h['cta-outline']}>Sign Up</button>
                    </div>
                </nav>
            </header>

            {/* Signup Modal */}
            {showSignupModal && (
                <div className={h['modal-overlay']} onClick={closeSignupModal}>
                    <div className={h['modal']} onClick={(e) => e.stopPropagation()}>
                        <button className={h['modal-close']} onClick={closeSignupModal}>×</button>
                        <h2>Weekly Fresh Bread</h2>
                        <p>Sign up to receive our weekly bread list and reserve your favourites.</p>

                        {signupStatus === 'success' ? (
                            <div className={h['modal-success']}>
                                <p>Thank you! You're now subscribed.</p>
                                <button onClick={closeSignupModal} className={h['modal-button']}>Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSignupSubmit} className={h['modal-form']}>
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
                                    <p className={h['modal-info']}>You're already subscribed!</p>
                                )}
                                {signupStatus === 'error' && (
                                    <p className={h['modal-error']}>Something went wrong. Please try again.</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;
