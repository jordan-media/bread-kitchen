import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

import g from '../global.module.css';
import p from './Product.module.css';
import { API_BASE_URL } from '../api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

function Product() {
    const { t } = useTranslation('products');
    const { t: tCommon } = useTranslation('common');
    const { language } = useLanguage();
    const isJapanese = language === 'ja';

    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch product data from API
    useEffect(() => {
        fetch(`${API_BASE_URL}/products/${id}`)
            .then(response => response.json())
            .then((jsonData) => {
                console.log(jsonData);
                setProductData(jsonData);

                // Set default selected variant if product has variants
                if (jsonData.has_variants && jsonData.variants.length > 0) {
                    setSelectedVariant(jsonData.variants[0]);
                }
            })
            .catch(err => console.error("Error fetching product:", err));
    }, [id]);

    // Handle variant selection change
    const handleVariantChange = (e) => {
        const variantId = parseInt(e.target.value);
        const variant = productData.variants.find(v => v.variant_id === variantId);
        setSelectedVariant(variant);
    };

    // Get current price to display
    const getCurrentPrice = () => {
        if (productData.has_variants && selectedVariant) {
            return `¥${selectedVariant.price_jpy}`;
        }
        return `¥${productData.base_price}`;
    };

    // Handle image navigation
    const nextImage = () => {
        if (productData.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % productData.images.length);
        }
    };

    const prevImage = () => {
        if (productData.images.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? productData.images.length - 1 : prev - 1
            );
        }
    };

    // Loading state
    if (!productData) {
        return (
            <main className={g['container']}>
                <p>{tCommon('buttons.loading')}</p>
            </main>
        );
    }

    return (
        <main className={g['container']}>
            <div className={g['grid-container']}>
                <div className={g['col-4']}>
                    {/* Image display */}
                    <div className={p['image-container']}>
                        {productData.images && productData.images.length > 0 ? (
                            <>
                                <img
                                    src={`/assets/${productData.images[currentImageIndex].image_path}`}
                                    alt={isJapanese
                                        ? (productData.images[currentImageIndex].alt_text_ja || productData.name_ja)
                                        : (productData.images[currentImageIndex].alt_text_en || productData.name_en)
                                    }
                                />
                                {productData.images.length > 1 && (
                                    <div className={p['image-nav']}>
                                        <button onClick={prevImage} className={`${g['button']} ${g['small']}`}>←</button>
                                        <span>{currentImageIndex + 1} / {productData.images.length}</span>
                                        <button onClick={nextImage} className={`${g['button']} ${g['small']}`}>→</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <img
                                src={`/assets/placeholder.png`}
                                alt={isJapanese ? productData.name_ja : productData.name_en}
                            />
                        )}
                    </div>

                    {/* Product info summary */}
                    <div className={p['product-meta']}>
                        <p><strong>{t('product.category')}:</strong> {isJapanese ? productData.category_name_ja : productData.category_name_en}</p>
                        {productData.method_type && (
                            <p><strong>{t('product.method')}:</strong> {productData.method_type.replace('_', ' ')}</p>
                        )}

                        {/* Allergen warnings */}
                        <div className={p['allergens']}>
                            <strong>{tCommon('allergens.contains')}:</strong>
                            <ul>
                                {productData.contains_dairy && <li>{tCommon('allergens.dairy')}</li>}
                                {productData.contains_eggs && <li>{tCommon('allergens.eggs')}</li>}
                                {productData.contains_nuts && <li>{tCommon('allergens.nuts')}</li>}
                                {productData.contains_sesame && <li>{tCommon('allergens.sesame')}</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={g['col-8']}>
                    <Link to="/products" className={`${g['button']} ${g['small']}`}>&lt; {t('product.backToProducts')}</Link>

                    <h1 className={`${g["h2"]}`}>{isJapanese ? productData.name_ja : productData.name_en}</h1>
                    <h2 className={p['japanese-name']}>{isJapanese ? productData.name_en : productData.name_ja}</h2>

                    {/* Size selector for products with variants */}
                    {productData.has_variants && productData.variants.length > 0 && (
                        <div className={p['size-selector']}>
                            <label htmlFor="size">{t('product.selectSize')}:</label>
                            <select
                                id="size"
                                value={selectedVariant?.variant_id || ''}
                                onChange={handleVariantChange}
                                className={p['size-dropdown']}
                            >
                                {productData.variants.map(variant => (
                                    <option key={variant.variant_id} value={variant.variant_id}>
                                        {isJapanese
                                            ? `${variant.size_name_ja} (${variant.size_name_en}) - ¥${variant.price_jpy}`
                                            : `${variant.size_name_en} (${variant.size_name_ja}) - ¥${variant.price_jpy}`
                                        }
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Price display */}
                    <p className={p['price']}>{getCurrentPrice()}</p>

                    {/* Stock info for selected variant */}
                    {selectedVariant && (
                        <p className={p['stock-info']}>
                            {selectedVariant.stock_quantity === null
                                ? t('stock.madeToOrder')
                                : selectedVariant.stock_quantity > 0
                                    ? t('stock.inStock', { count: selectedVariant.stock_quantity })
                                    : t('stock.outOfStock')}
                        </p>
                    )}

                    {/* Description */}
                    <div className={p['description']}>
                        <h3>{t('product.description')}</h3>
                        <p>{isJapanese ? productData.description_ja : productData.description_en}</p>
                        <p className={p['description-ja']}>{isJapanese ? productData.description_en : productData.description_ja}</p>
                    </div>

                    {/* Selected variant details */}
                    {selectedVariant && (
                        <div className={p['variant-details']}>
                            <h3>{t('product.productDetails')}</h3>
                            <ul>
                                <li><strong>{t('product.weight')}:</strong> {selectedVariant.weight_g}g</li>
                                <li><strong>{t('product.dimensions')}:</strong> {selectedVariant.dimensions_length_cm} × {selectedVariant.dimensions_width_cm} × {selectedVariant.dimensions_height_cm} cm</li>
                                <li><strong>{t('product.sku')}:</strong> {selectedVariant.sku}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );

}

export default Product;
