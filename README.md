# PetClub Frontend

Bem-vindo ao projeto PetClub! Este é o frontend da aplicação de clube de benefícios para pets.

## 🚀 Começando

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

### Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em `http://localhost:3000`.

## 🏗 Estrutura do Projeto

```
src/
├── assets/          # Imagens, ícones, fontes, etc.
├── components/      # Componentes reutilizáveis
│   ├── common/      # Componentes comuns (botões, inputs, etc)
│   ├── layout/      # Componentes de layout (header, footer, sidebar)
│   └── ui/          # Componentes de interface do usuário
├── pages/           # Páginas da aplicação
├── hooks/           # Custom hooks
├── services/        # Chamadas à API e serviços
├── utils/           # Funções utilitárias
├── styles/          # Estilos globais e temas
├── contexts/        # Contextos do React
├── routes/          # Configuração de rotas
└── types/           # Tipos TypeScript
```

## 🛠 Tecnologias

- React 18
- TypeScript
- Vite
- CSS Modules
- React Router (para roteamento)
- Axios (para requisições HTTP)

## 📝 Licença

Este projeto está sob a licença MIT.
