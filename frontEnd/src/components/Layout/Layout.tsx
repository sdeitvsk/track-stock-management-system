
import React, { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <Header title={title} subtitle={subtitle} />
          
          <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-indigo-100/50">
            <div className="max-w-7xl mx-auto">
              {children}

              <Toaster />
            </div>
          </main>
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
};

export default Layout;
