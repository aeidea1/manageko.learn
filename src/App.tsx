import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { RecoveryPage } from "./pages/auth/RecoveryPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MyLearningPage } from "./pages/MyLearningPage";
import { CourseManagerPage } from "./pages/CourseManagerPage";
import { CourseEditorPage } from "./pages/CourseEditorPage";
import { CoursePlayerPage } from "./pages/CoursePlayerPage";
import { CoursePage } from "./pages/CoursePage";
import { LandingPage } from "./pages/LandingPage";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "bg-white border border-gray-200 shadow-xl rounded-sm p-4 text-[14px] font-bold text-black",
          success: { iconTheme: { primary: "#0056D2", secondary: "white" } },
          error: { iconTheme: { primary: "#FF2D2D", secondary: "white" } },
          duration: 3500,
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/recovery"
            element={
              <GuestRoute>
                <RecoveryPage />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute>
                <MyLearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <CoursePlayerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute adminOnly>
                <CourseManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute adminOnly>
                <CourseEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
