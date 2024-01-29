import React from 'react';
import { Routes, Route } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetails from '../pages/ProjectDetails';
import CalendarPage from '../pages/CalendarPage';
import DocumentsPage from '../pages/DocumentsPage';
import TasksPage from '../pages/TasksPage';
import DocumentDetails from '../pages/docs/DocumentDetails';
import SignUp from '../pages/auth/SignUp';
import LogIn from '../pages/auth/LogIn';
import ProtectedRoute from './ProtectedRoute';
import TaskDetails from '../pages/TaskDetails';

const createRoutes = () => {
    return (
        <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/" element={<ProtectedRoute />}>
                <Route path="/dashboard?" element={<DashboardPage />} />
                {['projects/my-projects?', 'projects/shared?', 'projects/temp?'].map(
                    (route) => (
                        <Route key={route} path={route} element={<ProjectsPage />} />
                    )
                )}
                <Route path="projects/:id/*" element={<ProjectDetails />} />
                <Route path="docs" element={<DocumentsPage />} />
                <Route path="docs/:id" element={<DocumentDetails />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/:id" element={<TaskDetails />} />
                <Route path="schedule" element={<CalendarPage />} />
            </Route>
        </Routes>
    );
};

export default createRoutes;
