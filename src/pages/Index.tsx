
import React, { useState, useEffect } from 'react';
import PhotoCarousel from '../components/PhotoCarousel';
import GuestBook from '../components/GuestBook';
import PoetrySection from '../components/PoetrySection';
import EnvelopeButton from '../components/EnvelopeButton';
import { SplashCursor } from '../components/ui/splash-cursor';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-amber-50">
      {/* Splash Cursor Effect */}
      <SplashCursor />
      
      {/* Header */}
      <header className={`py-8 px-4 text-center bg-gradient-to-r from-pink-200 via-purple-200 to-amber-100 shadow-lg transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="text-4xl md:text-6xl font-serif text-gray-800 mb-2 tracking-wide">
          Livro de 15 anos
        </h1>
        <h2 className="text-2xl md:text-3xl font-light text-pink-700 italic">
          Caroline Lopes Lima
        </h2>
        <div className="mt-4 w-32 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full"></div>
      </header>

      {/* Photo Carousel Section - First two quadrants */}
      <section className="py-12 px-4">
        <PhotoCarousel />
      </section>

      {/* Guest Book Section - Third quadrant */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-pink-50">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
            Livro de Assinaturas
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-8"></div>
        </div>
        <GuestBook />
      </section>

      {/* Envelope Button */}
      <div className="flex justify-center py-8">
        <EnvelopeButton />
      </div>

      {/* Poetry Section - Fourth quadrant */}
      <section className="py-12 px-4 bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
            Versos dos Sonhos
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-8"></div>
        </div>
        <PoetrySection />
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-center py-6 border-t-4 border-amber-400">
        <p className="text-gray-300 text-sm md:text-base">
          © 2025 Book Caroline Lopes Lima - Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
