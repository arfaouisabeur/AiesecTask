import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js/auto";
import Papa from "papaparse";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const internshipChartRef = useRef(null);
  const genderChartRef = useRef(null);
  const budgetChartRef = useRef(null);
  const awarenessChartRef = useRef(null);

  // Track Chart Instances
  const chartInstances = useRef({});

  useEffect(() => {
    // Fetch the CSV from the Google Sheet
    const sheetUrl =
      "https://docs.google.com/spreadsheets/d/1be-3YPl4LGtV9yqKZg_dvpSnKOFwNweV9vhQRz-NMkY/gviz/tq?tqx=out:csv&sheet=Form%20Responses";

    fetch(sheetUrl)
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          complete: (result) => setData(result.data),
          header: true,
        });
      })
      .catch((error) => console.error("Error fetching the sheet:", error));
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    // **Dynamic Calculations** from the dataset
    const genderCounts = countValues(data, "Gender");
    const internshipCounts = countValues(data, "What type of internship are you interested in?");
    const budgetCounts = countValues(data, "How much are you willing to spend for going abroad?");
    const awarenessCounts = countValues(data, "Have you ever heard of AIESEC before?");

    // Render Charts Dynamically
    renderChart("genderChart", genderChartRef.current, "bar", {
      labels: Object.keys(genderCounts),
      datasets: [
        {
          label: "Gender Distribution",
          data: Object.values(genderCounts),
          backgroundColor: ["#3f51b5", "#f44336", "#9e9e9e"], // Custom colors
        },
      ],
    });

    renderChart("internshipChart", internshipChartRef.current, "pie", {
      labels: Object.keys(internshipCounts),
      datasets: [
        {
          label: "Internship Preferences",
          data: Object.values(internshipCounts),
          backgroundColor: ["#4caf50", "#ff9800", "#2196f3"], // Custom colors
        },
      ],
    });

    renderChart("budgetChart", budgetChartRef.current, "doughnut", {
      labels: Object.keys(budgetCounts),
      datasets: [
        {
          label: "Budget Distribution",
          data: Object.values(budgetCounts),
          backgroundColor: ["#e91e63", "#00bcd4", "#8bc34a", "#ffeb3b"], // Custom colors
        },
      ],
    });

    renderChart("awarenessChart", awarenessChartRef.current, "bar", {
      labels: Object.keys(awarenessCounts),
      datasets: [
        {
          label: "AIESEC Awareness",
          data: Object.values(awarenessCounts),
          backgroundColor: ["#3f51b5", "#f44336"], // Custom colors
        },
      ],
    });

    // Cleanup charts on component unmount
    return () => {
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());
      chartInstances.current = {};
    };
  }, [data]);

  // Helper function to count occurrences of a field in the data
  const countValues = (data, field) => {
    const counts = {};
    data.forEach((row) => {
      if (row[field]) {
        counts[row[field]] = (counts[row[field]] || 0) + 1;
      }
    });
    return counts;
  };

  // Helper function to render charts with proper cleanup
  const renderChart = (chartId, ctx, type, chartData) => {
    if (!ctx) return;

    // Destroy existing chart instance if it exists
    if (chartInstances.current[chartId]) {
      chartInstances.current[chartId].destroy();
    }

    // Create a new chart instance and store it
    chartInstances.current[chartId] = new Chart(ctx, {
      type,
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
      },
    });
  };

  return (
    <div className="App">
      <h1>AIESEC Data Visualization </h1>
      
    <a href="https://script.google.com/macros/s/AKfycbwXdX8dK-m_avCdSH3dG6Gb0BIeJsYyPGy5iD5el54gX0ablow2jdBc37nmSeDsVcHI_Q/exec" class="styled-button"><input type="button" value="ADD AN EP"/> </a>
      {/* Internship Preferences Chart */}
      <div className="chart-container">
        <h2>Internship Preferences</h2>
        <canvas ref={internshipChartRef}></canvas>
      </div>

      {/* Gender Distribution Chart */}
      <div className="chart-container">
        <h2>Gender Distribution</h2>
        <canvas ref={genderChartRef}></canvas>
      </div>

      {/* Budget Distribution Chart */}
      <div className="chart-container">
        <h2>Budget Distribution</h2>
        <canvas ref={budgetChartRef}></canvas>
      </div>

      {/* AIESEC Awareness Chart */}
      <div className="chart-container">
        <h2>AIESEC Awareness</h2>
        <canvas ref={awarenessChartRef}></canvas>
      </div>
    </div>
  );
}

export default App;
