// src/data/FinanceContext.jsx
import React, { createContext, useContext, useState } from "react";

const FinanceContext = createContext();

const demoEntries = [
  {
    date: "2025-05-01",
    type: "income",
    amount: 5000,
    category: "Membership",
    payment: "Cash",
    description: "Monthly fee from John Doe",
  },
  {
    date: "2025-05-02",
    type: "expense",
    amount: 2000,
    category: "Equipment",
    payment: "Bank Transfer",
    description: "New dumbbells set",
  },
  {
    date: "2025-05-05",
    type: "income",
    amount: 3000,
    category: "Personal Training",
    payment: "UPI",
    description: "Private session with Sarah",
  },
  {
    date: "2025-05-08",
    type: "expense",
    amount: 800,
    category: "Snacks",
    payment: "Cash",
    description: "Protein bars for sale counter",
  },
];

export const FinanceProvider = ({ children }) => {
  const [entries, setEntries] = useState(demoEntries);

  const addEntry = (entry) => setEntries((prev) => [...prev, entry]);

  const deleteEntry = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEntry = (index, updated) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? updated : entry))
    );
  };

  return (
    <FinanceContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
