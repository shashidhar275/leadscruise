import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import styles from "./Dashboard.module.css"; // Import CSS module
import { useNavigate } from "react-router-dom";

const LoadingScreen = () => (
  <div className={styles["loading-overlay"]}>
    <div className={styles["loading-container"]}>
      <div className={styles["loading-spinner"]}></div>
      <p className={styles["loading-text"]}>Loading...</p>
      <div className={styles["loading-progress-dots"]}>
        <div className={styles["loading-dot"]}></div>
        <div className={styles["loading-dot"]}></div>
        <div className={styles["loading-dot"]}></div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("Stopped");
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    sentences: [],
    wordArray: [],
    h2WordArray: [],
  });

  // Fetch leads from backend
  const fetchLeads = async () => {
    try {
      const mobileNumber = localStorage.getItem("mobileNumber");
      if (!mobileNumber) {
        console.error("Mobile number not found in localStorage.");
        return;
      }

      const response = await axios.get(`https://api.leadscruise.com/api/get-leads/${mobileNumber}`);
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
          console.error("Email not found in localStorage.");
          return;
        }

        const response = await axios.get(`https://api.leadscruise.com/api/get-status/${userEmail}`);
        setStatus(response.data.status || "Stopped");
        localStorage.setItem("status", response.data.status || "Stopped");
        if (response.data.startTime) {
          const startTime = new Date(response.data.startTime);
          const currentTime = new Date();
          const timeElapsed = Math.floor((currentTime - startTime) / 1000); // Time elapsed in seconds

          if (timeElapsed < 300) {
            setIsDisabled(true);
            setTimer(300 - timeElapsed);
          } else {
            setIsDisabled(false);
          }
        } else {
          setIsDisabled(false);
        }
      } catch (error) {
        console.error("Error fetching script status:", error);
      } finally {
        setIsLoading(false); // Set loading to false after status is fetched
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh status every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("isDisabled", JSON.stringify(isDisabled));
  }, [isDisabled]);

  useEffect(() => {
    setIsLoading(true); // Set loading to true before fetching leads
    fetchLeads()
      .finally(() => {
        setIsLoading(false); // Set loading to false after leads are fetched
      });
    const interval = setInterval(fetchLeads, 10000);
    return () => clearInterval(interval);
  }, []);

  // Countdown Timer Effect
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0 && isDisabled) {
      setIsDisabled(false);
    }
  }, [timer, isDisabled]);

  useEffect(() => {
    const fetchSettings = async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        alert("User email not found!");
        return;
      }
      try {
        const response = await axios.get(`https://api.leadscruise.com/api/get-settings/${userEmail}`);
        const userSettings = response.data // Extracting 'settings' from response

        if (!userSettings) {
          alert("No settings found, please configure them first.");
          navigate("/settings");
          return;
        }

        setSettings(userSettings);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, [navigate]);

  // Calculate metrics based on leads data
  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const leadsToday = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      leadDate.setHours(0, 0, 0, 0);
      return leadDate.getTime() === today.getTime();
    });

    const leadsThisWeek = leads.filter((lead) => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= oneWeekAgo;
    });

    return {
      totalLeadsToday: leadsToday.length,
      totalLeadsThisWeek: leadsThisWeek.length,
      totalLeadsCaptured: leads.length,
    };
  };

  const metrics = calculateMetrics();

  const handleStart = async () => {
    try {
      const mobileNumber = localStorage.getItem("mobileNumber");
      const password = localStorage.getItem("savedPassword");
      const userEmail = localStorage.getItem("userEmail");
      const uniqueId = localStorage.getItem("unique_id");
      if (!mobileNumber || !password) {
        alert("Mobile number or password not found in local storage!");
        return;
      }

      if (!userEmail) {
        alert("User email not found!");
        return;
      }

      // Fetch settings
      const response = await axios.get(`https://api.leadscruise.com/api/get-settings/${userEmail}`);
      const userSettings = response.data;
      console.log("Fetched settings:", userSettings);
      setSettings(response.data);
      if (!userSettings) {
        alert("No settings found, please configure them first.");
        navigate("/settings");
        return;
      }

      // Check if all settings arrays are empty
      if (
        (!userSettings.sentences || userSettings.sentences.length === 0) &&
        (!userSettings.wordArray || userSettings.wordArray.length === 0) &&
        (!userSettings.h2WordArray || userSettings.h2WordArray.length === 0)
      ) {
        alert("Please configure your settings first.");
        navigate("/settings");
        return;
      }
      console.log("Sending the following settings to backend:", userSettings);
      // Start process

      // Send the fetched settings instead of using the state
      const cycleResponse = await axios.post("https://api.leadscruise.com/api/cycle", {
        sentences: userSettings.sentences,
        wordArray: userSettings.wordArray,
        h2WordArray: userSettings.h2WordArray,
        mobileNumber,
        password,
        uniqueId,
        userEmail,
      });
      alert("Task started successfully!!! You can stop the task after 5 minutes.");
      setStatus("Running");

    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false); // Hide loading after process completes or fails
    }
  };

  const handleStop = async () => {
    if (isDisabled && timer > 0) {
      alert(`You cannot stop the script until ${Math.ceil(timer / 60)} min are completed.`);
      return;
    }

    if (window.confirm("Are you sure you want to stop the script?")) {
      setIsLoading(true); // Show loading when stopping

      const userEmail = localStorage.getItem("userEmail");
      const uniqueId = localStorage.getItem("unique_id");

      if (!userEmail || !uniqueId) {
        alert("User email or mobile number is missing!");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post("https://api.leadscruise.com/api/stop", { userEmail, uniqueId });

        alert(response.data.message);
        setStatus("Stopped");
        setIsDisabled(false);
        setTimer(0);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to stop the script.");
        console.error("Error stopping script:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"

  // Function to handle sorting
  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  // Sorting logic
  const sortedLeads = [...leads].sort((a, b) => {
    const valueA = a[sortField] || ""; // Handle empty values
    const valueB = b[sortField] || "";

    if (sortField === "createdAt") {
      return sortOrder === "asc"
        ? new Date(valueA) - new Date(valueB)
        : new Date(valueB) - new Date(valueA);
    } else {
      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    }
  });

  return (
    <div className={styles.dashboardContainer}>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}

      {/* Sidebar Component */}
      <Sidebar status={status} />

      {/* Main Content */}
      <div className={styles.dashboardContent}>
        {/* Header Component */}
        <DashboardHeader
          status={status}
          handleStart={handleStart}
          handleStop={handleStop}
          isDisabled={isDisabled}
          timer={timer}
        />

        {/* Metrics Section */}
        <div className={styles.metricsSection}>
          <div className={styles.metricBox}>{metrics.totalLeadsToday} <br /><span>Total Leads Today</span></div>
          <div className={styles.metricBox}>{metrics.totalLeadsThisWeek} <br /><span>Total Leads This Week</span></div>
          <div className={styles.metricBox}>
            {metrics.totalLeadsToday * (settings.sentences.length)} <br />
            <span>Replies Sent Today</span>
          </div>
          <div className={styles.metricBox}>{metrics.totalLeadsToday} <br /><span>WhatsApp Messages Sent Today</span></div>
          <div className={styles.metricBox}>{metrics.totalLeadsToday} <br /><span>Emails Sent Today</span></div>
          <div className={styles.metricBox}>{metrics.totalLeadsCaptured} <br /><span>Total Emails Sent</span></div>
          <div className={styles.metricBox}>{metrics.totalLeadsCaptured} <br /><span>Total Leads Captured</span></div>
        </div>

        {/* Recent Leads Table */}
        <div className={styles.leadsSection}>
          <div className={styles.tableHeader}>Recent Purchased Leads</div>
          <div className={styles.tableWrapper}>
            <table className={styles.leadsTable}>
              <thead>
                <tr>
                  {[
                    { label: "Product", field: "lead_bought" },
                    { label: "Name", field: "name" },
                    { label: "Mobile Number", field: "mobile" },
                    { label: "Email", field: "email" },
                    { label: "Purchase Date", field: "createdAt" },
                  ].map(({ label, field }) => (
                    <th key={field} onClick={() => handleSort(field)} style={{ cursor: "pointer" }}>
                      {label} {sortField === field && (sortOrder === "asc" ? "🔼" : "🔽")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedLeads.length > 0 ? (
                  sortedLeads.map((lead, index) => (
                    <tr key={index}>
                      <td>{lead.lead_bought || "N/A"}</td>
                      <td>{lead.name || "N/A"}</td>
                      <td>{lead.mobile || "N/A"}</td>
                      <td>{lead.email || "N/A"}</td>
                      <td>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>No leads available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;