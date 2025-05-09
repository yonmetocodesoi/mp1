import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackAccess } from '../services/trackingService';
import AnimatedBackground from '../components/AnimatedBackground';

const Tracking: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Iniciando rastreamento...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleTracking = async () => {
      if (!linkId) {
        setError('Link inválido');
        return;
      }

      try {
        setStatus('Coletando informações do dispositivo...');
        await trackAccess(linkId);
        setStatus('Rastreamento concluído!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Error during tracking:', error);
        setError('Ocorreu um erro durante o rastreamento');
      }
    };

    handleTracking();
  }, [linkId, navigate]);

  return (
    <div className="min-h-screen text-white">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-gray-900 bg-opacity-70 p-8 rounded-xl backdrop-blur-sm border border-indigo-900 mt-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
                MySpy
              </span>
            </h2>
            
            {error ? (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 text-white rounded-lg p-3 text-sm">
                {error}
              </div>
            ) : (
              <div className="text-gray-300">
                <p>{status}</p>
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking; 