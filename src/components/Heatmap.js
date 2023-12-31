import React, { useState, useEffect } from "react";
import "./Heatmap.css";
import "./external.css";
import axios from "axios";
import * as d3 from "d3";
import { zoom as d3Zoom } from "d3-zoom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Heatmap = ({ transactionCount, currentYear }) => {
    const [selectedTransactions, setSelectedTransactions] = useState(null);
    const [allTransactions, setAllTransactions] = useState([]); // Store all fetched transactions
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [copySuccess, setCopySuccess] = useState(""); // State to manage copy success message
    const [transactionVisibility, setTransactionVisibility] = useState("hide");

    useEffect(() => {
        const fetchData = async () => {
            const url =
                "https://raw.githubusercontent.com/boluwarinayinmode/Utxo-JS/main/database/transformed_data2.json";

            try {
                const res = await axios.get(url);
                if (res.data.status !== "OK") {
                    console.error("Data not OK", res.data);
                    return;
                }
                renderHeatmap(res.data.data.users, res.data.data.transactions);
                setAllTransactions(res.data.data.transactions); // Store all transactions
            } catch (error) {
                console.error("Fetching data error: ", error);
            }
        };

        const renderHeatmap = (users, allTransactions) => {
            // Remove previous zoom container if it exists
            d3.select(".zoom-container").remove();

            const containerWidth = document.querySelector(".container").clientWidth;
            const margin = { top: 50, right: 0, bottom: 0, left: 50 };
            const width = containerWidth - margin.left - margin.right;
            const height = width; // make it square

            const svg = d3
                .select(".chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("class", "zoom-container")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Filter transactions based on the count
            const transactions = allTransactions.slice(0, transactionCount);

            // Create user index mapping
            const userIndex = users.reduce((acc, user, i) => {
                acc[user] = i;
                return acc;
            }, {});

            // Prepare the matrix for the heatmap
            const matrix = Array.from({ length: users.length }, () =>
                Array.from({ length: users.length }, () => [])
            );

            transactions.forEach((transaction) => {
                const { from, to, amount, timestamp } = transaction;

                // Skip adding the transaction if it's from and to the same user

                matrix[userIndex[from]][userIndex[to]].push({
                    from,
                    to,
                    amount,
                    timestamp,
                });
            });

            // Define the scales
            const xScale = d3.scaleBand().domain(users).range([0, width]).padding(0.05);

            const yScale = d3.scaleBand().domain(users).range([0, height]).padding(0.05);
            const yAxis = d3.axisLeft(yScale).tickSize(0); // This sets the tick size to 0 for the y-axis

            // Define the color scale
            const maxAmount = d3.max(transactions, (d) => d.amount);
            const colorScale = d3
                .scaleSequential()
                .interpolator(d3.interpolateBlues)
                .domain([0, maxAmount]);

            // Existing zoom behavior definition
            const zoomBehavior = d3Zoom()
                .scaleExtent([1, 10])
                .translateExtent([
                    [0, 0],
                    [width, height],
                ])
                .on("zoom", (event) => {
                    svg.attr("transform", event.transform);
                });

            // Apply the zoom behavior to the svg and disable default double-click zoom
            svg.call(zoomBehavior).on("dblclick.zoom", null);

            // Function to programmatically apply the zoom in
            function doubleClickZoomIn() {
                svg.transition().duration(500).call(zoomBehavior.scaleBy, 2);
            }

            // Function to programmatically apply the zoom out
            function doubleClickZoomOut() {
                svg.transition().duration(500).call(zoomBehavior.scaleBy, 0.5);
            }

            // Add a double-click event listener to the SVG for zooming in
            svg.on("dblclick", (event) => {
                if (!event.shiftKey) {
                    doubleClickZoomIn();
                }
            });

            // Add a double-click with the Shift key event listener for zooming out
            svg.on("dblclick.shift", (event) => {
                if (event.shiftKey) {
                    doubleClickZoomOut();
                }
            });

            // Define the drop shadow filter
            // Select the existing tooltip, or create a new one if it doesn't exist
            let tooltip = d3.select(".tooltip");
            if (tooltip.empty()) {
                tooltip = d3
                    .select(".container")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
            }

            // Create the heatmap cells
            svg.selectAll("rect")
                .data(matrix.flat())
                .enter()
                .append("rect")
                .attr("x", (d, i) => xScale(users[i % users.length]))
                .attr("y", (d, i) => yScale(users[Math.floor(i / users.length)]))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                // Changed the fill style to check for diagonal cells
                .style("fill", (d, i) => {
                    const rowIndex = Math.floor(i / users.length);
                    const colIndex = i % users.length;
                    if (rowIndex === colIndex) {
                        return "none";
                    } else {
                        // 'd' is an array of transactions
                        return colorScale(d3.sum(d, (t) => t.amount));
                    }
                })
                .style("filter", "url(#drop-shadow)")
                .style("stroke-width", "1px") // consistent stroke width for all cells
                .on("mouseover", (event, d, i) => {
                    const rowIndex = Math.floor(i / users.length);
                    const colIndex = i % users.length;
                    if (rowIndex !== colIndex) {
                        tooltip
                            .html(
                                d
                                    .map(
                                        (t) =>
                                            `<div>From: ${t.from}<br>To: ${t.to}<br>Amount: ${t.amount}</div>`
                                    )
                                    .join("<hr>")
                            )
                            .style("opacity", 1)
                            .style("visibility", "visible");
                    } else {
                        tooltip.style("opacity", 0).style("visibility", "hidden");
                    }
                })
                .on("mousemove", (event) => {
                    const tooltipHeight = tooltip.node().getBoundingClientRect().height;
                    tooltip
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - tooltipHeight - 5 + "px");
                })
                .on("mouseout", () => {
                    tooltip.style("opacity", 0).style("visibility", "hidden");
                })
                .on("click", (event, d, i) => {
                    const toUser = users[Math.floor(i / users.length)];
                    const userTransactions = transactions.filter((t) => t.to === toUser);
                    setSelectedTransactions(userTransactions);
                });

            // Add axes
            svg.append("g")
                .call(d3.axisTop(xScale))
                .selectAll("text")
                .style("text-anchor", "start")
                .text(function (d) {
                    return d; // Truncates the label to the first 8 characters
                })
                .attr("dx", "-1.2em")
                .attr("dy", "-.6em")
                .attr("transform", "rotate(-90)")
                .attr("y", 6) // Moves the label down; adjust as needed
                .attr("x", 12);
            svg.append("g").call(d3.axisLeft(yScale)).call(yAxis).attr("class", "y-axis");
        };

        fetchData();

        return () => {
            // Cleanup: Remove the tooltip div from the DOM
            d3.select(".tooltip").remove();
            d3.select(".chart").selectAll("*").remove();
        };
    }, [transactionCount, currentYear]);

    const toggleTransactionVisibility = () => {
        if (transactionVisibility === "hide") {
            setSelectedTransactions(allTransactions.slice(0, transactionCount)); // Show transactions
            setTransactionVisibility("show");
            setShowTransactionHistory(true); // Sync with showTransactionHistory
        } else {
            setSelectedTransactions([]); // Hide the transactions
            setTransactionVisibility("hide");
            setShowTransactionHistory(false); // Sync with showTransactionHistory
        }
    };

    const copyTransactionsToClipboard = () => {
        const transactionString = selectedTransactions
            .map(
                (t) =>
                    `From: ${t.from}, To: ${t.to}, Amount: ${t.amount}, Timestamp: ${t.timestamp}`
            )
            .join("\n");

        navigator.clipboard
            .writeText(transactionString)
            .then(() => {
                setCopySuccess("Transactions copied to clipboard!");
                setTimeout(() => setCopySuccess(""), 2000);
            })
            .catch((err) => {
                console.error("Error copying transactions to clipboard: ", err);
            });
    };

    return (
        <div className="parent">
            <div className="container">
                <svg className="chart"></svg>
            </div>
            <button onClick={toggleTransactionVisibility}>
                {transactionVisibility === "hide"
                    ? `Preview Transactions up to ${currentYear}`
                    : `Hide Transactions up to ${currentYear}`}
            </button>
            {copySuccess && <div className="copy-success">{copySuccess}</div>}

            <div className="transaction-history">
                {showTransactionHistory &&
                    selectedTransactions &&
                    selectedTransactions.length > 0 && (
                        <>
                            <button
                                onClick={copyTransactionsToClipboard}
                                className="copy-button"
                            >
                                <i className="fas fa-clipboard"></i> Copy
                            </button>
                            <table>
                                <thead>
                                    <tr>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Amount</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTransactions.map((transaction, index) => (
                                        <tr key={index}>
                                            <td>{transaction.from}</td>
                                            <td>{transaction.to}</td>
                                            <td>{transaction.amount}</td>
                                            <td>
                                                {new Date(
                                                    transaction.timestamp
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
            </div>
        </div>
    );
};

export default Heatmap;
