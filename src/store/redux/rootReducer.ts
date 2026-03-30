import { combineReducers } from '@reduxjs/toolkit';






import usersSlice from './slices/usersSlice';
import authSlice from './slices/authSlice';
import adminDashboardSlice from './slices/adminDashboardSlice';
import staffsSlice from './slices/staffsSlice';
import studentsSlice from './slices/studentsSlice';
import instructorsSlice from './slices/instructorsSlice';
import categoriesSlice from './slices/categoriesSlice';
import notificationsSlice from './slices/notificationsSlice';
import purchasedCoursesSlice from './slices/PurchaseCourseSlice';
import userDashboardSlice from './slices/userDashboardSlice';
import profileSlice from './slices/profileSlice';
import commentsSlice from './slices/commentsSlice';
import assignmentsSlice from './slices/assignmentsSlice';


const rootReducer = combineReducers({
  users: usersSlice,
  auth: authSlice,
  adminDashboard: adminDashboardSlice,
  staffs: staffsSlice,
  students: studentsSlice,
  instructors: instructorsSlice,
  categories: categoriesSlice,
  notifications: notificationsSlice,
  purchasedCourses: purchasedCoursesSlice,
  userDashboard: userDashboardSlice,
  profile: profileSlice,
  comments: commentsSlice,
  assignments: assignmentsSlice,
});

export default rootReducer;
