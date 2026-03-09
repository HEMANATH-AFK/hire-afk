import React from 'react';
import { useAuth } from '../context/AuthContext';
import GuestLanding from './GuestLanding';
import StudentLanding from './StudentLanding';
import RecruiterLanding from './RecruiterLanding';
import AdminLanding from './AdminLanding';

const LandingPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <GuestLanding />;
    }

    if (user.role === 'admin') {
        return <AdminLanding user={user} />;
    }

    if (user.role === 'recruiter') {
        return <RecruiterLanding user={user} />;
    }

    return <StudentLanding user={user} />;
};

export default LandingPage;

