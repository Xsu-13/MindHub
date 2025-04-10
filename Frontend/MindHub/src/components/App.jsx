import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './Map.jsx'
import MapList from './MapList.jsx'
import Login from './LoginForm.jsx'
import EditableCodeBlock from './EditableCodeBlock.jsx'
import AcceptInvitePage from './AcceptInvitePage.jsx';
import MouseTracker from './MouseTracker.jsx';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapList />} />
        <Route path="/map" element={<Map />} />
        <Route path="/invite/:token" element={<AcceptInvitePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/code" element={<EditableCodeBlock />} />
        <Route path="/realtime" element={<MouseTracker />} />
      </Routes>
    </Router>
  )
}

export default App
