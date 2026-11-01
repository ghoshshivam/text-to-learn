import { Route, Routes } from "react-router-dom";
import AuthTokenBridge from "./components/AuthTokenBridge";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <AuthTokenBridge>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="courses/:courseId" element={<CoursePage />} />
            <Route
              path="courses/:courseId/module/:moduleIndex/lesson/:lessonIndex"
              element={<LessonPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthTokenBridge>
  );
}