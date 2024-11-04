// src/App.tsx
import { h } from 'preact';
import { Router, Route } from 'preact-router';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Schedules } from './pages/Schedules';
import { ScheduleEdit } from './pages/ScheduleEdit';
import { Analysis } from './pages/Analysis';
import { PublicSchedule } from './pages/PublicSchedule';
import { NotFound } from './pages/NotFound';
import { ScheduleArchive } from './pages/ScheduleArchive';

export function App() {
  return (
    <Layout>
      <Router>
        <Route path="/" component={Dashboard} />
        <Route path="/schedules" component={Schedules} />
        <Route path="/schedules/new" component={ScheduleEdit} />
        <Route path="/schedules/:id" component={ScheduleEdit} />
        <Route path="/schedules/:id/edit" component={ScheduleEdit} />
        <Route path="/schedules/archive" component={ScheduleArchive} />
        <Route path="/analysis" component={Analysis} />
        <Route default component={NotFound} />
      </Router>
    </Layout>
  );
}