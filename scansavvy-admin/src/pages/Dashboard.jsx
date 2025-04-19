import React, { useState, useEffect } from "react";
import {
  Home,
  Bell,
  Search,
  Calendar,
  FileText,
  Store,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  Plus,
  Trash2,
} from "lucide-react";
import "../css/Dashboard.css";
import Stock from "./Stock";
import NewsAddScreen from "./News";
import Orders from "./Orders";
import RecentActivity from "./RecentActivity";
import MonthlySalesChart from "./MonthlySalesChart";
import FancyRealTimeClock from "./FancyRealTimeClock";
import "../css/FancyRealTimeClock.css";
import PrintableDocuments from "./PrintableDocuments";
import StockPieChart from './StockPieChart';

// Create a new TaskList component for managing todos
const TaskList = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: 1,
            text: "Process pending orders",
            completed: false,
            date: "Today",
          },
          { id: 2, text: "Update inventory", completed: false, date: "Today" },
          {
            id: 3,
            text: "Review sales reports",
            completed: false,
            date: "Tomorrow",
          },
        ];
  });

  const [newTask, setNewTask] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("Today");

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === "") return;

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      date: newTaskDate,
    };

    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="grid-item tasks">
      <h2>Upcoming Tasks</h2>

      <form onSubmit={addTask} className="add-task-form">
        <div className="task-input-container">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="task-input"
          />

          <select
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="task-date-select"
          >
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="This week">This week</option>
            <option value="Next week">Next week</option>
          </select>

          <button type="submit" className="add-task-btn">
            <Plus size={16} />
          </button>
        </div>
      </form>

      <div className="task-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? "completed" : ""}`}
          >
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                id={`task-${task.id}`}
              />
              <label htmlFor={`task-${task.id}`} className="task-label">
                {task.text}
              </label>
            </div>
            <div className="task-actions">
              <span className="task-date">{task.date}</span>
              <button
                className="delete-task-btn"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardHome = ({ statsData, orders, onCardClick, token }) => (
  <>
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="stat-card"
          onClick={() => onCardClick(stat.redirectTo)}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-header">
            <h3>{stat.title}</h3>
            <span className={`stat-change ${stat.changeType || "positive"}`}>
              {stat.change}
            </span>
          </div>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="main-grid">
      
      <MonthlySalesChart token={token} />

      <StockPieChart token={token} />

      <RecentActivity orders={orders} />

      <TaskList />
    </div>
  </>
);

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recentActivityCount, setRecentActivityCount] = useState(0);
  const [statsData, setStatsData] = useState([
    {
      title: "Total Orders",
      value: "Loading...",
      change: "-",
      redirectTo: "Orders",
    },
    {
      title: "Pending Orders",
      value: "Loading...",
      change: "-",
      redirectTo: "Orders",
    },
    {
      title: "In Stock Products",
      value: "Loading...",
      change: "-",
      redirectTo: "Stock",
    },
    {
      title: "Low Stock Products",
      value: "Loading...",
      change: "-",
      redirectTo: "Stock",
    },
  ]);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  // Get user data and token from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedUser !== "undefined") {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }

      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }, []);

  // Fetch orders and products data with auth token
  useEffect(() => {
    // Don't fetch if no token is available
    if (!token) return;

    const fetchData = async () => {
      try {
        // Set up auth headers
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch products with authentication
        try {
          const productsResponse = await fetch(
            "http://127.0.0.1:8000/api/products/",
            { headers }
          );
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setProducts(productsData.products || []);
          } else {
            console.error(
              "Failed to fetch products:",
              await productsResponse.text()
            );
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }

        // Fetch all orders for this shop with authentication
        try {
          const ordersResponse = await fetch(
            "http://127.0.0.1:8000/api/payment/shop-orders",
            { headers }
          );
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            if (ordersData.payments) {
              setOrders(ordersData.payments);

              // Count recent activities (orders that should appear in the RecentActivity component)
              // Typically this would be recent orders, within a few days
              if (ordersData.payments.length > 0) {
                // Calculate orders from the last 7 days (or your preferred timeframe for "recent")
                const recentTimeframe = new Date();
                recentTimeframe.setDate(recentTimeframe.getDate() - 7);

                const recentOrders = ordersData.payments.filter((order) => {
                  if (order.created_at) {
                    const orderDate = new Date(order.created_at);
                    return orderDate > recentTimeframe;
                  }
                  return false;
                });

                setRecentActivityCount(recentOrders.length);
              } else {
                setRecentActivityCount(0);
              }
            } else if (ordersData.message) {
              console.log(ordersData.message);
              setOrders([]);
              setRecentActivityCount(0);
            }
          } else {
            console.error(
              "Failed to fetch orders:",
              await ordersResponse.text()
            );
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, [token]);

  // Calculate stats based on fetched data
  useEffect(() => {
    // Count different stock levels
    let inStockCount = 0;
    let lowStockCount = 0;

    products.forEach((product) => {
      if (product.qty <= 0) {
        // Out of stock
      } else if (product.qty <= 10) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    // Count total and pending orders
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === "Pending"
    ).length;

    // Update stats data
    setStatsData([
      {
        title: "Total Orders",
        value: totalOrders.toString(),
        change: totalOrders ? "+15.3%" : "No change",
        redirectTo: "Orders",
      },
      {
        title: "Pending Orders",
        value: pendingOrders.toString(),
        changeType: pendingOrders > 5 ? "warning" : "positive",
        change: pendingOrders > 5 ? "Attention needed" : "All good",
        redirectTo: "Orders",
      },
      {
        title: "In Stock Products",
        value: inStockCount.toString(),
        change: "+12.5%",
        redirectTo: "Stock",
      },
      {
        title: "Low Stock Products",
        value: lowStockCount.toString(),
        changeType: lowStockCount > 0 ? "warning" : "positive",
        change: lowStockCount > 0 ? "Attention needed" : "All good",
        redirectTo: "Stock",
      },
    ]);
  }, [products, orders]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { title: "Dashboard", icon: Home },
    { title: "Orders", icon: ShoppingBag },
    { title: "Stock", icon: Store },
    { title: "News", icon: Calendar },
    { title: "Documents", icon: FileText },
  ];

  // Handle card click to navigate to appropriate page
  const handleCardClick = (destination) => {
    setActiveMenu(destination);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "Stock":
        return <Stock />;
      case "News":
        return <NewsAddScreen />;
      case "Orders":
        return <Orders />;
      case "Documents":
        return <PrintableDocuments />;
      default:
        return (
          <DashboardHome
            statsData={statsData}
            orders={orders}
            onCardClick={handleCardClick}
            token={token}
          />
        );
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleContentClick = () => {
    if (isMobile && isSidebarOpen) {
      setSidebarOpen(false);
    }
    if (isDropdownOpen) {
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Clear token
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            {isSidebarOpen && <span className="logo-text">Shop Owner Pro</span>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.title}
              className={`nav-item ${
                activeMenu === item.title ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu(item.title);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.title}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`main-content ${!isSidebarOpen ? "expanded" : ""}`}
        onClick={handleContentClick}
      >
        {/* Top Navigation */}
        <header className="top-nav">
          {isMobile && (
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          )}

          <FancyRealTimeClock />

          <div className="nav-actions">
            <button
              className="action-button notification-btn"
              onClick={() => setActiveMenu("Dashboard")}
              title="Recent activities"
            >
              <div className="notification-icon-container">
                <Bell size={20} />
                {recentActivityCount > 0 && (
                  <span className="notification-badge">
                    {recentActivityCount}
                  </span>
                )}
              </div>
            </button>

            <div className="user-menu">
              <button
                className="user-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!isDropdownOpen);
                }}
              >
                <div className="user-avatar">{user ? user.name[0] : "JD"}</div>
                <span className="user-name">
                  {user ? user.name : "John Doe"}
                </span>
                <ChevronDown size={16} />
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button className="logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="content-header">
            <h1>
              {activeMenu} {activeMenu === "Dashboard" ? "Overview" : ""}
            </h1>
            <p>Welcome back, {user ? user.name : "John Doe"}</p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Add this CSS to your Dashboard.css file
const styles = `
/* Notification styles */
.notification-icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.notification-btn {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.notification-btn:hover {
  transform: scale(1.1);
}

.action-button {
  background: transparent;
  border: none;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Task list styles */
.task-list {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.task-item.completed .task-label {
  text-decoration: line-through;
  color: #999;
}

.task-checkbox {
  display: flex;
  align-items: center;
  flex: 1;
}

.task-checkbox input[type="checkbox"] {
  margin-right: 10px;
}

.task-label {
  cursor: pointer;
  transition: color 0.2s;
}

.task-actions {
  display: flex;
  align-items: center;
}

.task-date {
  font-size: 12px;
  color: #888;
  margin-right: 10px;
}

.delete-task-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.delete-task-btn:hover {
  opacity: 1;
}

.add-task-form {
  margin-top: 15px;
}

.task-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.task-date-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
}

.add-task-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-task-btn:hover {
  background-color: #3d8b40;
}
`;

export default Dashboard;
