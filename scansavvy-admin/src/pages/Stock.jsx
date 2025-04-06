import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "../css/Stock.css";

const Stock = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [expandedRows, setExpandedRows] = useState({});
  const [imageUrl, setImageUrl] = useState("");

  // Default categories
  const defaultCategories = [
    "Clothing",
    "Footwear",
    "Accessories",
    "Electronics",
  ];
  const [availableCategories, setAvailableCategories] =
    useState(defaultCategories);

  // Initial product state
  const initialProductState = {
    title: "",
    subtitle: "",
    price: "",
    original_price: "",
    category: defaultCategories[0],
    qty: "",
    color: "",
    brand: "",
    ratings: 0,
    discount: "0",
    images: [],
    specifications: [{ key: "", value: "" }],
    description: "", // Added description field
  };

  const [currentProduct, setCurrentProduct] = useState(initialProductState);

  // Authentication token retrieval
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch("http://127.0.0.1:8000/api/products/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Transform data to match component's expected format
      const transformedProducts = data.products.map((product) => ({
        id: product._id,
        name: product.title,
        subtitle: product.subtitle || "",
        category: product.category,
        price: product.price,
        original_price: product.original_price || product.price,
        stock: product.qty || 0,
        color: product.color || "",
        brand: product.brand || "",
        discount: product.discount || "0",
        ratings: product.ratings || 0,
        images: product.images || [],
        specifications: product.specifications || [],
        description: product.description || "", // Added description field
        status: determineStatus(product.qty || 0),
      }));

      setProducts(transformedProducts);

      // Update available categories
      const categories = [
        ...new Set(transformedProducts.map((p) => p.category)),
      ];
      setAvailableCategories(
        categories.length > 0 ? categories : defaultCategories
      );

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modified createProduct function for Stock.jsx
  const createProduct = async (productData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Validate required fields
      if (!productData.title || !productData.price || !productData.qty) {
        throw new Error("Missing required fields");
      }

      // Transform specifications from {key, value} format to {key: value} format
      const transformedSpecs = productData.specifications
        .filter((spec) => spec.key && spec.value) // Only include specs with both key and value
        .map((spec) => ({ [spec.key]: spec.value }));

      const response = await fetch("http://127.0.0.1:8000/api/products/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: productData.title,
          subtitle: productData.subtitle || "",
          price: parseFloat(productData.price),
          original_price: parseFloat(
            productData.original_price || productData.price
          ),
          category: productData.category,
          qty: parseInt(productData.qty),
          color: productData.color || "Default",
          brand: productData.brand || "",
          discount: productData.discount || "0",
          ratings: parseFloat(productData.ratings) || 0,
          images: productData.images || [],
          specifications: transformedSpecs,
          description: productData.description || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! Status: ${response.status}`
        );
      }

      await fetchProducts();
      return true;
    } catch (err) {
      setError(`Failed to create product: ${err.message}`);
      console.error("Error creating product:", err);
      return false;
    }
  };

  // Modified updateProduct function for Stock.jsx
  const updateProduct = async (id, productData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Validate required fields
      if (!productData.title || !productData.price || !productData.qty) {
        throw new Error("Missing required fields");
      }

      // Transform specifications from {key, value} format to {key: value} format
      const transformedSpecs = productData.specifications
        .filter((spec) => spec.key && spec.value) // Only include specs with both key and value
        .map((spec) => ({ [spec.key]: spec.value }));

      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: productData.title,
          subtitle: productData.subtitle || "",
          price: parseFloat(productData.price),
          original_price: parseFloat(
            productData.original_price || productData.price
          ),
          category: productData.category,
          qty: parseInt(productData.qty),
          color: productData.color || "Default",
          brand: productData.brand || "",
          discount: productData.discount || "0",
          ratings: parseFloat(productData.ratings) || 0,
          images: productData.images || [],
          specifications: transformedSpecs,
          description: productData.description || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! Status: ${response.status}`
        );
      }

      await fetchProducts();
      return true;
    } catch (err) {
      setError(`Failed to update product: ${err.message}`);
      console.error("Error updating product:", err);
      return false;
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! Status: ${response.status}`
        );
      }

      // Update local state after successful deletion
      setProducts(products.filter((product) => product.id !== id));
      return true;
    } catch (err) {
      setError(`Failed to delete product: ${err.message}`);
      console.error("Error deleting product:", err);
      return false;
    }
  };

  // Utility Functions
  const determineStatus = (qty) => {
    if (qty <= 0) return "Out of Stock";
    if (qty <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "In Stock":
        return "status-in-stock";
      case "Low Stock":
        return "status-low-stock";
      case "Out of Stock":
        return "status-out-of-stock";
      default:
        return "";
    }
  };

  // Image and Specification Handlers
  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setCurrentProduct({
        ...currentProduct,
        images: [...currentProduct.images, imageUrl.trim()],
      });
      setImageUrl("");
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...currentProduct.images];
    updatedImages.splice(index, 1);
    setCurrentProduct({
      ...currentProduct,
      images: updatedImages,
    });
  };

  const addSpecification = () => {
    setCurrentProduct({
      ...currentProduct,
      specifications: [
        ...currentProduct.specifications,
        { key: "", value: "" },
      ],
    });
  };

  const updateSpecification = (index, field, value) => {
    const updatedSpecs = [...currentProduct.specifications];
    updatedSpecs[index][field] = value;
    setCurrentProduct({
      ...currentProduct,
      specifications: updatedSpecs,
    });
  };

  const removeSpecification = (index) => {
    const updatedSpecs = [...currentProduct.specifications];
    updatedSpecs.splice(index, 1);
    setCurrentProduct({
      ...currentProduct,
      specifications: updatedSpecs,
    });
  };

  // Form Handlers
  const handleAddNew = () => {
    setFormMode("add");
    setCurrentProduct(initialProductState);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setFormMode("edit");
    setCurrentProduct({
      id: product.id,
      title: product.name,
      subtitle: product.subtitle,
      price: product.price.toString(),
      original_price: product.original_price.toString(),
      category: product.category,
      qty: product.stock.toString(),
      color: product.color || "",
      brand: product.brand || "",
      discount: product.discount || "0",
      ratings: product.ratings || 0,
      images: product.images || [],
      specifications:
        product.specifications?.length > 0
          ? product.specifications
          : [{ key: "", value: "" }],
      description: product.description || "", // Added description field
    });
    setShowForm(true);
  };

  const handleSaveProduct = async () => {
    // Validation checks
    if (!currentProduct.title || !currentProduct.price || !currentProduct.qty) {
      setError(
        "Please fill in all required fields (Title, Price, and Quantity)"
      );
      return;
    }

    try {
      let success;

      if (formMode === "add") {
        success = await createProduct(currentProduct);
      } else {
        success = await updateProduct(currentProduct.id, currentProduct);
      }

      if (success) {
        setShowForm(false);
        setCurrentProduct(initialProductState);
        setError(null);
      }
    } catch (err) {
      setError(`Failed to save product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(id);
      if (success) {
        // Show success message
        alert("Product deleted successfully");
      }
    }
  };

  // Toggle expanded row
  const toggleRowExpand = (productId) => {
    setExpandedRows({
      ...expandedRows,
      [productId]: !expandedRows[productId],
    });
  };

  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (currentProduct.original_price && currentProduct.price) {
      const originalPrice = parseFloat(currentProduct.original_price);
      const currentPrice = parseFloat(currentProduct.price);

      if (originalPrice > currentPrice) {
        const discountPercent = Math.round(
          ((originalPrice - currentPrice) / originalPrice) * 100
        );
        setCurrentProduct({
          ...currentProduct,
          discount: `${discountPercent}%`,
        });
      }
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="app-container">
      <div className="content-container">
        <div className="card">
          {/* Header */}
          <div className="header">
            <div>
              <h1 className="header-title">Product Inventory</h1>
              <p className="header-subtitle">Manage your shop's products</p>
            </div>
            <button onClick={handleAddNew} className="add-button">
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="search-filter-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-icon" size={18} />
            </div>
            <div className="filter-buttons">
              <button className="filter-button">
                <Filter size={18} />
                <span>Filter</span>
              </button>
              <button className="filter-button">
                <ArrowUpDown size={18} />
                <span>Sort</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)} className="close-button">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <p>Loading products...</p>
            </div>
          )}

          {/* Product Form - For both Add and Edit */}
          {showForm && (
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">
                  {formMode === "add" ? "Add New Product" : "Edit Product"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="close-button"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="form-grid">
                {/* Main product details */}
                <div className="form-group">
                  <label className="form-label">Product Title*</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentProduct.title}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentProduct.subtitle}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        subtitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentProduct.brand}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        brand: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={currentProduct.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCurrentProduct({ ...currentProduct, category: value });
                    }}
                  >
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>

                  {/* Show text input if "Other" is selected */}
                  {currentProduct.category === "other" && (
                    <input
                      type="text"
                      className="form-input mt-2"
                      placeholder="Enter custom category"
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          category: e.target.value,
                        })
                      }
                    />
                  )}
                </div>

                {/* Pricing section */}
                <div className="form-group">
                  <label className="form-label">Current Price*</label>
                  <input
                    type="number"
                    className="form-input"
                    value={currentProduct.price}
                    onChange={(e) => {
                      setCurrentProduct({
                        ...currentProduct,
                        price: e.target.value,
                      });
                      if (currentProduct.original_price) {
                        calculateDiscount();
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price</label>
                  <input
                    type="number"
                    className="form-input"
                    value={currentProduct.original_price}
                    onChange={(e) => {
                      setCurrentProduct({
                        ...currentProduct,
                        original_price: e.target.value,
                      });
                      if (currentProduct.price) {
                        calculateDiscount();
                      }
                    }}
                    placeholder="Leave empty if no discount"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentProduct.discount}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        discount: e.target.value,
                      })
                    }
                    placeholder="e.g., 10%"
                  />
                  <small className="form-help-text">
                    Auto-calculated from prices, or enter manually
                  </small>
                </div>

                {/* Inventory section */}
                <div className="form-group">
                  <label className="form-label">Stock Quantity*</label>
                  <input
                    type="number"
                    className="form-input"
                    value={currentProduct.qty}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        qty: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentProduct.color}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        color: e.target.value,
                      })
                    }
                    placeholder="e.g., Red, Blue, Green"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ratings (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="form-input"
                    value={currentProduct.ratings}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        ratings: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Description field - Added new */}
              <div className="form-section">
                <div className="form-section-header">
                  <h3 className="form-section-title">Product Description</h3>
                </div>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Enter product description..."
                  value={currentProduct.description}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {/* Image Links Section */}
              <div className="form-section">
                <div className="form-section-header">
                  <h3 className="form-section-title">Product Images</h3>
                </div>

                <div className="image-input-container">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="add-button"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>

                {currentProduct.images.length > 0 && (
                  <div className="image-list">
                    {currentProduct.images.map((url, index) => (
                      <div key={index} className="image-list-item">
                        <span className="image-url">{url}</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-button"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications section */}
              <div className="form-section">
                <div className="form-section-header">
                  <h3 className="form-section-title">Specifications</h3>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="add-button"
                  >
                    <Plus size={16} />
                    <span>Add Specification</span>
                  </button>
                </div>

                <div className="specifications-container">
                  {currentProduct.specifications.map((spec, index) => (
                    <div key={index} className="specification-row">
                      <div className="spec-input-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Specification name"
                          value={spec.key}
                          onChange={(e) =>
                            updateSpecification(index, "key", e.target.value)
                          }
                        />
                      </div>
                      <div className="spec-input-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Specification value"
                          value={spec.value}
                          onChange={(e) =>
                            updateSpecification(index, "value", e.target.value)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="remove-button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form actions */}
              <div className="form-actions">
                <button
                  onClick={() => setShowForm(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button onClick={handleSaveProduct} className="save-button">
                  {formMode === "add" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Product Table */}
          {!loading && (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th
                      className="table-header-cell"
                      style={{ width: "20px" }}
                    ></th>
                    <th className="table-header-cell">Product</th>
                    <th className="table-header-cell">Category</th>
                    <th className="table-header-cell">Brand</th>
                    <th className="table-header-cell">Price</th>
                    <th className="table-header-cell">Stock</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <tr className="table-row">
                          <td className="table-cell">
                            <button
                              className="expand-button"
                              onClick={() => toggleRowExpand(product.id)}
                              aria-label={
                                expandedRows[product.id]
                                  ? "Collapse row"
                                  : "Expand row"
                              }
                            >
                              {expandedRows[product.id] ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </td>
                          <td className="table-cell">
                            <div className="table-cell-title">
                              {product.name}
                            </div>
                            {product.subtitle && (
                              <div className="table-cell-subtitle">
                                {product.subtitle}
                              </div>
                            )}
                          </td>
                          <td className="table-cell">{product.category}</td>
                          <td className="table-cell">{product.brand || "-"}</td>
                          <td className="table-cell">
                            <div>Rs.{product.price.toFixed(2)}</div>
                            {product.original_price > product.price && (
                              <div className="original-price">
                                Rs.{product.original_price.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="table-cell">{product.stock}</td>
                          <td className="table-cell">
                            <span
                              className={`status-badge ${getStatusClass(
                                product.status
                              )}`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="action-button edit-button"
                              title="Edit product"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="action-button delete-button"
                              title="Delete product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                        {expandedRows[product.id] && (
                          <tr className="expanded-row">
                            <td colSpan="8" className="expanded-content">
                              {/* Product description */}
                              {product.description && (
                                <div className="product-description">
                                  <h4>Description:</h4>
                                  <p>{product.description}</p>
                                </div>
                              )}

                              {/* Product images */}
                              {product.images && product.images.length > 0 ? (
                                <div className="image-gallery">
                                  <h4>Product Images:</h4>
                                  <div className="image-grid">
                                    {product.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="product-image-card"
                                      >
                                        <img
                                          src={image}
                                          alt={`${product.name} - Image ${
                                            index + 1
                                          }`}
                                          className="product-image"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                              "/placeholder-image.jpg";
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="no-images-message">
                                  No images available for this product
                                </div>
                              )}

                              {/* Product specifications */}
                              {product.specifications &&
                                product.specifications.length > 0 &&
                                product.specifications[0].key && (
                                  <div className="product-specifications">
                                    <h4>Specifications:</h4>
                                    <div className="specs-grid">
                                      {product.specifications.map(
                                        (spec, index) => (
                                          <div
                                            key={index}
                                            className="spec-item"
                                          >
                                            <span className="spec-key">
                                              {spec.key}:
                                            </span>
                                            <span className="spec-value">
                                              {spec.value}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-table-message">
                        No products found. Try adjusting your search or add a
                        new product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="empty-state">
              <p>
                No products found in your inventory. Add a new product to get
                started.
              </p>
              <button onClick={handleAddNew} className="add-button">
                <Plus size={18} />
                <span>Add Your First Product</span>
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="pagination">
              <div className="pagination-info">
                Showing{" "}
                <span className="pagination-info-highlight">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="pagination-info-highlight">
                  {products.length}
                </span>{" "}
                products
              </div>
              <div className="pagination-buttons">
                <button className="pagination-button">Previous</button>
                <button className="pagination-button">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;
