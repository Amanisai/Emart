

import React from 'react'
import Navbar from '../components/Navbar'
import Products from '../components/Products'
import HeroSection from '../components/home/HeroSection'
import OfferBanner from '../components/home/OfferBanner'
import CategoryCards from '../components/home/CategoryCards'

const LandingPage = () => {
  return (
    <div>
        <Navbar />
        <HeroSection />
        <OfferBanner />
        <CategoryCards />
        <Products />
    </div>
  )
}

export default LandingPage