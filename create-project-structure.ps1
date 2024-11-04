# create-project-structure.ps1

# Create directories
$dirs = @(
    "src/api",
    "src/components/common",
    "src/components/layout",
    "src/components/schedules",
    "src/pages",
    "src/store",
    "src/utils"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force
}

# API files
@"
import axios from 'axios';

const client = axios.create({
  baseURL: 'YOUR_API_BASE_URL'
});

export default client;
"@ | Out-File -FilePath "src/api/client.ts" -Encoding UTF8

@"
export interface Schedule {
  id: string;
  // Add other types
}
"@ | Out-File -FilePath "src/api/types.ts" -Encoding UTF8

@"
import client from './client';
import { Schedule } from './types';

export const getSchedules = () => client.get<Schedule[]>('/schedules');
"@ | Out-File -FilePath "src/api/schedules.ts" -Encoding UTF8

# Common Components
$commonComponents = @{
    "Button.tsx" = "export const Button = ({ children, ...props }) => <button {...props}>{children}</button>";
    "Input.tsx" = "export const Input = (props) => <input {...props} />";
    "Select.tsx" = "export const Select = ({ children, ...props }) => <select {...props}>{children}</select>";
    "Table.tsx" = "export const Table = ({ children }) => <table>{children}</table>";
    "Modal.tsx" = "export const Modal = ({ children, isOpen }) => isOpen ? <div className='modal'>{children}</div> : null";
}

foreach ($file in $commonComponents.Keys) {
    $content = @"
import { h } from 'preact';

$($commonComponents[$file])
"@
    Out-File -FilePath "src/components/common/$file" -Encoding UTF8 -InputObject $content
}

# Layout Components
$layoutComponents = @{
    "Header.tsx" = "export const Header = () => <header>Header</header>";
    "Sidebar.tsx" = "export const Sidebar = () => <aside>Sidebar</aside>";
    "Layout.tsx" = "export const Layout = ({ children }) => <div className='layout'>{children}</div>";
}

foreach ($file in $layoutComponents.Keys) {
    $content = @"
import { h } from 'preact';

$($layoutComponents[$file])
"@
    Out-File -FilePath "src/components/layout/$file" -Encoding UTF8 -InputObject $content
}

# Schedule Components
$scheduleComponents = @{
    "ScheduleForm.tsx" = "export const ScheduleForm = () => <form>Schedule Form</form>";
    "ScheduleList.tsx" = "export const ScheduleList = () => <div>Schedule List</div>";
    "ScheduleDetail.tsx" = "export const ScheduleDetail = () => <div>Schedule Detail</div>";
    "BlockForm.tsx" = "export const BlockForm = () => <form>Block Form</form>";
    "Analysis.tsx" = "export const Analysis = () => <div>Analysis</div>";
}

foreach ($file in $scheduleComponents.Keys) {
    $content = @"
import { h } from 'preact';

$($scheduleComponents[$file])
"@
    Out-File -FilePath "src/components/schedules/$file" -Encoding UTF8 -InputObject $content
}

# Pages
$pages = @{
    "Dashboard.tsx" = "export const Dashboard = () => <div>Dashboard</div>";
    "Schedules.tsx" = "export const Schedules = () => <div>Schedules</div>";
    "ScheduleEdit.tsx" = "export const ScheduleEdit = () => <div>Schedule Edit</div>";
    "Analysis.tsx" = "export const Analysis = () => <div>Analysis</div>";
}

foreach ($file in $pages.Keys) {
    $content = @"
import { h } from 'preact';

$($pages[$file])
"@
    Out-File -FilePath "src/pages/$file" -Encoding UTF8 -InputObject $content
}

# Store
@"
import { create } from 'zustand';

export const useScheduleStore = create((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
}));
"@ | Out-File -FilePath "src/store/schedules.ts" -Encoding UTF8

# Utils
@"
export const formatDate = (date: Date): string => {
  return date.toISOString();
};
"@ | Out-File -FilePath "src/utils/date.ts" -Encoding UTF8

@"
export const validate = (data: any): boolean => {
  return true; // Implement validation logic
};
"@ | Out-File -FilePath "src/utils/validation.ts" -Encoding UTF8

# Root files
@"
import { h } from 'preact';
import { Layout } from './components/layout/Layout';

export function App() {
  return (
    <Layout>
      <h1>Events Scheduler Admin</h1>
    </Layout>
  );
}
"@ | Out-File -FilePath "src/App.tsx" -Encoding UTF8

@"
:root {
  --primary-color: #007bff;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
"@ | Out-File -FilePath "src/index.css" -Encoding UTF8

@"
import { h, render } from 'preact';
import { App } from './App';
import './index.css';

render(<App />, document.getElementById('app')!);
"@ | Out-File -FilePath "src/main.tsx" -Encoding UTF8

Write-Host "Project structure created successfully!" -ForegroundColor Green