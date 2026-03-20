import React from "react";

const timetable = {
  Monday: ["ML", "FSD"],
  Tuesday: ["FSD", "CLOUD", "ML"],
  Wednesday: ["CLOUD", "FSD", "ML"],
  Thursday: ["REP", "ML"],
  Friday: ["LAB", "CLOUD"],
};

const TimeTable = () => {
  return (
    <div className="bg-surface-100 dark:bg-surface-800 p-6 rounded-2xl shadow-card dark:shadow-card-dark">
      <h2 className="text-xl font-semibold mb-4">📚 Weekly Timetable</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(timetable).map(([day, subjects]) => (
          <div
            key={day}
            className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:shadow-md transition"
          >
            <h3 className="font-bold text-brand-500 mb-2">{day}</h3>

            <div className="flex flex-wrap gap-2">
              {subjects.map((sub, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeTable;