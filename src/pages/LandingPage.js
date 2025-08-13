import React, { useState, useEffect } from 'react';
// import "./landingpage.css"
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
// import { useAppState } from '../Context/AppStateContext';
// import Toast from '../components/Toast';


const LandingPage = () => {
  // const {toast,setToast} = useAppState()
  return (
    <div  className='landingpage-container'>
     <Navbar/>
     <Hero/>
    </div>
  );
};

export default LandingPage; 