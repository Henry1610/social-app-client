// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { selectIsAuthenticated, selectCurrentUser } from '../features/auth/authSlice';

// // User pages
// import HomePage from '../pages/user/HomePage';
// import ExplorePage from '../pages/user/ExplorePage';
// import ProfilePage from '../pages/user/ProfilePage';
// import MessagesPage from '../pages/user/MessagesPage';
// import NotificationsPage from '../pages/user/NotificationsPage';
// import SettingsPage from '../pages/user/SettingsPage';
// import PostDetailPage from '../pages/user/PostDetailPage';

// // Settings sub-pages
// import EditProfile from '../features/profile/EditProfile';
// import ChangePassword from '../features/auth/ChangePassword';
// import PrivacySettings from '../pages/user/settings/PrivacySettings';

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const currentUser = useSelector(selectCurrentUser);
  
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
  
//   // Nếu là admin, redirect về admin dashboard
//   if (currentUser?.role === 'admin') {
//     return <Navigate to="/admin/dashboard" replace />;
//   }
  
//   return children;
// };

// const UserRoutes = () => {
//   return (
//     <Routes>
//       {/* Main routes */}
//       <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
//       <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
//       <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
//       <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
//       <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      
//       {/* Profile */}
//       <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
//       <Route path="/profile/:username/followers" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
//       <Route path="/profile/:username/following" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
//       {/* Post detail */}
//       <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
      
//       {/* Settings */}
//       <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}>
//         <Route index element={<Navigate to="/settings/edit-profile" replace />} />
//         <Route path="edit-profile" element={<EditProfile />} />
//         <Route path="change-password" element={<ChangePassword />} />
//         <Route path="privacy" element={<PrivacySettings />} />
//       </Route>
      
//       {/* Catch all - redirect to home */}
//       <Route path="*" element={<Navigate to="/home" replace />} />
//     </Routes>
//   );
// };

// export default UserRoutes;