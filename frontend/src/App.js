import './App.css';
import './index.css';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LetsDo from './pages/LetsDo';
import LetsEat from './pages/LetsEat';
import BoardDetail from './pages/BoardDetail';
import Write from './components/Write';
import FilterDetail from './pages/FilterDetail';
import { useState } from 'react';
import MyContext from './components/MyContext';
import Matching from './pages/Matching';

function App() {
  const [nickname, setNickname] = useState('');

  const [people, setPeople] = useState('any');
  const [gender, setGender] = useState('any');
  const [age, setAge] = useState('any');
  const [menu, setMenu] = useState('any');
  const [conversation, setConversation] = useState('any');

  const [startTime, setStartTime] = useState('');

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const handleSaveFilters = (filters) => {
    setPeople(filters.people);
    setGender(filters.gender);
    setAge(filters.age);
    setMenu(filters.menu);
    setConversation(filters.conversation);
  };

  const handleLocation = (latitude, longitude) => {
    setLatitude(latitude);
    setLongitude(longitude);
  };

  return (
    <MyContext.Provider
      value={{
        handleSaveFilters,
        people,
        gender,
        age,
        menu,
        conversation,
        startTime,
        setStartTime,
        latitude,
        longitude,
        handleLocation,
        nickname,
        setNickname,
      }}
    >
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/MyPage" element={<MyPage />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/LetsEat" element={<LetsEat />} />
            <Route path="/LetsDo" element={<LetsDo />} />
            <Route path="/board/:id" element={<LetsDo />} />
            <Route path="/posts/:id" element={<BoardDetail />} />
            <Route path="/write" element={<Write />} />
            <Route path="/write/:id" element={<Write />} />
            <Route path="/FilterDetail" element={<FilterDetail />} />
            <Route path="/Matching" element={<Matching />} />
          </Routes>
        </div>
      </BrowserRouter>
    </MyContext.Provider>
  );
}

export default App;
