import React, { useState, useEffect } from 'react';
import { Search, Check, X, ChevronDown, Filter } from 'lucide-react';
import '../css/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [productDetails, setProductDetails] = useState({});

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Status options
  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const filterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Fetch product details for a given product ID
  const fetchProductDetails = async (productId) => {
    try {
      const token = getToken();
      
      if (!token) {
        return null;
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching product details for ${productId}:`, error);
      return null;
    }
  };

  // Fetch orders from API with specific status if filter is applied
  const fetchOrders = async (status = 'All') => {
    setIsLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        setErrorMessage('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Using the appropriate endpoint based on filter
      const endpoint = status === 'All' 
        ? 'http://127.0.0.1:8000/api/payment/shop-orders'
        : `http://127.0.0.1:8000/api/payment/shop-orders/${status}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        setErrorMessage('Session expired. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.message && (data.message === "No orders found for this shop." || 
                           data.message.includes("No orders with status"))) {
        setOrders([]);
        setFilteredOrders([]);
        setIsLoading(false);
        return;
      }
      
      const paymentsData = data.payments || [];
      
      // Create a temporary product details cache
      const tempProductDetails = { ...productDetails };
      
      // Fetch product details for each product in each payment
      for (const payment of paymentsData) {
        if (payment.products && payment.products.length > 0) {
          for (const product of payment.products) {
            if (product.product_id && !tempProductDetails[product.product_id]) {
              // Check if product has name, if not, fetch it
              if (!product.name) {
                const productDetail = await fetchProductDetails(product.product_id);
                if (productDetail) {
                  tempProductDetails[product.product_id] = productDetail;
                }
              }
            }
          }
        }
      }
      
      // Update the product details state
      setProductDetails(tempProductDetails);
      setOrders(paymentsData);
      setFilteredOrders(paymentsData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Failed to load orders. Please try again later.');
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
      return;
    }
    
    const filtered = orders.filter(order => {
      // Check order ID
      const orderIdMatch = order.transaction_id && 
        order.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check product names, using both local data and fetched product details
      const productMatch = order.products && order.products.some(product => {
        // Check if product has name directly
        if (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
        
        // Check product details if we have them
        const productDetail = productDetails[product.product_id];
        return productDetail && 
          productDetail.name && 
          productDetail.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Check shipping address
      const addressMatch = order.shipping_address && 
        order.shipping_address.address && 
        order.shipping_address.address.toLowerCase().includes(searchTerm.toLowerCase());
        
      return orderIdMatch || productMatch || addressMatch;
    });
    
    setFilteredOrders(filtered);
  }, [searchTerm, orders, productDetails]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleStatusDropdown = (orderId) => {
    if (statusDropdownOpen === orderId) {
      setStatusDropdownOpen(null);
    } else {
      setStatusDropdownOpen(orderId);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Close the dropdown
    setStatusDropdownOpen(null);
    
    try {
      const token = getToken();
      
      if (!token) {
        setErrorMessage('Authentication required. Please log in again.');
        return;
      }
      
      // Using the update-status endpoint from your payment_routes.py
      const response = await fetch(`http://127.0.0.1:8000/api/payment/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.status === 401) {
        setErrorMessage('Session expired. Please log in again.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSuccessMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Failed to update order status. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    // Fetch orders with the selected filter
    fetchOrders(filter);
  };

  // Format currency to LKR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount / 100); // Assuming amount is stored in cents
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Shipped': return 'status-shipped';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  // Get product names for an order
  const getProductNames = (products) => {
    if (!products || products.length === 0) return 'N/A';
    
    return products.map(product => {
      // First check if product has name property
      if (product.name) {
        return product.name;
      }
      
      // If not, check our productDetails cache
      const productDetail = productDetails[product.product_id];
      if (productDetail && productDetail.name) {
        return productDetail.name;
      }
      
      // If we still don't have a name, return the product ID as fallback
      return `Product ID: ${product.product_id}`;
    }).join(', ');
  };

  // Get customer name from shipping address
  const getCustomerName = (order) => {
    if (order.shipping_address) {
      return order.shipping_address.name || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="orders-management-container">
      <div className="orders-management-wrapper">
        <div className="orders-management-header">
          <div className="header-title">
            <h1>Order Management</h1>
            <p>View and manage customer orders</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total Orders:</span>
              <span className="stat-value">{orders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Orders:</span>
              <span className="stat-value">{orders.filter(order => order.status === 'Pending').length}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="success-message">
            <Check size={20} />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="error-message">
            <X size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Controls */}
        <div className="orders-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by order ID, product or customer..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <div className="filter-dropdown">
            <button className="filter-button">
              <Filter size={18} />
              <span>Filter: {selectedFilter}</span>
              <ChevronDown size={16} />
            </button>
            <div className="filter-options">
              {filterOptions.map(option => (
                <div 
                  key={option} 
                  className={`filter-option ${selectedFilter === option ? 'selected' : ''}`}
                  onClick={() => handleFilterChange(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {isLoading ? (
            <div className="loading-indicator">Loading orders...</div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Products</th>
                  <th>Date</th>
                  <th>Address</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.transaction_id || order._id}</td>
                      <td>{getProductNames(order.products)}</td>
                      <td>{order.created_at ? formatDate(order.created_at) : 'N/A'}</td>
                      <td>{order.shipping_address ? `${order.shipping_address.city}, ${order.shipping_address.country}` : 'N/A'}</td>
                      <td>{formatCurrency(order.amount)}</td>
                      <td>{order.payment_method || 'N/A'}</td>
                      <td>
                        <div className="status-dropdown-container">
                          <div 
                            className={`status-badge ${getStatusBadgeClass(order.status)}`}
                            onClick={() => toggleStatusDropdown(order._id)}
                          >
                            {order.status}
                            <ChevronDown size={14} />
                          </div>
                          {statusDropdownOpen === order._id && (
                            <div className="status-dropdown">
                              {statusOptions.map(status => (
                                <div
                                  key={status}
                                  className={`status-option ${status === order.status ? 'current' : ''}`}
                                  onClick={() => handleStatusChange(order._id, status)}
                                >
                                  {status}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;