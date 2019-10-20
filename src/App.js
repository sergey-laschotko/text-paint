import React from 'react';
import './App.css';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CanvasGenerator from './components/CanvasGenerator';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="content">
        <CanvasGenerator />
      </div>
      <Footer />
    </div>
  );
}

export default App;
