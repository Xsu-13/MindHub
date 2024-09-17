import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './Map.jsx'
import MapList from './MapList.jsx'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapList />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </Router>
  )
}

export default App
