import React from "react";
import "./Heatmap.css";
import "./Slider.css";
const YearSlider = ({ minYear, maxYear, onYearChange }) => {
    const marks = [];
    for (let year = minYear; year <= maxYear; year++) {
        marks.push(year);
    }

    const handleChange = (event) => {
        const year = parseInt(event.target.value);
        //const transactionsToShow = (year - minYear) * 10 + 10;
        onYearChange(year);
    };

    return (
        <div className="year-slider-container ">
            <input
                type="range"
                min={minYear}
                max={maxYear}
                defaultValue={minYear}
                step="1"
                onChange={handleChange}
            />
            <div className="year-labels-container">
                {marks.map((mark, index) => (
                    <span
                        key={mark}
                        className="year-label"
                        style={{ left: `${(index / (marks.length - 1)) * 100}%` }}
                    >
                        {mark}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default YearSlider;
