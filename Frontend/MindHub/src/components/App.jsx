import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './Map.jsx'
import MapList from './MapList.jsx'
import Login from './LoginForm.jsx'
import SignUp from './SignUpForm.jsx'
import EditableCodeBlock from './EditableCodeBlock.jsx'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapList />} />
        <Route path="/map" element={<Map />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/code" element={<EditableCodeBlock />} />
      </Routes>
    </Router>
  )
}

export default App
