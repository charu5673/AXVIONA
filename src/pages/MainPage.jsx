// css import
import '../App.css';

// react functionalities import 
import { useNavigate } from 'react-router-dom';


// pages import


// components import


// hooks import


function MainPage() {

  const navigate = useNavigate();

  return (
    <div id="main-page">
      <h1 id="main-title">AXVIONA</h1>
      <button id="start-button" onClick={() => navigate('/create')}>play!</button>
    </div>
  );
}

export default MainPage;