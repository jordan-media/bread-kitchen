// Admin.jsx - Main admin panel for email campaigns
import { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import { API_BASE_URL } from '../../api';

const API_URL = API_BASE_URL;

// ============================================
// LOGIN COMPONENT
// ============================================
function AdminLogin({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                onLogin(data.token);
            } else {
                setError('Invalid password');
            }
        } catch (err) {
            setError('Connection error');
        }

        setLoading(false);
    };

    return (
        <div className={styles['login-container']}>
            <div className={styles['login-box']}>
                <h1>Admin Login</h1>
                <p>Bread Kitchen Newsletter</p>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ============================================
// DASHBOARD COMPONENT
// ============================================
function Dashboard({ token, onNavigate }) {
    const [stats, setStats] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, campaignsRes] = await Promise.all([
                fetch(`${API_URL}/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/campaigns`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats(await statsRes.json());
            setCampaigns(await campaignsRes.json());
        } catch (err) {
            console.error('Error fetching data:', err);
        }
        setLoading(false);
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            {/* Stats */}
            <div className={styles['stats-grid']}>
                <div className={styles['stat-card']}>
                    <h3>Subscribers</h3>
                    <p className={styles.number}>{stats?.subscriberCount || 0}</p>
                </div>
                <div className={styles['stat-card']}>
                    <h3>Campaigns Sent</h3>
                    <p className={styles.number}>{stats?.campaignsSent || 0}</p>
                </div>
                <div className={styles['stat-card']}>
                    <h3>Last Campaign</h3>
                    <p className={styles.number}>
                        {stats?.lastCampaign
                            ? new Date(stats.lastCampaign.sent_at).toLocaleDateString()
                            : 'Never'}
                    </p>
                    {stats?.lastCampaign && (
                        <p className={styles.sub}>{stats.lastCampaign.recipient_count} recipients</p>
                    )}
                </div>
            </div>

            {/* Recent Campaigns */}
            <div className={styles.section}>
                <div className={styles['section-header']}>
                    <h2>Recent Campaigns</h2>
                    <button
                        className={`${styles.btn} ${styles['btn-primary']}`}
                        onClick={() => onNavigate('new-campaign')}
                    >
                        + New Campaign
                    </button>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Pickup Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    No campaigns yet
                                </td>
                            </tr>
                        ) : (
                            campaigns.slice(0, 5).map(campaign => (
                                <tr key={campaign.id}>
                                    <td>{campaign.subject}</td>
                                    <td>{campaign.pickup_date}</td>
                                    <td>
                                        <span className={`${styles.badge} ${campaign.sent_at ? styles['badge-sent'] : styles['badge-draft']}`}>
                                            {campaign.sent_at ? 'Sent' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`${styles.btn} ${styles['btn-secondary']} ${styles['btn-small']}`}
                                            onClick={() => onNavigate('edit-campaign', campaign.id)}
                                        >
                                            {campaign.sent_at ? 'View' : 'Edit'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// SUBSCRIBERS COMPONENT
// ============================================
function Subscribers({ token }) {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/subscribers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscribers(await res.json());
        } catch (err) {
            console.error('Error:', err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this subscriber?')) return;

        try {
            await fetch(`${API_URL}/admin/subscribers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscribers(subscribers.filter(s => s.id !== id));
        } catch (err) {
            alert('Error removing subscriber');
        }
    };

    const handleExport = () => {
        window.open(`${API_URL}/admin/subscribers/export`, '_blank');
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <div className={styles['section-header']}>
                    <h2>Subscribers ({subscribers.length})</h2>
                    <button
                        className={`${styles.btn} ${styles['btn-secondary']}`}
                        onClick={handleExport}
                    >
                        Export CSV
                    </button>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Subscribed</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center' }}>
                                    No subscribers yet
                                </td>
                            </tr>
                        ) : (
                            subscribers.map(sub => (
                                <tr key={sub.id}>
                                    <td>{sub.email}</td>
                                    <td>{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className={`${styles.btn} ${styles['btn-danger']} ${styles['btn-small']}`}
                                            onClick={() => handleDelete(sub.id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// EMAIL PREVIEW COMPONENT
// ============================================
function EmailPreview({ campaign, items, onClose }) {
    const colors = {
        cream: '#FEFBE3',
        beige: '#EFE3C3',
        sage: '#CFD8B3',
        caramel: '#C58E56',
        darkBrown: '#5a4a32',
        mediumBrown: '#8B5A2B'
    };

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['preview-modal']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['preview-header']}>
                    <h3>Email Preview</h3>
                    <button onClick={onClose} className={styles['close-btn']}>×</button>
                </div>
                <div className={styles['preview-content']}>
                    {/* Email Preview */}
                    <div style={{ backgroundColor: colors.cream, padding: '20px' }}>
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {/* Header */}
                            <div style={{
                                backgroundColor: colors.beige,
                                padding: '32px 24px',
                                textAlign: 'center',
                                borderRadius: '8px 8px 0 0'
                            }}>
                                <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: colors.darkBrown, fontFamily: 'Georgia, serif' }}>
                                    Bread Kitchen
                                </h1>
                                <p style={{ margin: 0, fontSize: '20px', color: colors.caramel, fontFamily: 'Georgia, serif' }}>
                                    焼きたてパン
                                </p>
                            </div>

                            {/* Content */}
                            <div style={{ backgroundColor: '#ffffff', padding: '32px 24px' }}>
                                <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', color: colors.darkBrown }}>
                                    Fresh Bread This Week!
                                </h2>
                                {campaign.intro_text && (
                                    <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: colors.mediumBrown, lineHeight: 1.5 }}>
                                        {campaign.intro_text}
                                    </p>
                                )}
                                <div style={{
                                    backgroundColor: colors.beige,
                                    padding: '12px 16px',
                                    borderRadius: '4px',
                                    marginBottom: '24px'
                                }}>
                                    <p style={{ margin: 0, fontSize: '15px', color: colors.darkBrown }}>
                                        <strong>Pickup:</strong> {campaign.pickup_date || 'Not set'} | {campaign.pickup_time || 'Not set'}
                                    </p>
                                </div>

                                {/* Items */}
                                {items.map(item => (
                                    <div key={item.product_id} style={{
                                        display: 'flex',
                                        gap: '16px',
                                        padding: '16px 0',
                                        borderBottom: `1px solid ${colors.sage}`
                                    }}>
                                        <img
                                            src={`${API_URL}/products/images/${item.image}`}
                                            alt={item.name_en}
                                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: colors.darkBrown }}>
                                                {item.name_en}
                                            </p>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: colors.caramel }}>
                                                {item.name_ja}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: colors.darkBrown }}>
                                                ¥{item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {items.length === 0 && (
                                    <p style={{ color: colors.mediumBrown, fontStyle: 'italic' }}>No breads added yet</p>
                                )}

                                {/* CTA */}
                                <div style={{
                                    backgroundColor: colors.sage,
                                    padding: '24px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    marginTop: '24px'
                                }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: colors.darkBrown }}>
                                        Want to reserve?
                                    </p>
                                    <p style={{ margin: 0, fontSize: '15px', color: colors.darkBrown }}>
                                        Simply reply to this email with your order!<br />
                                        Or message us on LINE: <strong>@breadkitchen</strong>
                                    </p>
                                </div>

                                {/* Pickup Location */}
                                <div style={{
                                    backgroundColor: colors.beige,
                                    padding: '24px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    marginTop: '24px'
                                }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: colors.mediumBrown }}>
                                        Pickup Location
                                    </p>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: 'bold', color: colors.darkBrown, fontFamily: 'Georgia, serif' }}>
                                        Bread Kitchen
                                    </p>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: colors.darkBrown, lineHeight: 1.5 }}>
                                        123 Bakery Street<br />
                                        Shibuya-ku, Tokyo 150-0001
                                    </p>
                                    <a
                                        href="https://maps.google.com/?q=123+Bakery+Street+Shibuya+Tokyo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block',
                                            padding: '12px 24px',
                                            backgroundColor: colors.caramel,
                                            color: '#ffffff',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Open in Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                backgroundColor: colors.beige,
                                padding: '24px',
                                textAlign: 'center',
                                borderRadius: '0 0 8px 8px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: colors.darkBrown, fontWeight: 'bold' }}>
                                    Bread Kitchen
                                </p>
                                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: colors.mediumBrown, lineHeight: 1.4 }}>
                                    123 Bakery Street, Shibuya-ku, Tokyo<br />
                                    breadkitchen@gmail.com
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', color: colors.mediumBrown }}>
                                    <span style={{ textDecoration: 'underline' }}>Unsubscribe</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// CAMPAIGN EDITOR COMPONENT
// ============================================
function CampaignEditor({ token, campaignId, onNavigate }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [showTestModal, setShowTestModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [message, setMessage] = useState('');
    const [sendResult, setSendResult] = useState(null); // { success: bool, message: string }
    const [testResult, setTestResult] = useState(null); // { success: bool, message: string }

    const [campaign, setCampaign] = useState({
        subject: '',
        intro_text: '',
        pickup_date: '',
        pickup_time: '',
        items: [],
        sent_at: null
    });

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    const fetchData = async () => {
        try {
            // Fetch products
            const productsRes = await fetch(`${API_URL}/admin/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(await productsRes.json());

            // Fetch campaign if editing
            if (campaignId) {
                const campaignRes = await fetch(`${API_URL}/admin/campaigns/${campaignId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await campaignRes.json();
                setCampaign({
                    subject: data.subject,
                    intro_text: data.intro_text || '',
                    pickup_date: data.pickup_date,
                    pickup_time: data.pickup_time,
                    items: data.items || [],
                    sent_at: data.sent_at
                });
            }
        } catch (err) {
            console.error('Error:', err);
        }
        setLoading(false);
    };

    const handleAddItem = (productId) => {
        const product = products.find(p => p.product_id === parseInt(productId));
        if (!product) return;

        // Check if already added
        if (campaign.items.some(item => item.product_id === product.product_id)) {
            return;
        }

        setCampaign({
            ...campaign,
            items: [...campaign.items, {
                product_id: product.product_id,
                name_en: product.name_en,
                name_ja: product.name_ja,
                price: product.price,
                image: product.image
            }]
        });
    };

    const handleRemoveItem = (productId) => {
        setCampaign({
            ...campaign,
            items: campaign.items.filter(item => item.product_id !== productId)
        });
    };

    const handleSave = async () => {
        if (!campaign.subject || !campaign.pickup_date || !campaign.pickup_time) {
            alert('Please fill in subject, pickup date, and pickup time');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const url = campaignId
                ? `${API_URL}/admin/campaigns/${campaignId}`
                : `${API_URL}/admin/campaigns`;

            const res = await fetch(url, {
                method: campaignId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(campaign)
            });

            const data = await res.json();

            if (data.success || data.id) {
                setMessage('Saved!');
                if (!campaignId && data.id) {
                    onNavigate('edit-campaign', data.id);
                }
            } else {
                setMessage('Error saving');
            }
        } catch (err) {
            setMessage('Error saving');
        }

        setSaving(false);
    };

    const handleSendTest = async () => {
        if (!testEmail) return;

        setSending(true);
        setTestResult(null);

        try {
            const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/send-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email: testEmail })
            });

            const data = await res.json();
            if (data.success) {
                setTestResult({
                    success: true,
                    message: `Test email sent to ${testEmail}!`
                });
            } else {
                setTestResult({
                    success: false,
                    message: `Failed to send: ${data.error}`
                });
            }
        } catch (err) {
            setTestResult({
                success: false,
                message: 'Connection error. Please try again.'
            });
        }

        setSending(false);
    };

    const closeTestModal = () => {
        setShowTestModal(false);
        setTestResult(null);
        setTestEmail('');
    };

    const handleSendCampaign = async () => {
        setSending(true);
        setSendResult(null);

        try {
            const res = await fetch(`${API_URL}/admin/campaigns/${campaignId}/send`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.success) {
                setSendResult({
                    success: true,
                    message: `Campaign sent successfully to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}!`
                });
                setCampaign({ ...campaign, sent_at: new Date().toISOString() });
            } else {
                setSendResult({
                    success: false,
                    message: `Failed to send: ${data.error}`
                });
            }
        } catch (err) {
            setSendResult({
                success: false,
                message: 'Connection error. Please try again.'
            });
        }

        setSending(false);
    };

    const closeSendModal = () => {
        setShowSendModal(false);
        setSendResult(null);
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    const isEditable = !campaign.sent_at;

    return (
        <div className={styles.container}>
            <div className={styles['section-header']}>
                <h2>{campaignId ? (isEditable ? 'Edit Campaign' : 'View Campaign') : 'New Campaign'}</h2>
                <button
                    className={`${styles.btn} ${styles['btn-secondary']}`}
                    onClick={() => onNavigate('dashboard')}
                >
                    Back
                </button>
            </div>

            {message && (
                <p style={{
                    padding: '12px',
                    backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {message}
                </p>
            )}

            {/* Campaign Details */}
            <div className={styles['form-group']}>
                <label className={styles.required}>Email Subject</label>
                <input
                    type="text"
                    placeholder="Fresh Bread This Week!"
                    value={campaign.subject}
                    onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                    disabled={!isEditable}
                />
            </div>

            <div className={styles['form-group']}>
                <label>Intro Message (optional)</label>
                <textarea
                    placeholder="We have some delicious bread for you this week..."
                    value={campaign.intro_text}
                    onChange={(e) => setCampaign({ ...campaign, intro_text: e.target.value })}
                    disabled={!isEditable}
                />
            </div>

            <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                    <label className={styles.required}>Pickup Date</label>
                    <input
                        type="text"
                        placeholder="Saturday, December 7th"
                        value={campaign.pickup_date}
                        onChange={(e) => setCampaign({ ...campaign, pickup_date: e.target.value })}
                        disabled={!isEditable}
                    />
                </div>
                <div className={styles['form-group']}>
                    <label className={styles.required}>Pickup Time</label>
                    <input
                        type="text"
                        placeholder="10am - 2pm"
                        value={campaign.pickup_time}
                        onChange={(e) => setCampaign({ ...campaign, pickup_time: e.target.value })}
                        disabled={!isEditable}
                    />
                </div>
            </div>

            {/* Product Selection */}
            {isEditable && (
                <div className={styles['form-group']}>
                    <label>Add Bread to Campaign</label>
                    <select onChange={(e) => handleAddItem(e.target.value)} value="">
                        <option value="">Select a bread...</option>
                        {products.map(product => (
                            <option
                                key={product.product_id}
                                value={product.product_id}
                                disabled={campaign.items.some(i => i.product_id === product.product_id)}
                            >
                                {product.name_en} - {product.category_name} - ¥{product.price}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Selected Items */}
            <div className={styles['items-section']}>
                <h3>Breads in Campaign ({campaign.items.length})</h3>
                {campaign.items.length === 0 ? (
                    <p style={{ color: '#8B5A2B' }}>No breads selected yet</p>
                ) : (
                    <div className={styles['items-grid']}>
                        {campaign.items.map(item => (
                            <div key={item.product_id} className={styles['item-tile']}>
                                {isEditable && (
                                    <button
                                        className={styles['tile-remove-btn']}
                                        onClick={() => handleRemoveItem(item.product_id)}
                                    >
                                        ×
                                    </button>
                                )}
                                {item.image ? (
                                    <img
                                        src={`${API_URL}/products/images/${item.image}`}
                                        alt={item.name_en}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '1',
                                        backgroundColor: '#EFE3C3',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.7em', color: '#8B5A2B' }}>No image</span>
                                    </div>
                                )}
                                <div className={styles['tile-info']}>
                                    <div className={styles['tile-name']}>{item.name_en}</div>
                                    <div className={styles['tile-price']}>¥{item.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button
                    className={`${styles.btn} ${styles['btn-secondary']}`}
                    onClick={() => setShowPreview(true)}
                >
                    Preview Email
                </button>
                {isEditable && (
                    <>
                        <button
                            className={`${styles.btn} ${styles['btn-primary']}`}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>

                        {campaignId && (
                            <>
                                <button
                                    className={`${styles.btn} ${styles['btn-secondary']}`}
                                    onClick={() => setShowTestModal(true)}
                                >
                                    Send Test
                                </button>
                                <button
                                    className={`${styles.btn} ${styles['btn-primary']}`}
                                    onClick={() => setShowSendModal(true)}
                                >
                                    Send to All Subscribers
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Email Preview Modal */}
            {showPreview && (
                <EmailPreview
                    campaign={campaign}
                    items={campaign.items}
                    onClose={() => setShowPreview(false)}
                />
            )}

            {/* Test Email Modal */}
            {showTestModal && (
                <div className={styles['modal-overlay']}>
                    <div className={styles.modal}>
                        {testResult ? (
                            <>
                                <h3>{testResult.success ? 'Success!' : 'Error'}</h3>
                                <p style={{
                                    padding: '16px',
                                    backgroundColor: testResult.success ? '#e8f5e9' : '#ffebee',
                                    borderRadius: '4px',
                                    color: testResult.success ? '#2e7d32' : '#c62828'
                                }}>
                                    {testResult.message}
                                </p>
                                <div className={styles['modal-actions']}>
                                    <button
                                        className={`${styles.btn} ${styles['btn-primary']}`}
                                        onClick={closeTestModal}
                                    >
                                        {testResult.success ? 'Done' : 'Close'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Send Test Email</h3>
                                <p>Enter your email address to receive a test of this campaign.</p>
                                <div className={styles['form-group']}>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                    />
                                </div>
                                <div className={styles['modal-actions']}>
                                    <button
                                        className={`${styles.btn} ${styles['btn-secondary']}`}
                                        onClick={closeTestModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles['btn-primary']}`}
                                        onClick={handleSendTest}
                                        disabled={sending || !testEmail}
                                    >
                                        {sending ? 'Sending...' : 'Send Test'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Send Campaign Modal */}
            {showSendModal && (
                <div className={styles['modal-overlay']}>
                    <div className={styles.modal}>
                        {sendResult ? (
                            <>
                                <h3>{sendResult.success ? 'Success!' : 'Error'}</h3>
                                <p style={{
                                    padding: '16px',
                                    backgroundColor: sendResult.success ? '#e8f5e9' : '#ffebee',
                                    borderRadius: '4px',
                                    color: sendResult.success ? '#2e7d32' : '#c62828'
                                }}>
                                    {sendResult.message}
                                </p>
                                <div className={styles['modal-actions']}>
                                    <button
                                        className={`${styles.btn} ${styles['btn-primary']}`}
                                        onClick={closeSendModal}
                                    >
                                        {sendResult.success ? 'Done' : 'Close'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Send Campaign</h3>
                                <p>
                                    Are you sure you want to send this campaign to all subscribers?
                                    This cannot be undone.
                                </p>
                                <div className={styles['modal-actions']}>
                                    <button
                                        className={`${styles.btn} ${styles['btn-secondary']}`}
                                        onClick={closeSendModal}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles['btn-primary']}`}
                                        onClick={handleSendCampaign}
                                        disabled={sending}
                                    >
                                        {sending ? 'Sending...' : 'Yes, Send Now'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// MAIN ADMIN COMPONENT
// ============================================
export default function Admin() {
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [view, setView] = useState('dashboard');
    const [editId, setEditId] = useState(null);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        verifyToken();
    }, []);

    const verifyToken = async () => {
        if (!token) {
            setVerifying(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                localStorage.removeItem('adminToken');
                setToken(null);
            }
        } catch (err) {
            localStorage.removeItem('adminToken');
            setToken(null);
        }

        setVerifying(false);
    };

    const handleLogout = () => {
        fetch(`${API_URL}/admin/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.removeItem('adminToken');
        setToken(null);
    };

    const handleNavigate = (newView, id = null) => {
        setView(newView);
        setEditId(id);
    };

    if (verifying) {
        return (
            <div className={styles.admin}>
                <div className={styles.container}>Loading...</div>
            </div>
        );
    }

    if (!token) {
        return <AdminLogin onLogin={setToken} />;
    }

    return (
        <div className={styles.admin}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Bread Kitchen Admin</h1>
                <div className={styles['header-nav']}>
                    <a href="#" onClick={() => handleNavigate('dashboard')}>Dashboard</a>
                    <a href="#" onClick={() => handleNavigate('subscribers')}>Subscribers</a>
                    <button className={styles['logout-btn']} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Content */}
            {view === 'dashboard' && (
                <Dashboard token={token} onNavigate={handleNavigate} />
            )}
            {view === 'subscribers' && (
                <Subscribers token={token} />
            )}
            {(view === 'new-campaign' || view === 'edit-campaign') && (
                <CampaignEditor
                    token={token}
                    campaignId={editId}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
}
