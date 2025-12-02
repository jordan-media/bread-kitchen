import React, { useState, useEffect } from "react";
import m from "./AddProductModalContent.module.css";
import g from "../global.module.css";
 
function AddProductModalContent({ onClose, onProductAdded }) {
 
    // State to hold the categories from the API
    const [dbCategories, setDbCategories] = useState([]);
 
    // State to hold the product info
    const [categoryId, setCategoryId] = useState("");
    const [nameJa, setNameJa] = useState("");
    const [nameEn, setNameEn] = useState("");
    const [descriptionJa, setDescriptionJa] = useState("");
    const [descriptionEn, setDescriptionEn] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [methodType, setMethodType] = useState("");
    const [image, setImage] = useState(null);
 
    // Allergen checkboxes
    const [containsNuts, setContainsNuts] = useState(false);
    const [containsSesame, setContainsSesame] = useState(false);
    const [containsDairy, setContainsDairy] = useState(false);
    const [containsEggs, setContainsEggs] = useState(false);
    const [isSeasonal, setIsSeasonal] = useState(false);
 
    // State for new category option
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryNameJa, setNewCategoryNameJa] = useState("");
    const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
    const [newCategorySlug, setNewCategorySlug] = useState("");
 
    // Load categories from API on initial render
    useEffect(() => {
        fetch("http://localhost:3000/categories")
            .then((res) => res.json())
            .then((data) => {
                setDbCategories(data);
                if (data.length > 0) {
                    setCategoryId(data[0].category_id);
                }
            })
            .catch(err => console.error("Error loading categories:", err));
    }, []);
 
    // Toggle between select and input for categories
    const handleCategorySelectChange = (e) => {
        if (e.target.value === "-1") {
            setIsNewCategory(true);
            setCategoryId("");
        } else {
            setIsNewCategory(false);
            setCategoryId(e.target.value);
        }
    };
 
    // Send the form data to the API
    const handleFormSubmit = async (event) => {
        event.preventDefault();

        let category_id = categoryId;
 
        // If category is new, create it first
        if (isNewCategory) {
            const categoryResponse = await fetch("http://localhost:3000/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name_ja: newCategoryNameJa,
                    name_en: newCategoryNameEn,
                    slug: newCategorySlug
                }),
            });
 
            const categoryData = await categoryResponse.json();
            category_id = categoryData.id;
        }
 
        // Create FormData object for product data including image
        const formData = new FormData();
        formData.append("category_id", category_id);
        formData.append("name_ja", nameJa);
        formData.append("name_en", nameEn);
        formData.append("description_ja", descriptionJa);
        formData.append("description_en", descriptionEn);
        formData.append("base_price", basePrice);
        formData.append("has_variants", "false"); // Simple mode - no variants
        formData.append("method_type", methodType);
        formData.append("contains_nuts", containsNuts);
        formData.append("contains_sesame", containsSesame);
        formData.append("contains_dairy", containsDairy);
        formData.append("contains_eggs", containsEggs);
        formData.append("is_seasonal", isSeasonal);
        
        if (image) {
            formData.append("image", image);
        }
 
        // Send POST request to create new product
        const productResponse = await fetch("http://localhost:3000/products", {
            method: "POST",
            body: formData
        });
 
        const productResult = await productResponse.json();
        console.log("Success:", productResult);
 
        // Refresh product list
        onProductAdded();
 
        // Close modal
        onClose();
    };
 
    return (
        <div className={m['modal-container']}>
            <div className={`${m['modal']} ${g['card']}`}>
                <h3>Add New Product</h3>
                <form 
                    className={`${g['form-group']} ${g['grid-container']}`} 
                    onSubmit={handleFormSubmit} 
                    encType="multipart/form-data"
                >
                    {/* Category Selection */}
                    <div className={g['col-6']}>
                        <label htmlFor="category">Category</label>
                        {!isNewCategory ? (
                            <select
                                name="category"
                                id="category"
                                value={categoryId}
                                onChange={handleCategorySelectChange}
                                required
                            >
                                {dbCategories.map((category) => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.name_en}
                                    </option>
                                ))}
                                <option value="-1">+ New Category +</option>
                            </select>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="Category Name (English)"
                                    value={newCategoryNameEn}
                                    onChange={(e) => setNewCategoryNameEn(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Category Name (Japanese)"
                                    value={newCategoryNameJa}
                                    onChange={(e) => setNewCategoryNameJa(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Slug (e.g., sweet-breads)"
                                    value={newCategorySlug}
                                    onChange={(e) => setNewCategorySlug(e.target.value)}
                                    required
                                />
                                <button 
                                    type="button"
                                    className={`${g['button']} ${m['modal__show-list']}`} 
                                    onClick={() => setIsNewCategory(false)}
                                >
                                    Show List
                                </button>
                            </>
                        )}
                    </div>

                    {/* Method Type */}
                    <div className={g['col-6']}>
                        <label htmlFor="method">Method</label>
                        <select
                            name="method"
                            id="method"
                            value={methodType}
                            onChange={(e) => setMethodType(e.target.value)}
                        >
                            <option value="">Select Method</option>
                            <option value="yudane">Yudane</option>
                            <option value="straight">Straight</option>
                            <option value="long_ferment">Long Fermentation</option>
                            <option value="natural_yeast">Natural Yeast</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>

                    {/* Product Names */}
                    <div className={g['col-6']}>
                        <label htmlFor="name_en">Name (English)</label>
                        <input
                            type="text"
                            name="name_en"
                            id="name_en"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            required
                        />
                    </div>

                    <div className={g['col-6']}>
                        <label htmlFor="name_ja">Name (Japanese)</label>
                        <input
                            type="text"
                            name="name_ja"
                            id="name_ja"
                            value={nameJa}
                            onChange={(e) => setNameJa(e.target.value)}
                            required
                        />
                    </div>

                    {/* Price */}
                    <div className={g['col-6']}>
                        <label htmlFor="price">Base Price (¥)</label>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            step="0.01"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div className={g['col-6']}>
                        <label htmlFor="image">Image</label>
                        <input 
                            type="file"
                            name="image"
                            id="image"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])} 
                        />
                    </div>

                    {/* Description English */}
                    <div className={g['col-12']}>
                        <label htmlFor="description_en">Description (English)</label>
                        <textarea
                            name="description_en"
                            id="description_en"
                            rows="3"
                            value={descriptionEn}
                            onChange={(e) => setDescriptionEn(e.target.value)}
                        />
                    </div>

                    {/* Description Japanese */}
                    <div className={g['col-12']}>
                        <label htmlFor="description_ja">Description (Japanese)</label>
                        <textarea
                            name="description_ja"
                            id="description_ja"
                            rows="3"
                            value={descriptionJa}
                            onChange={(e) => setDescriptionJa(e.target.value)}
                        />
                    </div>

                    {/* Allergen Checkboxes */}
                    <div className={g['col-12']}>
                        <fieldset className={m['allergen-fieldset']}>
                            <legend>Contains:</legend>
                            <label className={m['checkbox-label']}>
                                <input
                                    type="checkbox"
                                    checked={containsNuts}
                                    onChange={(e) => setContainsNuts(e.target.checked)}
                                />
                                Nuts
                            </label>
                            <label className={m['checkbox-label']}>
                                <input
                                    type="checkbox"
                                    checked={containsSesame}
                                    onChange={(e) => setContainsSesame(e.target.checked)}
                                />
                                Sesame
                            </label>
                            <label className={m['checkbox-label']}>
                                <input
                                    type="checkbox"
                                    checked={containsDairy}
                                    onChange={(e) => setContainsDairy(e.target.checked)}
                                />
                                Dairy
                            </label>
                            <label className={m['checkbox-label']}>
                                <input
                                    type="checkbox"
                                    checked={containsEggs}
                                    onChange={(e) => setContainsEggs(e.target.checked)}
                                />
                                Eggs
                            </label>
                            <label className={m['checkbox-label']}>
                                <input
                                    type="checkbox"
                                    checked={isSeasonal}
                                    onChange={(e) => setIsSeasonal(e.target.checked)}
                                />
                                Seasonal
                            </label>
                        </fieldset>
                    </div>

                    {/* Submit Button */}
                    <div className={g['col-12']}>
                        <button className={g['button']} type="submit">
                            Add Product
                        </button>
                    </div>
                </form>
                <button onClick={onClose} className={m["modal__close-button"]}>×</button>
            </div>
        </div>
    );
}
 
export default AddProductModalContent;
