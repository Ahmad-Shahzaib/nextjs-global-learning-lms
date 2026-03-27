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
});

export default rootReducer;
