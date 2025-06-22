# Inventory Management System - Frontend Development Guide

A comprehensive REST API for managing inventory operations with FIFO tracking, user authentication, and role-based access control.

## 🚀 Quick Start

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## 📋 Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Frontend Integration Examples](#frontend-integration-examples)
- [State Management Recommendations](#state-management-recommendations)
- [UI/UX Guidelines](#uiux-guidelines)

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123",
  "role": "staff" // optional: "admin" or "staff"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

### Get Profile
```http
GET /api/auth/profile
```
*Requires Authentication*

## 📊 API Endpoints

### Members Management

#### Create Member (Admin Only)
```http
POST /api/members
```

**Request Body:**
```json
{
  "name": "ABC Suppliers Ltd",
  "type": "supplier", // "employee", "supplier", "station"
  "category": "Electronics",
  "department": "Procurement",
  "contact_info": "contact@abcsuppliers.com"
}
```

#### Get All Members
```http
GET /api/members?page=1&limit=10&type=supplier&search=ABC
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `type` (string): Filter by member type
- `category` (string): Filter by category
- `department` (string): Filter by department
- `search` (string): Search in name and contact info
- `is_active` (boolean): Filter active/inactive members

#### Get Member by ID
```http
GET /api/members/:id
```

#### Update Member (Admin Only)
```http
PUT /api/members/:id
```

#### Delete Member (Admin Only)
```http
DELETE /api/members/:id
```

### Purchase Management

#### Create Purchase
```http
POST /api/purchases
```

**Request Body:**
```json
{
  "member_id": 1,
  "item_name": "Laptop Dell XPS 13",
  "quantity": 10,
  "rate": 1200.50,
  "description": "Monthly laptop procurement"
}
```

#### Get All Purchases
```http
GET /api/purchases?page=1&limit=10&item_name=laptop&start_date=2024-01-01&end_date=2024-12-31
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `item_name` (string): Filter by item name (partial match)
- `member_id` (number): Filter by supplier
- `start_date`, `end_date` (YYYY-MM-DD): Date range filter

#### Get Purchase by ID
```http
GET /api/purchases/:id
```

### Issue Management

#### Create Issue (FIFO Logic Applied)
```http
POST /api/issues
```

**Request Body:**
```json
{
  "member_id": 2,
  "item_name": "Laptop Dell XPS 13",
  "quantity": 3,
  "description": "Issued to development team"
}
```

**Note:** The system automatically applies FIFO logic, issuing from oldest purchases first.

#### Get All Issues
```http
GET /api/issues?page=1&limit=10&item_name=laptop&member_id=2
```

#### Get Issue by ID
```http
GET /api/issues/:id
```

### Inventory Reports

#### Get Inventory Summary
```http
GET /api/inventory/summary?item_name=laptop
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inventory_summary": [
      {
        "item_name": "Laptop Dell XPS 13",
        "total_purchased": 50,
        "current_stock": 23,
        "total_issued": 27,
        "average_rate": 1200.50,
        "total_value": 60025.00,
        "current_value": 27611.50,
        "first_purchase_date": "2024-01-15",
        "last_purchase_date": "2024-03-20",
        "purchase_batches": 3
      }
    ],
    "low_stock_alerts": [
      {
        "item_name": "Mouse Wireless",
        "current_stock": 2,
        "stock_percentage": 8.33
      }
    ],
    "summary_stats": {
      "total_items": 15,
      "low_stock_items": 3
    }
  }
}
```

#### Get Item History
```http
GET /api/inventory/item/Laptop%20Dell%20XPS%2013/history?page=1&limit=10
```

#### Get Transaction Summary
```http
GET /api/inventory/transactions/summary?start_date=2024-01-01&end_date=2024-12-31&type=purchase
```

### Transactions

#### Get All Transactions
```http
GET /api/transactions?page=1&limit=10&type=purchase&member_id=1
```

#### Get Transaction by ID
```http
GET /api/transactions/:id
```

## 📋 Data Models

### User Model
```typescript
interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}
```

### Member Model
```typescript
interface Member {
  id: number;
  name: string;
  type: 'employee' | 'supplier' | 'station';
  category: string | null;
  department: string | null;
  contact_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Purchase Model
```typescript
interface Purchase {
  id: number;
  transaction_id: number;
  item_name: string;
  quantity: number;
  rate: number;
  remaining_quantity: number;
  purchase_date: string;
  transaction: {
    id: number;
    type: 'purchase';
    member: Member;
    transaction_date: string;
    description: string | null;
  };
}
```

### Issue Model
```typescript
interface Issue {
  id: number;
  transaction_id: number;
  member_id: number;
  purchase_id: number;
  item_name: string;
  quantity: number;
  issue_date: string;
  transaction: {
    id: number;
    type: 'issue';
    member: Member;
    transaction_date: string;
    description: string | null;
  };
  purchase: Purchase;
  member: Member;
}
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_records: number;
      limit: number;
    };
  };
}

interface ValidationError {
  field: string;
  message: string;
  value: any;
}
```

## ⚠️ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be a positive integer",
      "value": -5
    }
  ]
}
```

## 💻 Frontend Integration Examples

### React with Axios

#### Authentication Service
```javascript
// services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.setupInterceptors();
  }

  setupInterceptors() {
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      this.token = response.data.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isAuthenticated() {
    return !!this.token;
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

export default new AuthService();
```

#### Inventory Service
```javascript
// services/inventoryService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const inventoryService = {
  // Get inventory summary
  async getInventorySummary(itemName = '') {
    const params = itemName ? { item_name: itemName } : {};
    const response = await axios.get(`${API_BASE_URL}/inventory/summary`, { params });
    return response.data;
  },

  // Get all purchases with pagination
  async getPurchases(page = 1, limit = 10, filters = {}) {
    const params = { page, limit, ...filters };
    const response = await axios.get(`${API_BASE_URL}/purchases`, { params });
    return response.data;
  },

  // Create new purchase
  async createPurchase(purchaseData) {
    const response = await axios.post(`${API_BASE_URL}/purchases`, purchaseData);
    return response.data;
  },

  // Create new issue
  async createIssue(issueData) {
    const response = await axios.post(`${API_BASE_URL}/issues`, issueData);
    return response.data;
  },

  // Get all members
  async getMembers(filters = {}) {
    const response = await axios.get(`${API_BASE_URL}/members`, { params: filters });
    return response.data;
  }
};
```

#### React Hook for Inventory Data
```javascript
// hooks/useInventory.js
import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = async (itemName = '') => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventorySummary(itemName);
      setInventory(response.data.inventory_summary);
      setLowStockItems(response.data.low_stock_alerts);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    lowStockItems,
    loading,
    error,
    refetch: fetchInventory
  };
};
```

### React Component Examples

#### Dashboard Component
```jsx
// components/Dashboard.jsx
import React from 'react';
import { useInventory } from '../hooks/useInventory';

const Dashboard = () => {
  const { inventory, lowStockItems, loading, error } = useInventory();

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Inventory Dashboard</h1>
      
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="alert alert-warning">
          <h3>Low Stock Alerts ({lowStockItems.length})</h3>
          <ul>
            {lowStockItems.map(item => (
              <li key={item.item_name}>
                {item.item_name}: {item.current_stock} remaining ({item.stock_percentage}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inventory Summary */}
      <div className="inventory-grid">
        {inventory.map(item => (
          <div key={item.item_name} className="inventory-card">
            <h3>{item.item_name}</h3>
            <div className="stats">
              <div>Current Stock: <strong>{item.current_stock}</strong></div>
              <div>Total Purchased: {item.total_purchased}</div>
              <div>Total Issued: {item.total_issued}</div>
              <div>Current Value: ${item.current_value}</div>
              <div>Average Rate: ${item.average_rate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
```

#### Purchase Form Component
```jsx
// components/PurchaseForm.jsx
import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';

const PurchaseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    item_name: '',
    quantity: '',
    rate: '',
    description: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch suppliers
    const fetchSuppliers = async () => {
      try {
        const response = await inventoryService.getMembers({ type: 'supplier' });
        setSuppliers(response.data.members);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await inventoryService.createPurchase({
        ...formData,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate)
      });
      
      setFormData({
        member_id: '',
        item_name: '',
        quantity: '',
        rate: '',
        description: ''
      });
      
      onSuccess?.();
    } catch (error) {
      if (error.errors) {
        const errorMap = {};
        error.errors.forEach(err => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="purchase-form">
      <h2>Create Purchase</h2>
      
      <div className="form-group">
        <label>Supplier:</label>
        <select
          name="member_id"
          value={formData.member_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        {errors.member_id && <span className="error">{errors.member_id}</span>}
      </div>

      <div className="form-group">
        <label>Item Name:</label>
        <input
          type="text"
          name="item_name"
          value={formData.item_name}
          onChange={handleChange}
          required
        />
        {errors.item_name && <span className="error">{errors.item_name}</span>}
      </div>

      <div className="form-group">
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
        />
        {errors.quantity && <span className="error">{errors.quantity}</span>}
      </div>

      <div className="form-group">
        <label>Rate:</label>
        <input
          type="number"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
        {errors.rate && <span className="error">{errors.rate}</span>}
      </div>

      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Purchase'}
      </button>
    </form>
  );
};

export default PurchaseForm;
```

## 🗂️ State Management Recommendations

### Redux Toolkit Setup
```javascript
// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: authService.getCurrentUser(),
    token: authService.token,
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

## 🎨 UI/UX Guidelines

### Recommended Pages/Components

1. **Authentication**
   - Login Page
   - Registration Page (Admin only)
   - Profile Page

2. **Dashboard**
   - Inventory Overview
   - Low Stock Alerts
   - Recent Transactions
   - Quick Actions

3. **Inventory Management**
   - Inventory List with Search/Filter
   - Item Details with History
   - Stock Level Indicators

4. **Purchase Management**
   - Purchase List
   - Create Purchase Form
   - Purchase Details

5. **Issue Management**
   - Issue List
   - Create Issue Form
   - Issue Details

6. **Member Management**
   - Member List (Suppliers, Employees, Stations)
   - Create/Edit Member Forms
   - Member Details

7. **Reports**
   - Inventory Summary
   - Transaction History
   - Low Stock Report
   - Export Functionality

### UI Components Suggestions

#### Status Indicators
```jsx
const StockStatus = ({ currentStock, totalPurchased }) => {
  const percentage = (currentStock / totalPurchased) * 100;
  
  const getStatusColor = () => {
    if (percentage < 10) return 'red';
    if (percentage < 25) return 'orange';
    return 'green';
  };

  return (
    <div className={`stock-status ${getStatusColor()}`}>
      <div className="stock-bar">
        <div 
          className="stock-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span>{currentStock} / {totalPurchased}</span>
    </div>
  );
};
```

#### Data Tables with Pagination
```jsx
const DataTable = ({ data, columns, pagination, onPageChange }) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          disabled={pagination.current_page === 1}
          onClick={() => onPageChange(pagination.current_page - 1)}
        >
          Previous
        </button>
        
        <span>
          Page {pagination.current_page} of {pagination.total_pages}
        </span>
        
        <button 
          disabled={pagination.current_page === pagination.total_pages}
          onClick={() => onPageChange(pagination.current_page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

## 🔧 Development Tips

1. **Environment Variables**
   ```javascript
   // .env
   REACT_APP_API_BASE_URL=http://localhost:3000/api
   REACT_APP_APP_NAME=Inventory Management System
   ```

2. **Error Boundary**
   ```jsx
   class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }

     static getDerivedStateFromError(error) {
       return { hasError: true };
     }

     componentDidCatch(error, errorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
     }

     render() {
       if (this.state.hasError) {
         return <h1>Something went wrong.</h1>;
       }
       return this.props.children;
     }
   }
   ```

3. **Protected Routes**
   ```jsx
   const ProtectedRoute = ({ children, adminOnly = false }) => {
     const isAuthenticated = authService.isAuthenticated();
     const isAdmin = authService.isAdmin();

     if (!isAuthenticated) {
       return <Navigate to="/login" />;
     }

     if (adminOnly && !isAdmin) {
       return <Navigate to="/unauthorized" />;
     }

     return children;
   };
   ```

## 📱 Mobile Responsiveness

Ensure your frontend is mobile-responsive:
- Use CSS Grid/Flexbox for layouts
- Implement touch-friendly buttons (minimum 44px)
- Consider mobile-first design approach
- Test on various screen sizes

## 🚀 Performance Optimization

1. **Lazy Loading**
   ```jsx
   const Dashboard = lazy(() => import('./components/Dashboard'));
   const PurchaseForm = lazy(() => import('./components/PurchaseForm'));
   ```

2. **Memoization**
   ```jsx
   const InventoryCard = React.memo(({ item }) => {
     return (
       <div className="inventory-card">
         {/* Card content */}
       </div>
     );
   });
   ```

3. **Debounced Search**
   ```jsx
   const useDebounce = (value, delay) => {
     const [debouncedValue, setDebouncedValue] = useState(value);

     useEffect(() => {
       const handler = setTimeout(() => {
         setDebouncedValue(value);
       }, delay);

       return () => {
         clearTimeout(handler);
       };
     }, [value, delay]);

     return debouncedValue;
   };
   ```

## 📞 Support

For API-related questions or issues:
- Check the server logs for detailed error information
- Ensure proper authentication headers are included
- Validate request payloads against the documented schemas
- Test endpoints using tools like Postman or curl

---

**Happy coding! 🚀**