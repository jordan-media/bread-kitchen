import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import g from '../global.module.css';
import s from "./AllProducts.module.css";
import { API_BASE_URL } from '../api';

function AllProducts() {

    const [products, setProducts] = useState([]);
    const [language, setLanguage] = useState('ja'); // Default to Japanese
    const [filters, setFilters] = useState({
        dairyFree: false,
        category: 'all'
    });

    // Fetch products from API
    const fetchProducts = () => {
        fetch(`${API_BASE_URL}/products`)
            .then(res => res.json())
            .then((jsonData) => {
                console.log(jsonData);
                setProducts(jsonData);
            })
            .catch(err => console.error("Error fetching products:", err));
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    const isJapanese = language === 'ja';

    // Get unique categories from products
    const categories = [...new Set(products.map(p => p.category_name_en))];

    // Filter products
    const filteredProducts = products.filter(product => {
        if (filters.dairyFree && product.contains_dairy === 1) return false;
        if (filters.category !== 'all' && product.category_name_en !== filters.category) return false;
        return true;
    });

    return (
        <main className={g['container']}>
            <div className={s['page-header']}>
                <div>
                    <h2>{isJapanese ? 'ブレッドキッチン' : 'Bread Kitchen'}</h2>
                    <p className={s['page-subtitle']}>{isJapanese ? '焼きたてのパン' : 'Freshly baked artisan breads'}</p>
                    <p className={s['page-blurb']}>
                        {isJapanese
                            ? 'こちらは私たちが心を込めて焼き上げるパンのコレクションです。毎週、厳選したパンをご用意しております。メールでその週のラインナップをお届けしますので、お気に入りをご予約の上、焼きたてをお受け取りください。'
                            : 'Explore our collection of handcrafted breads, each made with care and the finest ingredients. Select items are available for local pickup each week—subscribe to our mailing list to receive our current offerings and reserve your favourites fresh from the oven.'}
                    </p>
                </div>
                <button
                    className={s['language-toggle']}
                    onClick={() => setLanguage(isJapanese ? 'en' : 'ja')}
                >
                    {isJapanese ? 'English' : '日本語'}
                </button>
            </div>

            {/* Filters */}
            <div className={s['filters']}>
                <button
                    className={`${s['filter-btn']} ${filters.dairyFree ? s['filter-active'] : ''}`}
                    onClick={() => setFilters({ ...filters, dairyFree: !filters.dairyFree })}
                >
                    {isJapanese ? '乳製品不使用' : 'Dairy Free'}
                </button>

                <select
                    className={s['filter-select']}
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="all">{isJapanese ? 'すべてのカテゴリー' : 'All Categories'}</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {isJapanese
                                ? products.find(p => p.category_name_en === cat)?.category_name_ja
                                : cat}
                        </option>
                    ))}
                </select>

                {(filters.dairyFree || filters.category !== 'all') && (
                    <button
                        className={s['filter-clear']}
                        onClick={() => setFilters({ dairyFree: false, category: 'all' })}
                    >
                        {isJapanese ? 'クリア' : 'Clear'}
                    </button>
                )}
            </div>

            <div className={g['grid-container']}>
                {filteredProducts.map(product => (
                    <div key={product.product_id} className={g['col-4']}>
                        <div className={s['product-card']}>
                            {product.image ? (
                                <img
                                    className={s['product-image']}
                                    src={`${API_BASE_URL}/products/images/${product.image}`}
                                    alt={isJapanese ? product.name_ja : product.name_en}
                                />
                            ) : (
                                <div className={s['image-placeholder']}>
                                    <img src="/images/22Artboard 8.png" alt="Coming soon" />
                                    <span>{isJapanese ? '画像準備中' : 'Image coming soon'}</span>
                                </div>
                            )}
                            <div className={s['product-content']}>
                                <span className={s['product-category']}>
                                    {isJapanese ? product.category_name_ja : product.category_name_en}
                                </span>
                                <h4 className={s['product-name-primary']}>
                                    {isJapanese ? product.name_ja : product.name_en}
                                </h4>
                                <p className={s['product-name-secondary']}>
                                    {isJapanese ? product.name_en : product.name_ja}
                                </p>
                                <p className={s['product-price']}>¥{product.price}</p>

                                <div className={s['allergens']}>
                                    {product.contains_dairy === 1 && (
                                        <span className={s['allergen-tag']}>{isJapanese ? '乳製品' : 'Dairy'}</span>
                                    )}
                                    {product.contains_eggs === 1 && (
                                        <span className={s['allergen-tag']}>{isJapanese ? '卵' : 'Eggs'}</span>
                                    )}
                                    {product.contains_nuts === 1 && (
                                        <span className={s['allergen-tag']}>{isJapanese ? 'ナッツ' : 'Nuts'}</span>
                                    )}
                                </div>

                                <div className={s['product-actions']}>
                                    <Link to={`/products/${product.product_id}`} className={s['view-button']}>
                                        {isJapanese ? '詳細を見る' : 'View Details'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default AllProducts;
