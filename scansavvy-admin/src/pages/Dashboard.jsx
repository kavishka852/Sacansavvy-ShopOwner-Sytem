import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  BarChart2,
  Settings,
  Bell,
  Search,
  MessageSquare,
  Calendar,
  FileText,
  Store,
  Menu,
  X,
  ChevronDown,
  ShoppingBag
} from "lucide-react";
import Analytics from "./Analytics";
import "../css/Dashboard.css";
import Stock from "./Stock";
import NewsAddScreen from "./News";
import Orders from "./Orders";

const DashboardHome = ({ statsData }) => (
  <>
    <div className="stats-grid">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
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
      <div className="grid-item chart">
        <h2>Revenue Overview</h2>
        <div className="chart-placeholder">[Chart Component Would Go Here]</div>
      </div>

      <div className="grid-item recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="activity-item">
              <div className="activity-icon">🔔</div>
              <div className="activity-details">
                <p>New user registration</p>
                <span>5 minutes ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-item tasks">
        <h2>Upcoming Tasks</h2>
        <div className="task-list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="task-item">
              <input type="checkbox" />
              <span>Review team performance</span>
              <span className="task-date">Today</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [statsData, setStatsData] = useState([
    // { title: "Total Users", value: "0", change: "0%" },
    // { title: "Active Users", value: "0", change: "0%" },
    // { title: "In Stock Products", value: "0", change: "0%" },
    // { title: "Low Stock Products", value: "0", change: "0%" },
  ]);

  // Fetch users and products data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Show loading state or placeholder data initially
        setStatsData([
          { title: "Total Users", value: "Loading...", change: "-" },
          { title: "Active Users", value: "Loading...", change: "-" },
          { title: "In Stock Products", value: "Loading...", change: "-" },
          { title: "Low Stock Products", value: "Loading...", change: "-" },
        ]);

        // Fetch users with error handling
        let usersData = { users: [] };
        try {
          const usersResponse = await fetch("http://127.0.0.1:8000/api/user/");
          if (usersResponse.ok) {
            usersData = await usersResponse.json();
          } else {
            console.error("Failed to fetch users:", await usersResponse.text());
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }

        // Fetch products with error handling
        let productsData = { products: [] };
        try {
          const productsResponse = await fetch(
            "http://127.0.0.1:8000/api/products/"
          );
          if (productsResponse.ok) {
            productsData = await productsResponse.json();
          } else {
            console.error(
              "Failed to fetch products:",
              await productsResponse.text()
            );
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }

        setUsers(usersData.users || []);
        setProducts(productsData.products || []);
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate stats based on fetched data
  useEffect(() => {
    if (users.length > 0 || products.length > 0) {
      // Count active users (status = "1" and verified = true)
      const activeUsers = users.filter(
        (user) => user.status === "1" && user.verified === true
      ).length;

      // Count different stock levels
      let inStockCount = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      products.forEach((product) => {
        if (product.qty <= 0) {
          outOfStockCount++;
        } else if (product.qty <= 10) {
          lowStockCount++;
        } else {
          inStockCount++;
        }
      });

      // Update stats data
      setStatsData([
        {
          title: "Total Users",
          value: users.length.toString(),
          change: "+12.5%",
        },
        {
          title: "Active Users",
          value: activeUsers.toString(),
          change: `${((activeUsers / users.length) * 100).toFixed(1)}%`,
        },
        {
          title: "In Stock Products",
          value: inStockCount.toString(),
          change: "+15.3%",
        },
        {
          title: "Low Stock Products",
          value: lowStockCount.toString(),
          changeType: lowStockCount > 0 ? "warning" : "positive",
          change: lowStockCount > 0 ? "Attention needed" : "All good",
        },
      ]);
    }
  }, [users, products]);

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
    { title: "Analytics", icon: BarChart2 },
    { title: "Orders", icon: ShoppingBag },
    { title: "Stock", icon: Store },
    { title: "News", icon: Calendar },
    { title: "Documents", icon: FileText },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "Analytics":
        return <Analytics />;
      case "Stock":
        return <Stock />;
      case "News":
        return <NewsAddScreen />;
      case "Orders":
        return <Orders />;
      default:
        return <DashboardHome statsData={statsData} />;
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

  const [user, setUser] = useState(null);

  // In Dashboard.jsx, update the useEffect for user data:
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
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

          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="nav-actions">
            <button className="action-button">
              <Bell size={20} />
              <span className="notification-badge">3</span>
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
                  <button>Profile</button>
                  <button>Settings</button>
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

export default Dashboard;