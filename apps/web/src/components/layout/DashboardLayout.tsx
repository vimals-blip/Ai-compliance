'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DriverTour } from '../common/DriverTour';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
      <DriverTour />
    </div>
  );
};




