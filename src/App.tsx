import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancelled from './pages/PaymentCancelled'
import VerifyEmail from './pages/VerifyEmail'
import ResetPassword from './pages/ResetPassword'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookiePolicy from './pages/CookiePolicy'
import About from './pages/About'
import Contact from './pages/Contact'
import ComingSoon from './pages/ComingSoon'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import ForTeachers from './pages/ForTeachers'
import ForStudents from './pages/ForStudents'
import { AccountSettings } from './components/AccountSettings'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardRouter } from './components/DashboardRouter'
import { StudentDashboard } from './components/StudentDashboard'
import { TeacherDashboard } from './components/TeacherDashboard'
import { ParentDashboard } from './components/ParentDashboard'




function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/student-dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/parent-dashboard" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <ParentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AccountSettings />
        </ProtectedRoute>
      } />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/for-teachers" element={<ForTeachers />} />
      <Route path="/for-students" element={<ForStudents />} />
      <Route path="/careers" element={<ComingSoon />} />
      <Route path="/blog" element={<ComingSoon />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-cancelled" element={<PaymentCancelled />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}






export default App


