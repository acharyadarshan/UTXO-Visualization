import React, { useState } from "react";
import Heatmap from "./components/Heatmap";
import YearSlider from "./components/YearSlider";
import "../src/components/external.css";

function App() {
    const [transactionCount, setTransactionCount] = useState(500);
    const [currentYear, setCurrentYear] = useState(2018);

    const baseYear = 2018;
    const baseTransactionCount = 1000; // Base number of transactions in the starting year
    const transactionIncrementPerYear = 2000; // Increment of transactions for each year

    const handleYearChange = (year) => {
        setCurrentYear(year);
        const increment = (year - baseYear) * transactionIncrementPerYear;
        setTransactionCount(baseTransactionCount + increment);
    };

    return (
        <div className="body">
            <div className="header">
                <h1>UTXO VISUALIZATION</h1>
            </div>
            <div class="info-container">
                <header className="sub-heading">
                    <h1>UTXO STATS</h1>
                </header>
                <section class="description">
                    <p>
                        The Heatmap visualizes the 11,000+ unspent transaction outputs in
                        Resilient db. Each row and column label represents the public keys
                        of 50 users participating in the transaction. Each cell represents
                        the number of unspent transaction outputs between two users. The
                        intensity of color of the cell indicates the quantity of unspent
                        transaction outputs between them.
                    </p>
                </section>
                <section class="stats">
                    <div class="stat">
                        <h2>11,000</h2>
                        <p>TOTAL TRANSACTIONS</p>
                    </div>
                    <div class="stat">
                        <h2>534</h2>
                        <p>MAX UNSPENT OUTPUTS IN A CELL</p>
                    </div>
                    <div class="stat">
                        <h2>34,562</h2>
                        <p>TOTAL UNSPENT IN ALL CELLS</p>
                    </div>
                    <div class="stat">
                        <h2>632</h2>
                        <p>MAX TRANSACTIONS IN A SINGLE YEAR</p>
                    </div>
                    <div class="stat">
                        <h2>14</h2>
                        <p>MOST ACTIVE USER TRANSACTIONS</p>
                    </div>
                    <div class="stat">
                        <h2>50</h2>
                        <p>TOTAL USERS</p>
                    </div>
                </section>
                <div className="switch">
                    <button
                        onClick={() =>
                            window.open(
                                "https://gjnguyen18.github.io/utxo-lenses/",
                                "_blank"
                            )
                        }
                    >
                        {" "}
                        Switch to 3D
                    </button>
                </div>
            </div>
            <YearSlider minYear={2018} maxYear={2023} onYearChange={handleYearChange} />
            <Heatmap transactionCount={transactionCount} currentYear={currentYear} />
        </div>
    );
}

export default App;
