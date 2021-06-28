// Privacy Policy URL to use in developer.facebook for login with facebook
// https://www.termsfeed.com/live/9d77b86d-ddbd-46f7-8830-66ef2d671063

import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Main from "./components/Main";

import './assets/css/App.css';

function App() {
  return (
    <MemoryRouter>
      <div className="App">
        <header className="App-header">
          <div>Sentimental Analyzer</div>
        </header>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="/main" element={<Main />} />
        </Routes>
      </div>
    </MemoryRouter >
  );
}

export default App;
