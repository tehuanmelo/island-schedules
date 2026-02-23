import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import "react-day-picker/style.css";

export default function CustomDateRangePicker({
    value,
    onChange,
    error,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDateString = (date) => {
        if (!date) return "";
        return format(date, "dd-MMM-yyyy").toLowerCase();
    };

    const displayString = () => {
        if (value?.from) {
            if (!value.to) {
                return formatDateString(value.from);
            } else if (value.to.getTime() !== value.from.getTime()) {
                return `${formatDateString(value.from)} - ${formatDateString(value.to)}`;
            }
            return formatDateString(value.from);
        }
        return "Pick a date range";
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`input-field flex items-center justify-between text-left w-full h-full ${error ? "border-red-500 ring-1 ring-red-500" : ""
                    } ${className} ${!value?.from ? "text-gray-500" : ""}`}
            >
                <div className="flex items-center gap-2 truncate">
                    <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{displayString()}</span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-10 p-3 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <DayPicker
                        mode="range"
                        selected={value}
                        onSelect={onChange}
                        className="text-xs font-medium"
                        classNames={{
                            day: "rounded-md m-0.5 hover:bg-amber-100 focus:outline-none transition-colors",
                            selected: "bg-amber-500 text-white font-bold hover:bg-amber-600 rounded-md",
                            today: "border border-amber-500 font-bold",
                            range_middle: "bg-amber-100 text-amber-900 rounded-none",
                            range_start: "bg-amber-600 text-white rounded-l-md",
                            range_end: "bg-amber-600 text-white rounded-r-md",
                            chevron: "fill-amber-600"
                        }}
                    />
                </div>
            )}
        </div>
    );
}
