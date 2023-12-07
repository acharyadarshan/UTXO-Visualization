import React, { useState } from "react";
import Heatmap from "./components/Heatmap";
import YearSlider from "./components/YearSlider";
import "../src/components/external.css";

function App() {
    const [transactionCount, setTransactionCount] = useState(10);
    const [currentYear, setCurrentYear] = useState(2018);

    const baseYear = 2018;
    const baseTransactionCount = 10; // Base number of transactions in the starting year
    const transactionIncrementPerYear = 10; // Increment of transactions for each year

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
            <YearSlider minYear={2018} maxYear={2023} onYearChange={handleYearChange} />
            <Heatmap transactionCount={transactionCount} currentYear={currentYear} />
        </div>
    );
}

export default App;
