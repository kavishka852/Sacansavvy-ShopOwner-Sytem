import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, UserPlus, Check, X, Eye, EyeOff } from 'lucide-react';
import '../css/User.css';

const User = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    status: '1',
    verified: true
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to load users. Please try again later.');
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddUser = () => {
    resetMessages();
    setIsAddingUser(true);
    setIsEditingUser(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      status: '1',
      verified: true
    });
  };

  const handleEditUser = (user) => {
    resetMessages();
    setIsAddingUser(false);
    setIsEditingUser(true);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      password: '',
      status: user.status,
      verified: user.verified
    });
  };

  const handleDeleteUser = async (userId) => {
    resetMessages();
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Refresh the user list
        fetchUsers();
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setErrorMessage('Failed to delete user. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    // Form validation
    if (!formData.username || !formData.name || !formData.email) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    if (isAddingUser && !formData.password) {
      setErrorMessage('Password is required for new users');
      return;
    }

    try {
      let response;
      
      if (isAddingUser) {
        // Create new user
        response = await fetch('http://127.0.0.1:8000/api/user/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      } else if (isEditingUser && selectedUser) {
        // Update existing user - use _id instead of user_id
        response = await fetch(`http://127.0.0.1:8000/api/user/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Success handling
      setSuccessMessage(isAddingUser ? 'User created successfully' : 'User updated successfully');
      
      // Reset form and refresh user list
      cancelForm();
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      setErrorMessage(`Failed to ${isAddingUser ? 'create' : 'update'} user. Please try again.`);
    }
  };

  const cancelForm = () => {
    setIsAddingUser(false);
    setIsEditingUser(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      status: '1',
      verified: true
    });
  };

  const resetMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="user-management-container">
      <div className="user-management-wrapper">
        <div className="user-management-header">
          <div className="header-title">
            <h1>User Management</h1>
            <p>Manage user accounts and permissions</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total Users:</span>
              <span className="stat-value">{users.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Users:</span>
              <span className="stat-value">{users.filter(user => user.status === "1").length}</span>
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
        <div className="user-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, username or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button className="add-user-button" onClick={handleAddUser}>
            <UserPlus size={18} />
            <span>Add User</span>
          </button>
        </div>

        {/* User Form (Add/Edit) */}
        {(isAddingUser || isEditingUser) && (
          <div className="user-form-container">
            <h2>{isAddingUser ? 'Add New User' : 'Edit User'}</h2>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Username<span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name<span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email<span className="required">*</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{isAddingUser ? 'Password' : 'New Password'}<span className={isAddingUser ? "required" : "optional"}>{isAddingUser ? '*' : ' (optional)'}</span></label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required={isAddingUser}
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      name="verified" 
                      checked={formData.verified}
                      onChange={handleInputChange}
                    />
                    Email Verified
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={cancelForm}>Cancel</button>
                <button type="submit" className="submit-button">{isAddingUser ? 'Create User' : 'Update User'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        {(!isAddingUser && !isEditingUser) && (
          <div className="users-table-container">
            {isLoading ? (
              <div className="loading-indicator">Loading users...</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.username}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.status === "1" ? "status-active" : "status-inactive"}`}>
                            {user.status === "1" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <span className={`verified-badge ${user.verified ? "verified-yes" : "verified-no"}`}>
                            {user.verified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>{user.created_at}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-button" onClick={() => handleEditUser(user)}>
                              <Edit size={16} />
                            </button>
                            <button className="delete-button" onClick={() => handleDeleteUser(user._id)}>
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default User;