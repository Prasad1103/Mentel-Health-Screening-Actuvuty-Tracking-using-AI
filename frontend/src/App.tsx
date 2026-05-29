import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";

const Index = lazy(() => import("./pages/Index.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Questionnaire = lazy(() => import("./pages/Questionnaire.tsx"));
const Chat = lazy(() => import("./pages/Chat.tsx"));
const FusionAnalysis = lazy(() => import("./pages/FusionAnalysis.tsx"));
const Reports = lazy(() => import("./pages/Reports.tsx"));
const ReportDetail = lazy(() => import("./pages/ReportDetail.tsx"));
const History = lazy(() => import("./pages/History.tsx"));
const Analytics = lazy(() => import("./pages/Analytics.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
        <AuthProvider>
          <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading workspace...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="questionnaire" element={<Questionnaire />} />
                <Route path="chat" element={<Chat />} />
                <Route path="fusion" element={<FusionAnalysis />} />
                <Route path="fusion-analysis" element={<Navigate to="/app/fusion" replace />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/:id" element={<ReportDetail />} />
                <Route path="history" element={<History />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
