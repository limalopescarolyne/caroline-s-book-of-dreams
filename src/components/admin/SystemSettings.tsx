
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  carousel_photos_count: number;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    carousel_photos_count: 5
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSettings = () => {
    // Carregar configurações do localStorage
    const savedCount = localStorage.getItem('carousel_photos_count');
    if (savedCount) {
      setSettings({
        carousel_photos_count: parseInt(savedCount, 10)
      });
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Salvar no localStorage
      localStorage.setItem('carousel_photos_count', settings.carousel_photos_count.toString());
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <Card className="glass-effect border-pink-200/30">
      <CardHeader>
        <CardTitle className="text-white">Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="carousel_count" className="text-gray-200">
            Número de fotos no carousel (máximo 8)
          </Label>
          <Input
            id="carousel_count"
            type="number"
            min="3"
            max="8"
            value={settings.carousel_photos_count}
            onChange={(e) => setSettings({
              ...settings,
              carousel_photos_count: Math.min(8, Math.max(3, parseInt(e.target.value) || 5))
            })}
            className="bg-white/10 border-pink-300/30 text-white"
          />
          <p className="text-sm text-gray-400">
            Define quantas fotos serão exibidas simultaneamente no carousel
          </p>
        </div>

        <Button
          onClick={saveSettings}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
