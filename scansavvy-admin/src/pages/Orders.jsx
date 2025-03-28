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

  
  // Status options
  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const filterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Fetch orders from API
//   const fetchOrders = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/orders');
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       setOrders(data.orders || []);
//       setFilteredOrders(data.orders || []);
//       setIsLoading(false);
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//       setErrorMessage('Failed to load orders. Please try again later.');
//       setIsLoading(false);
//     }
//   };

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, []);

const mockOrders = [
    {
      _id: '1001',
      orderId: 'ORD-2023-1001',
      productName: 'Premium Wireless Headphones',
      date: '2023-03-15T08:30:00',
      customerName: 'John Doe',
      totalAmount: 129.99,
      paymentMethod: 'Credit Card',
      status: 'Delivered'
    },
    {
      _id: '1002',
      orderId: 'ORD-2023-1002',
      productName: 'Smart Fitness Watch',
      date: '2023-03-16T10:15:00',
      customerName: 'Sarah Johnson',
      totalAmount: 89.95,
      paymentMethod: 'PayPal',
      status: 'Shipped'
    },
    {
      _id: '1003',
      orderId: 'ORD-2023-1003',
      productName: 'Ultra HD Monitor',
      date: '2023-03-16T14:45:00',
      customerName: 'Michael Chen',
      totalAmount: 349.99,
      paymentMethod: 'Credit Card',
      status: 'Processing'
    },
    {
      _id: '1004',
      orderId: 'ORD-2023-1004',
      productName: 'Bluetooth Speaker',
      date: '2023-03-17T09:20:00',
      customerName: 'Emma Wilson',
      totalAmount: 59.99,
      paymentMethod: 'Debit Card',
      status: 'Pending'
    },
    {
      _id: '1005',
      orderId: 'ORD-2023-1005',
      productName: 'Mechanical Keyboard',
      date: '2023-03-18T11:30:00',
      customerName: 'David Brown',
      totalAmount: 149.95,
      paymentMethod: 'Credit Card',
      status: 'Cancelled'
    }
  ];
  
  // Replace the fetchOrders function with this for testing:
  const fetchOrders = async () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  };

  // Filter orders based on search term and status filter
  useEffect(() => {
    let filtered = orders;
    
    // Apply status filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, orders, selectedFilter]);

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
      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
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
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
                  <th>Product Name</th>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>{order.productName}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>{order.customerName}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>{order.paymentMethod}</td>
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