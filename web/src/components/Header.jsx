import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import h from './Header.module.css';
import { API_BASE_URL } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';

// ============================================
// RECAPTCHA v3 - Same key as other pages
// ============================================
const RECAPTCHA_SITE_KEY = "6Le4Kx0sAAAAAPB0_JDv-THqzHkU-G4jc9sXS708";
// ============================================

function Header() {
    const { t } = useTranslation('common');
    const { language, setLanguage } = useLanguage();
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showLangDropdown, setShowLangDropdown] = useState(false);
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
        <>
            <header className={h['header']}>
                <nav className={h['nav-bar']}>
                    {/* Left - Logo */}
                    <Link to="/" className={h['logo']}>
                        <img src="/BreadKitchenLogo.png" alt="Bread Kitchen" />
                    </Link>

                    {/* Center - Nav Links */}
                    <div className={h['nav-links']}>
                        <Link to="/courses" className={h['nav-link']}>{t('nav.courses')}</Link>
                        <Link to="/products" className={h['nav-link']}>{t('nav.menu')}</Link>
                        <Link to="/about" className={h['nav-link']}>{t('nav.about')}</Link>
                        <Link to="/contact" className={h['nav-link']}>{t('nav.contact')}</Link>
                    </div>

                    {/* Right - CTAs and Language Selector */}
                    <div className={h['cta-group']}>
                        {/* Language Selector */}
                        <div className={h['lang-selector']}>
                            <button
                                className={h['lang-button']}
                                onClick={() => setShowLangDropdown(!showLangDropdown)}
                            >
                                {LANGUAGES[language].flag}
                            </button>
                            {showLangDropdown && (
                                <div className={h['lang-dropdown']}>
                                    {Object.values(LANGUAGES).map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={`${h['lang-option']} ${language === lang.code ? h['lang-active'] : ''}`}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setShowLangDropdown(false);
                                            }}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link to="/courses" className={h['cta-solid']}>{t('header.ctaCourses')}</Link>
                        <button onClick={() => setShowSignupModal(true)} className={h['cta-outline']}>{t('header.ctaSignUp')}</button>
                    </div>
                </nav>
            </header>

            {/* Signup Modal */}
            {showSignupModal && (
                <div className={h['modal-overlay']} onClick={closeSignupModal}>
                    <div className={h['modal']} onClick={(e) => e.stopPropagation()}>
                        <button className={h['modal-close']} onClick={closeSignupModal}>×</button>
                        <h2>{t('header.modalTitle')}</h2>
                        <p>{t('header.modalDescription')}</p>

                        {signupStatus === 'success' ? (
                            <div className={h['modal-success']}>
                                <p>{t('newsletter.success')}</p>
                                <button onClick={closeSignupModal} className={h['modal-button']}>{t('buttons.close')}</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSignupSubmit} className={h['modal-form']}>
                                <input
                                    type="email"
                                    placeholder={t('newsletter.emailPlaceholder')}
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" disabled={signupStatus === 'loading'}>
                                    {signupStatus === 'loading' ? t('newsletter.subscribing') : t('newsletter.subscribe')}
                                </button>
                                {signupStatus === 'exists' && (
                                    <p className={h['modal-info']}>{t('newsletter.alreadySubscribed')}</p>
                                )}
                                {signupStatus === 'error' && (
                                    <p className={h['modal-error']}>{t('errors.generic')}</p>
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
