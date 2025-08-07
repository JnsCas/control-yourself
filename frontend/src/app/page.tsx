'use client';

import Header from "./components/Header";
import MonthlySummary from "./components/MonthlySummary";
import DailyAverage from "./components/DailyAverage";
import Transactions from "./components/Transactions";
import MainContent from "./components/MainContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MonthlySummary />
          <DailyAverage />
          <Transactions />
        </div>

        <MainContent />
      </main>
    </div>
  );
}
