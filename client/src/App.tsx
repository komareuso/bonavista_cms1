import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminYachtEditor from "./pages/AdminYachtEditor";
import AdminYachts from "./pages/AdminYachts";
import Experience from "./pages/Experience";
import Home from "./pages/Home";

export function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/experience/:slug" component={Experience} />
      <Route path="/cms">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/cms/yachts">
        <AdminRoute>
          <AdminYachts />
        </AdminRoute>
      </Route>
      <Route path="/cms/yachts/new">
        <AdminRoute>
          <AdminYachtEditor />
        </AdminRoute>
      </Route>
      <Route path="/cms/yachts/:id">
        <AdminRoute>
          <AdminYachtEditor />
        </AdminRoute>
      </Route>
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/yachts">
        <AdminRoute>
          <AdminYachts />
        </AdminRoute>
      </Route>
      <Route path="/admin/yachts/new">
        <AdminRoute>
          <AdminYachtEditor />
        </AdminRoute>
      </Route>
      <Route path="/admin/yachts/:id">
        <AdminRoute>
          <AdminYachtEditor />
        </AdminRoute>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
