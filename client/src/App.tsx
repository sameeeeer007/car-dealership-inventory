import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
function AppBody() { const { token } = useAuth(); return token ? <Dashboard/> : <AuthPage/>; }
export default function App() { return <AuthProvider><AppBody/></AuthProvider>; }
