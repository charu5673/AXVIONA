import './App.css'
import './pages/MainPage.jsx';
import MainPage from './pages/MainPage.jsx';
import CreatePage from './pages/CreatePage.jsx';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/create" element={<CreatePage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
