import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dogImage from '../../assets/images/dog.jpg';
import './Login.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Usuário Demo' }));
      
      toast.success('Bem-vindo ao PetClub!');
      navigate('/pets');
    } catch (error) {
      console.error('Erro ao continuar:', error);
      toast.error('Ocorreu um erro ao continuar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-image-container">
          <img 
            src={dogImage} 
            alt="Cachorro fofo" 
            className="login-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'images/dog.jpg';
            }}
          />
        </div>
        
        <div className="login-form">
          <div className="welcome-container">
            <h2 className="welcome-text">Bem-vindo ao</h2>
            <h1 className="app-name">PetClub</h1>
            <p className="welcome-subtitle">Sua comunidade de amantes de pets</p>
          </div>
          
          <button 
            onClick={handleContinue}
            className="continue-button"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
