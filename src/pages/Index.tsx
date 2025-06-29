
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import PhotoCarousel from '../components/PhotoCarousel';
import GuestBook from '../components/GuestBook';
import PoetrySection from '../components/PoetrySection';
import EnvelopeButton from '../components/EnvelopeButton';
import { SplashCursor } from '../components/ui/splash-cursor';
import { Button } from '@/components/ui/button';
import { LogIn, Settings } from 'lucide-react';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen professional-dark">
      {/* Splash Cursor Effect */}
      <SplashCursor />
      
      {/* Admin/Auth Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {user && isAdmin ? (
          <Button
            onClick={() => navigate('/admin')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="border-pink-300/30 text-pink-200 hover:bg-pink-500/10"
            size="sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
        )}
      </div>
      
      {/* Header */}
      <header className={`py-12 px-4 text-center glass-effect elegant-shadow transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 tracking-wide glow-text">
          Livro de 15 anos
        </h1>
        <h2 className="text-2xl md:text-3xl font-light text-pink-300 italic">
          Carolyne Lopes Lima
        </h2>
        <div className="mt-6 w-32 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full"></div>
      </header>

      {/* Photo Carousel Section */}
      <section className="py-16 px-4">
        <PhotoCarousel />
      </section>

      {/* Guest Book Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-serif text-white mb-6 glow-text">
            Livro de Assinaturas
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-8"></div>
        </div>
        <GuestBook />
      </section>

      {/* Envelope Button */}
      <div className="flex justify-center py-12">
        <EnvelopeButton />
      </div>

      {/* Poetry Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-black/20 to-black/40">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-serif text-white mb-6 glow-text">
            Versos dos Sonhos
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full mb-8"></div>
        </div>
        <PoetrySection />
      </section>

      {/* Footer */}
      <footer className="bg-black/60 glass-effect text-center py-8 border-t border-purple-500/30">
        <p className="text-gray-300 text-sm md:text-base">
          © 2025 Book Carolyne Lopes Lima - Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
