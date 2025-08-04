import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dogImage from '../../assets/images/dog.jpg';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Usuário Demo', email }));
      
      toast.success('Login realizado com sucesso!');
      navigate('/pets');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('E-mail ou senha inválidos');
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
          <h2 className='.text'>Bem-vindo ao PetClub</h2>
          <p>Faça login para continuar</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Lembrar de mim
              </label>
              <a href="#" className="forgot-password">Esqueceu a senha?</a>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Entrar'}
            </button>
            
            <p className="signup-link">
              Não tem uma conta? <Link to="/register">Cadastre-se</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
