import { useState, useEffect, useRef } from 'react';
import s from './Courses.module.css';
import { API_BASE_URL } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

// ============================================
// SEASONAL MENU - Update this section quarterly
// ============================================
const currentMenu = {
    dateStart: "December 2024",
    dateEnd: "February 2025",
    longFerment: {
        image: "/images/baguette.jpg",
        name: "バゲット & カンパーニュ",
        nameEn: "Baguette & Campagne",
        description: "Classic French baguette with a rustic country loaf"
    },
    shortFerment: {
        image: "/images/melon-bread.jpg",
        name: "メロンパン & シナモンロール",
        nameEn: "Melon Pan & Cinnamon Roll",
        description: "Popular Japanese sweet bread with warm cinnamon rolls"
    }
};
// ============================================

// ============================================
// RECAPTCHA v3 - Get your site key from Google reCAPTCHA admin
// https://www.google.com/recaptcha/admin
// ============================================
const RECAPTCHA_SITE_KEY = "6Le4Kx0sAAAAAPB0_JDv-THqzHkU-G4jc9sXS708";
// ============================================

function Courses() {
    const { t } = useTranslation('courses');
    const { t: tCommon } = useTranslation('common');
    const { language } = useLanguage();

    const [email, setEmail] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null);
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

    // Inquiry modal state
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [inquiryData, setInquiryData] = useState({
        name: '',
        email: '',
        participants: '1',
        dateYear: '',
        dateMonth: '',
        dateDay: '',
        preferredTime: '',
        message: ''
    });
    const [inquiryStatus, setInquiryStatus] = useState(null);

    // Refs for custom date input
    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);

    // Handle date segment input with auto-advance
    const handleDateSegment = (field, value, maxLength, maxValue, nextRef) => {
        // Only allow digits
        const digits = value.replace(/\D/g, '');
        const limited = digits.slice(0, maxLength);

        setInquiryData(prev => ({
            ...prev,
            [field]: limited
        }));

        // Auto-advance when segment is full
        if (limited.length === maxLength && nextRef?.current) {
            // Use setTimeout to ensure focus happens after state update
            setTimeout(() => {
                nextRef.current.focus();
            }, 0);
        }
    };

    // Handle keydown for backspace navigation
    const handleDateKeyDown = (e, field, prevRef) => {
        const inputValue = e.target.value;
        const selectionStart = e.target.selectionStart;
        const selectionEnd = e.target.selectionEnd;

        // Jump to previous field if:
        // 1. Field is empty and backspace pressed, OR
        // 2. Cursor is at position 0 with no selection and backspace pressed
        if (e.key === 'Backspace' && prevRef?.current) {
            if (inputValue === '' || (selectionStart === 0 && selectionEnd === 0)) {
                e.preventDefault();
                isBackspaceNav.current = true;
                prevRef.current.focus();
            }
        }
    };

    // Focus the first empty field when clicking anywhere in the container
    const handleDateContainerClick = () => {
        // Find the first empty field and focus it
        if (!inquiryData.dateYear || inquiryData.dateYear.length < 4) {
            yearRef.current?.focus();
        } else if (!inquiryData.dateMonth || inquiryData.dateMonth.length < 2) {
            monthRef.current?.focus();
        } else if (!inquiryData.dateDay || inquiryData.dateDay.length < 2) {
            dayRef.current?.focus();
        } else {
            // All filled, focus day for editing
            dayRef.current?.focus();
        }
    };

    // Track if navigation is from backspace (to allow going to previous fields)
    const isBackspaceNav = useRef(false);

    // When focusing any date segment, redirect to first empty segment (only for forward navigation)
    const handleDateFocus = (e, currentField) => {
        // Skip redirect if navigating via backspace
        if (isBackspaceNav.current) {
            isBackspaceNav.current = false;
            return;
        }

        // Check if we should redirect to an earlier empty field
        if (currentField === 'dateYear') {
            // Year is first, no redirect needed
        } else if (currentField === 'dateMonth') {
            if (!inquiryData.dateYear || inquiryData.dateYear.length < 4) {
                e.preventDefault();
                yearRef.current?.focus();
            }
        } else if (currentField === 'dateDay') {
            if (!inquiryData.dateYear || inquiryData.dateYear.length < 4) {
                e.preventDefault();
                yearRef.current?.focus();
            } else if (!inquiryData.dateMonth || inquiryData.dateMonth.length < 2) {
                e.preventDefault();
                monthRef.current?.focus();
            }
        }
    };

    // When year is complete, auto-focus month
    const handleYearFocus = () => {
        // Skip redirect if navigating via backspace
        if (isBackspaceNav.current) {
            isBackspaceNav.current = false;
            return;
        }

        if (inquiryData.dateYear && inquiryData.dateYear.length === 4) {
            if (!inquiryData.dateMonth || inquiryData.dateMonth.length < 2) {
                monthRef.current?.focus();
            } else if (!inquiryData.dateDay || inquiryData.dateDay.length < 2) {
                dayRef.current?.focus();
            }
        }
    };

    // Build the full date string for form submission
    const getFullDate = () => {
        const { dateYear, dateMonth, dateDay } = inquiryData;
        if (dateYear && dateMonth && dateDay) {
            return `${dateYear}-${dateMonth.padStart(2, '0')}-${dateDay.padStart(2, '0')}`;
        }
        return '';
    };

    // Open inquiry modal with pre-selected course
    const openInquiryModal = (courseTitle) => {
        setSelectedCourse(courseTitle);
        setShowInquiryModal(true);
    };

    // Close inquiry modal
    const closeInquiryModal = () => {
        setShowInquiryModal(false);
        setSelectedCourse('');
        setInquiryData({
            name: '',
            email: '',
            participants: '1',
            dateYear: '',
            dateMonth: '',
            dateDay: '',
            preferredTime: '',
            message: ''
        });
        setInquiryStatus(null);
    };

    // Handle inquiry form change
    const handleInquiryChange = (e) => {
        setInquiryData({
            ...inquiryData,
            [e.target.name]: e.target.value
        });
    };

    // Handle inquiry form submit
    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setInquiryStatus('loading');

        try {
            // Get reCAPTCHA token
            let captchaToken = null;
            if (recaptchaLoaded && window.grecaptcha) {
                captchaToken = await new Promise((resolve, reject) => {
                    window.grecaptcha.ready(() => {
                        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'inquiry' })
                            .then(resolve)
                            .catch(reject);
                    });
                });
            }

            const response = await fetch(`${API_BASE_URL}/contact/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: inquiryData.name,
                    email: inquiryData.email,
                    subject: 'course',
                    message: `Course Inquiry: ${selectedCourse}

Preferred Date: ${getFullDate()}
Preferred Time: ${inquiryData.preferredTime}
Number of Participants: ${inquiryData.participants}

Additional Message:
${inquiryData.message || 'No additional message'}`,
                    captchaToken
                })
            });

            if (response.ok) {
                setInquiryStatus('success');
            } else {
                setInquiryStatus('error');
            }
        } catch (error) {
            console.error('Inquiry error:', error);
            setInquiryStatus('error');
        }
    };

    // Load reCAPTCHA v3 script on mount
    useEffect(() => {
        // Check if already loaded
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

        return () => {
            // Cleanup script on unmount (optional)
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!recaptchaLoaded || !window.grecaptcha) {
            setSubmitStatus('captcha');
            return;
        }

        try {
            // Execute reCAPTCHA v3 and get token
            const captchaToken = await new Promise((resolve, reject) => {
                window.grecaptcha.ready(() => {
                    window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'subscribe' })
                        .then(resolve)
                        .catch(reject);
                });
            });

            const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    captchaToken
                })
            });

            const data = await response.json();

            if (response.ok) {
                setEmail('');
                setSubmitStatus('success');
                setTimeout(() => setSubmitStatus(null), 5000);
            } else {
                setSubmitStatus(data.error || 'error');
                setTimeout(() => setSubmitStatus(null), 5000);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };

    const courses = [
        {
            id: 'a',
            title: "Course A",
            titleJa: "低温長時間発酵のハードパン2種",
            subtitle: "Low Temperature, Long Fermentation Hard Breads",
            price: "¥4,500",
            priceSolo: "¥5,000",
            capacity: "Max 4 people",
            features: [
                "Learn to make baguettes and hard breads using French bakery methods",
                "All hand-kneaded - no kneading machine required",
                "Low yeast, low temperature fermentation maximizes flour flavor",
                "Perfect for busy schedules - great for parents or working professionals",
                "Option to learn homemade natural yeast once comfortable"
            ],
            image: "/images/baguette.jpg"
        },
        {
            id: 'b',
            title: "Course B",
            titleJa: "ストレート法のパン2種",
            subtitle: "Straight Method Breads",
            price: "¥4,500",
            priceSolo: "¥5,000",
            capacity: "Max 4 people",
            features: [
                "Learn the classic straight method: knead, first rise, shape, second rise, bake",
                "Wide variety of bread types - sweet breads, savory, vegetable, meal breads",
                "Great if you have an unused bread maker at home",
                "Hand kneading lessons available for those without machines",
                "The most common bread-making method with endless possibilities"
            ],
            image: "/images/melon-bread.jpg"
        },
        {
            id: 'c',
            title: "Course C",
            titleJa: "ストレート法のパン1種と料理",
            subtitle: "Bread & Cooking Course",
            price: "¥5,500",
            priceSolo: null,
            capacity: "Minimum 2 people",
            features: [
                "Perfect introduction if you don't bake often but want fresh bread",
                "Make one type of bread plus 2-3 complementary dishes",
                "Enjoy lunch together with your freshly made bread and dishes",
                "Sometimes includes simple sweets",
                "Contact us to join with other participants if coming alone"
            ],
            image: "/images/class-c.jpg"
        }
    ];

    return (
        <main className={s['courses']}>
            {/* Hero Section */}
            <section className={s['hero']}>
                <div className={s['hero-content']}>
                    <h1>{t('page.japaneseTitle')}</h1>
                    <p className={s['hero-subtitle']}>{t('page.title')}</p>
                    <p className={s['hero-description']}>
                        {t('page.description')}
                    </p>
                </div>
            </section>

            {/* Course A */}
            <section className={s['course-list']}>
                <div className={s['course-card']}>
                    <div
                        className={s['course-image']}
                        style={{backgroundImage: `url(${courses[0].image})`}}
                    ></div>
                    <div className={s['course-content']}>
                        <div className={s['course-header']}>
                            <h2>{courses[0].title}</h2>
                            <span className={s['course-capacity']}>{courses[0].capacity}</span>
                        </div>
                        <p className={s['course-title-ja']}>{courses[0].titleJa}</p>
                        <p className={s['course-subtitle']}>{courses[0].subtitle}</p>

                        <ul className={s['course-features']}>
                            {courses[0].features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>

                        <div className={s['course-footer']}>
                            <div className={s['course-pricing']}>
                                <span className={s['course-price']}>{courses[0].price}</span>
                                <span className={s['course-price-note']}>
                                    (Solo: {courses[0].priceSolo})
                                </span>
                            </div>
                            <button
                                onClick={() => openInquiryModal(courses[0].title + ' - ' + courses[0].titleJa)}
                                className={s['course-button']}
                            >{t('booking.inquiry')}</button>
                        </div>
                    </div>
                </div>

                {/* Course B */}
                <div className={s['course-card']}>
                    <div
                        className={s['course-image']}
                        style={{backgroundImage: `url(${courses[1].image})`}}
                    ></div>
                    <div className={s['course-content']}>
                        <div className={s['course-header']}>
                            <h2>{courses[1].title}</h2>
                            <span className={s['course-capacity']}>{courses[1].capacity}</span>
                        </div>
                        <p className={s['course-title-ja']}>{courses[1].titleJa}</p>
                        <p className={s['course-subtitle']}>{courses[1].subtitle}</p>

                        <ul className={s['course-features']}>
                            {courses[1].features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>

                        <div className={s['course-footer']}>
                            <div className={s['course-pricing']}>
                                <span className={s['course-price']}>{courses[1].price}</span>
                                <span className={s['course-price-note']}>
                                    (Solo: {courses[1].priceSolo})
                                </span>
                            </div>
                            <button
                                onClick={() => openInquiryModal(courses[1].title + ' - ' + courses[1].titleJa)}
                                className={s['course-button']}
                            >{t('booking.inquiry')}</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Current Menu Section */}
            <section className={s['current-menu']}>
                <div className={s['menu-container']}>
                    <div className={s['menu-header']}>
                        <div className={s['menu-title-row']}>
                            <div className={s['menu-title-content']}>
                                <span className={s['menu-label']}>Current Menu</span>
                                <h2>今月のパン</h2>
                            </div>
                        </div>
                        <div className={s['menu-dates-row']}>
                            <p className={s['menu-dates']}>{currentMenu.dateStart} → {currentMenu.dateEnd}</p>
                        </div>
                    </div>
                    <div className={s['menu-grid']}>
                    <div
                        className={s['menu-item']}
                        style={{backgroundImage: `url(${currentMenu.longFerment.image})`}}
                    >
                        <div className={s['menu-tags']}>
                            <span className={s['menu-tag']}>Course A</span>
                            <span className={s['menu-method']}>Long Fermentation</span>
                        </div>
                        <div className={s['menu-content']}>
                            <h3>{currentMenu.longFerment.name}</h3>
                            <p className={s['menu-name-en']}>{currentMenu.longFerment.nameEn}</p>
                            <p className={s['menu-description']}>{currentMenu.longFerment.description}</p>
                        </div>
                    </div>
                    <div
                        className={s['menu-item']}
                        style={{backgroundImage: `url(${currentMenu.shortFerment.image})`}}
                    >
                        <div className={s['menu-tags']}>
                            <span className={s['menu-tag']}>Course B</span>
                            <span className={s['menu-method']}>Straight Method</span>
                        </div>
                        <div className={s['menu-content']}>
                            <h3>{currentMenu.shortFerment.name}</h3>
                            <p className={s['menu-name-en']}>{currentMenu.shortFerment.nameEn}</p>
                            <p className={s['menu-description']}>{currentMenu.shortFerment.description}</p>
                        </div>
                    </div>
                </div>
            </div>
            </section>

            {/* Fresh Bread Signup */}
            <section className={s['fresh-bread']}>
                <div className={s['fresh-bread-container']}>
                    <div className={s['fresh-bread-content']}>
                        <span className={s['fresh-bread-label']}>Weekly Fresh Bread</span>
                        <h2>焼きたてパン</h2>
                        <p>
                            Sign up to receive our weekly bread list. Each week we bake a selection
                            from our menu - <span className={s['fresh-bread-highlight']}>reserve your favourites and pick them up fresh from our oven.</span> Pay on pickup.
                        </p>
                    </div>
                    <form className={s['fresh-bread-form']} onSubmit={handleSubmit}>
                        <div className={s['handwritten-note']}>
                            Enter your email for weekly bread ordering!
                        </div>
                        <div className={s['form-fields']}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">{tCommon('newsletter.subscribe')}</button>
                        </div>
                        {submitStatus === 'captcha' && (
                            <p className={s['form-error']}>{tCommon('errors.captcha')}</p>
                        )}
                        {submitStatus === 'success' && (
                            <p className={s['form-success']}>{tCommon('newsletter.success')}</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className={s['form-error']}>{tCommon('errors.generic')}</p>
                        )}
                        {submitStatus === 'Email already subscribed' && (
                            <p className={s['form-info']}>{tCommon('newsletter.alreadySubscribed')}</p>
                        )}
                    </form>
                </div>
            </section>

            {/* Course C */}
            <section className={s['course-list']}>
                <div className={`${s['course-card']} ${s['course-card-secondary']}`}>
                    <div
                        className={s['course-image']}
                        style={{backgroundImage: `url(${courses[2].image})`}}
                    ></div>
                    <div className={s['course-content']}>
                        <div className={s['course-header']}>
                            <h2>{courses[2].title}</h2>
                            <span className={s['course-capacity']}>{courses[2].capacity}</span>
                        </div>
                        <p className={s['course-title-ja']}>{courses[2].titleJa}</p>
                        <p className={s['course-subtitle']}>{courses[2].subtitle}</p>

                        <ul className={s['course-features']}>
                            {courses[2].features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>

                        <div className={s['course-footer']}>
                            <div className={s['course-pricing']}>
                                <span className={s['course-price']}>{courses[2].price}</span>
                                <span className={s['course-price-note']}>(min 2 people)</span>
                            </div>
                            <button
                                onClick={() => openInquiryModal(courses[2].title + ' - ' + courses[2].titleJa)}
                                className={s['course-button-secondary']}
                            >{t('booking.inquiry')}</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className={s['info']}>
                <div className={s['info-content']}>
                    <h2>Course Information</h2>
                    <div className={s['info-grid']}>
                        <div className={s['info-item']}>
                            <h3>Take Home Bread</h3>
                            <p>Each course includes bread to take home - one large loaf, with small loaves varying by menu.</p>
                        </div>
                        <div className={s['info-item']}>
                            <h3>Booking</h3>
                            <p>Please provide your desired date, number of participants, names, and course choice.</p>
                        </div>
                        <div className={s['info-item']}>
                            <h3>Parking</h3>
                            <p>Free parking available - feel free to come by car.</p>
                        </div>
                        <div className={s['info-item']}>
                            <h3>Shared Classes</h3>
                            <p>Want to join others? Contact us about shared table availability.</p>
                        </div>
                    </div>
                    <button onClick={() => openInquiryModal('')} className={s['info-button']}>Book a Course</button>
                </div>
            </section>

            {/* Inquiry Modal */}
            {showInquiryModal && (
                <div className={s['modal-overlay']} onClick={closeInquiryModal}>
                    <div className={s['modal']} onClick={(e) => e.stopPropagation()}>
                        <button className={s['modal-close']} onClick={closeInquiryModal}>×</button>
                        <h2>Course Inquiry</h2>
                        <p>Select your preferred date and time, and we'll confirm availability.</p>

                        {inquiryStatus === 'success' ? (
                            <div className={s['modal-success']}>
                                <p>Thank you for your inquiry! We'll get back to you soon to confirm your booking.</p>
                                <button onClick={closeInquiryModal} className={s['modal-button']}>Close</button>
                            </div>
                        ) : (
                            <form onSubmit={handleInquirySubmit} className={s['modal-form']}>
                                <div className={s['form-row']}>
                                    <div className={s['form-group']}>
                                        <label htmlFor="inquiry-name">Name</label>
                                        <input
                                            type="text"
                                            id="inquiry-name"
                                            name="name"
                                            placeholder="Your name"
                                            value={inquiryData.name}
                                            onChange={handleInquiryChange}
                                            required
                                        />
                                    </div>
                                    <div className={s['form-group']}>
                                        <label htmlFor="inquiry-email">Email</label>
                                        <input
                                            type="email"
                                            id="inquiry-email"
                                            name="email"
                                            placeholder="your@email.com"
                                            value={inquiryData.email}
                                            onChange={handleInquiryChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={s['form-group']}>
                                    <label htmlFor="inquiry-course">Course</label>
                                    <select
                                        id="inquiry-course"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a course</option>
                                        <option value="Course A - 低温長時間発酵のハードパン2種">Course A - Long Fermentation Hard Breads</option>
                                        <option value="Course B - ストレート法のパン2種">Course B - Straight Method Breads</option>
                                        <option value="Course C - ストレート法のパン1種と料理">Course C - Bread & Cooking</option>
                                    </select>
                                </div>

                                <div className={s['form-row']}>
                                    <div className={s['form-group']}>
                                        <label>Preferred Date</label>
                                        <div
                                            className={s['date-input-container']}
                                            onClick={handleDateContainerClick}
                                        >
                                            <input
                                                ref={yearRef}
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="YYYY"
                                                value={inquiryData.dateYear}
                                                onChange={(e) => handleDateSegment('dateYear', e.target.value, 4, 2040, monthRef)}
                                                onKeyDown={(e) => handleDateKeyDown(e, 'dateYear', null)}
                                                onFocus={handleYearFocus}
                                                className={s['date-segment']}
                                                maxLength={4}
                                            />
                                            <span className={s['date-separator']}>-</span>
                                            <input
                                                ref={monthRef}
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="MM"
                                                value={inquiryData.dateMonth}
                                                onChange={(e) => handleDateSegment('dateMonth', e.target.value, 2, 12, dayRef)}
                                                onKeyDown={(e) => handleDateKeyDown(e, 'dateMonth', yearRef)}
                                                onFocus={(e) => handleDateFocus(e, 'dateMonth')}
                                                className={s['date-segment']}
                                                maxLength={2}
                                            />
                                            <span className={s['date-separator']}>-</span>
                                            <input
                                                ref={dayRef}
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="DD"
                                                value={inquiryData.dateDay}
                                                onChange={(e) => handleDateSegment('dateDay', e.target.value, 2, 31, null)}
                                                onKeyDown={(e) => handleDateKeyDown(e, 'dateDay', monthRef)}
                                                onFocus={(e) => handleDateFocus(e, 'dateDay')}
                                                className={s['date-segment']}
                                                maxLength={2}
                                            />
                                        </div>
                                        <input type="hidden" name="preferredDate" value={getFullDate()} required />
                                    </div>
                                    <div className={s['form-group']}>
                                        <label htmlFor="inquiry-time">Preferred Time</label>
                                        <select
                                            id="inquiry-time"
                                            name="preferredTime"
                                            value={inquiryData.preferredTime}
                                            onChange={handleInquiryChange}
                                            required
                                        >
                                            <option value="">Select time</option>
                                            <option value="Morning (9:00-12:00)">{t('timeSlots.morning')}</option>
                                            <option value="Afternoon (13:00-16:00)">{t('timeSlots.afternoon')}</option>
                                            <option value="Flexible">{t('timeSlots.flexible')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={s['form-group']}>
                                    <label htmlFor="inquiry-participants">{t('booking.participants')}</label>
                                    <select
                                        id="inquiry-participants"
                                        name="participants"
                                        value={inquiryData.participants}
                                        onChange={handleInquiryChange}
                                        required
                                    >
                                        <option value="1">{t('participants.one')}</option>
                                        <option value="2">{t('participants.two')}</option>
                                        <option value="3">{t('participants.three')}</option>
                                        <option value="4">{t('participants.four')}</option>
                                    </select>
                                </div>

                                <div className={s['form-group']}>
                                    <label htmlFor="inquiry-message">{t('booking.additionalMessage')}</label>
                                    <textarea
                                        id="inquiry-message"
                                        name="message"
                                        placeholder="Any questions or special requests?"
                                        value={inquiryData.message}
                                        onChange={handleInquiryChange}
                                        rows="3"
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={inquiryStatus === 'loading'}>
                                    {inquiryStatus === 'loading' ? t('booking.sending') : t('booking.sendInquiry')}
                                </button>

                                {inquiryStatus === 'error' && (
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

export default Courses;
