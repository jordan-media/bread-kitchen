import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import s from './Home.module.css';
import { API_BASE_URL } from '../api';

// ============================================
// RECAPTCHA v3 - Same key as Courses page
// ============================================
const RECAPTCHA_SITE_KEY = "6Le4Kx0sAAAAAPB0_JDv-THqzHkU-G4jc9sXS708";
// ============================================

function Home() {
    const [email, setEmail] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'loading', 'success', 'error', 'exists'
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

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
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setSubmitStatus('loading');

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
                body: JSON.stringify({ email, captchaToken })
            });

            const data = await response.json();

            if (response.ok) {
                setEmail('');
                setSubmitStatus('success');
            } else if (data.error === 'Email already subscribed') {
                setSubmitStatus('exists');
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setSubmitStatus('error');
        }

        // Clear message after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000);
    };

    return (
        <main className={s['home']}>
            {/* Masonry Gallery */}
            <section className={s['masonry-section']}>
                <div className={s['masonry']}>

                    {/* Row 1-2: Large + Portrait + Small x2 */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-large']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/baguette.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Artisan</span>
                            <h2>バゲット</h2>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-portrait']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/melon-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Sweet</span>
                            <h3>メロンパン</h3>
                        </div>
                    </Link>

                    <div className={`${s['tile']} ${s['tile-small']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%202.png)'}}></div>
                    </div>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/butter-roll.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Classic</span>
                            <h3>バターロール</h3>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/luxury-cheese-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Premium</span>
                            <h3>チーズパン</h3>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/cinnamon-roll.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Sweet</span>
                            <h3>シナモンロール</h3>
                        </div>
                    </Link>

                    {/* Row 3: Medium + Small + Small */}
                    <Link to="/courses" className={`${s['tile']} ${s['tile-medium']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%207.png)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/matcha-white-chocolate.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Matcha</span>
                            <h3>抹茶</h3>
                        </div>
                    </Link>

                    <div className={`${s['tile']} ${s['tile-small']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%208.png)'}}></div>
                    </div>

                    {/* Row 4: Wide + Small */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-wide']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/bacon-epi.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Signature</span>
                            <h2>ベーコンエピ</h2>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-7.jpg)'}}></div>
                    </Link>

                    {/* Row 5-6: Portrait + Large + Small x4 */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-portrait']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/chocolate-chip-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Sweet</span>
                            <h3>チョコチップ</h3>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-large']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/rustic-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Artisan</span>
                            <h2>リュスティック</h2>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/chocolate-sheet-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Sweet</span>
                            <h3>チョコ食パン</h3>
                        </div>
                    </Link>

                    <div className={`${s['tile']} ${s['tile-small']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%209.png)'}}></div>
                    </div>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-4.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/matcha-roll.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Matcha</span>
                            <h3>抹茶ロール</h3>
                        </div>
                    </Link>

                    {/* Row 7-8: XLarge banner */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-xlarge']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/cream-cheese.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Fresh Baked</span>
                            <h2>クリームチーズ</h2>
                        </div>
                    </Link>

                    {/* Row 9-10: Medium + Portrait + Small + Medium + Small */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/coconut-milk-bagel.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Tropical</span>
                            <h3>ココナッツベーグル</h3>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-portrait']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-14.jpg)'}}></div>
                    </Link>

                    <div className={`${s['tile']} ${s['tile-small']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%2010.png)'}}></div>
                    </div>

                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/cookie-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Sweet</span>
                            <h3>クッキーパン</h3>
                        </div>
                    </Link>

                    <Link to="/about" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/keiko.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Baker</span>
                            <h3>Keiko</h3>
                        </div>
                    </Link>

                    {/* Row 11-13: Large + Tall + Portrait + Smalls */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-large']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/black-sesame-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Japanese</span>
                            <h2>黒ゴマ食パン</h2>
                        </div>
                    </Link>

                    <div className={`${s['tile']} ${s['tile-tall']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%205.png)'}}></div>
                    </div>

                    <Link to="/products" className={`${s['tile']} ${s['tile-portrait']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-3.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-2.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-5.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/pretzel.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>German</span>
                            <h3>プレッツェル</h3>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-1.jpg)'}}></div>
                    </Link>

                    {/* Row 14: Wide + Portrait */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-wide']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/apple-ring.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Seasonal</span>
                            <h2>アップルリング</h2>
                        </div>
                    </Link>

                    <Link to="/contact" className={`${s['tile']} ${s['tile-portrait']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%2011.png)'}}></div>
                    </Link>

                    {/* Row 15-16: Mediums + Smalls */}
                    <Link to="/contact" className={`${s['tile']} ${s['tile-medium']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%206.png)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-13.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-small']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-6.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-15.jpg)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-portrait']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/viennois.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>French</span>
                            <h3>ヴィエノワ</h3>
                        </div>
                    </Link>

                    <Link to="/" className={`${s['tile']} ${s['tile-medium']} ${s['tile-transparent']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/22Artboard%2012.png)'}}></div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-portrait']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/cheese-bagel.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Bagel</span>
                            <h3>チーズベーグル</h3>
                        </div>
                    </Link>

                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/pumpkin-bread.jpg)'}}></div>
                        <div className={s['tile-overlay']}>
                            <span className={s['tile-label']}>Seasonal</span>
                            <h3>かぼちゃ食パン</h3>
                        </div>
                    </Link>

                    {/* Responsive filler - medium on desktop, small on mobile */}
                    <Link to="/products" className={`${s['tile']} ${s['tile-medium']} ${s['tile-filler-desktop']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-16.jpg)'}}></div>
                    </Link>
                    <Link to="/products" className={`${s['tile']} ${s['tile-small']} ${s['tile-filler-mobile']}`}>
                        <div className={s['tile-image']} style={{backgroundImage: 'url(/images/image-16.5.jpg)'}}></div>
                    </Link>

                </div>
            </section>

            {/* Weekly Bread Signup Section */}
            <section id="signup" className={s['newsletter']}>
                <div className={s['newsletter-content']}>
                    <h2>Weekly Fresh Bread</h2>
                    <p>Sign up to receive our weekly bread list and reserve your favourites</p>
                    <form className={s['newsletter-form']} onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={submitStatus === 'loading'}>
                            {submitStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                    {submitStatus === 'success' && (
                        <p className={s['newsletter-success']}>Thank you! You're now subscribed.</p>
                    )}
                    {submitStatus === 'exists' && (
                        <p className={s['newsletter-info']}>You're already subscribed!</p>
                    )}
                    {submitStatus === 'error' && (
                        <p className={s['newsletter-error']}>Something went wrong. Please try again.</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default Home;
