# 📱 Gastômetro - Controle de Gastos Pessoais

<p align="center">
  <img src="./assets/images/logo.png" alt="Gastômetro Logo" width="100"/>
</p>

## 📋 Sobre o Projeto

O **Gastômetro** é um aplicativo de controle de gastos pessoais desenvolvido em React Native que permite aos usuários gerenciar suas finanças de forma prática e intuitiva. O projeto surgiu a partir de um trabalho da faculdade e combinou com a necessidade real de controlar gastos do dia a dia, tornando-se uma ferramenta útil para organização financeira pessoal.

### 🎯 Funcionalidades Principais

- **📊 Dashboard Interativo**: Visualização de estatísticas e gráficos dos gastos
- **💰 Controle de Gastos**: Adicionar, editar e excluir gastos com categorização
- **🏷️ Gestão de Categorias**: Criar e personalizar categorias com ícones e cores
- **📈 Relatórios**: Análise detalhada com insights sobre padrões de gastos
- **🔐 Autenticação Segura**: Login e registro via Firebase Authentication
- **⚡ Tempo Real**: Atualizações automáticas dos dados
- **📱 Interface Responsiva**: Design moderno e intuitivo

## 🖼️ Preview das Telas Principais

### Tela de Login e Cadastro
![image](https://github.com/user-attachments/assets/c6b44186-8a31-4e85-9e09-5f984926923f)
![image](https://github.com/user-attachments/assets/ad251bf6-5341-42b3-bd99-ab3e0e451ecd)

### Relatório
![image](https://github.com/user-attachments/assets/6d68550c-0c29-4c64-9fa1-9496d88f13ba)
![image](https://github.com/user-attachments/assets/743417d0-1efa-4aba-8858-67431b24ad5c)

### Lista de Gastos
![image](https://github.com/user-attachments/assets/8bf47bf1-b961-44d4-a9fd-92404df8abe9)

### Categorias
![image](https://github.com/user-attachments/assets/3b5c1d10-b183-490f-ae0d-c956d3b36fea)

### Perfil
![image](https://github.com/user-attachments/assets/4462b69b-dc42-47f7-85fd-53aecaa5915b)


## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento
- **Firebase** - Backend como serviço
  - Authentication (Autenticação)
  - Firestore Database (Banco de dados)
- **React Navigation** - Navegação entre telas
- **Context API** - Gerenciamento de estado global
- **React Native Vector Icons** - Ícones do aplicativo

## 📋 Requisitos do Trabalho

### ✅ Requisitos Técnicos Cumpridos

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| **Aplicativo React Native** | ✅ | App desenvolvido com React Native e Expo |
| **Navegação entre telas (2+ tipos)** | ✅ | Stack Navigator + Tab Navigator implementados |
| **Autenticação Firebase** | ✅ | Login, Logout e Registro funcionais |
| **Context API/Estado Global** | ✅ | AuthContext para gerenciar usuário logado |
| **CRUD de entidade** | ✅ | CRUD completo para Gastos e Categorias |
| **Responsividade/Visual** | ✅ | Interface responsiva com design moderno |


## 🚀 Como Executar o Projeto

### 📱 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI
- Aplicativo Expo Go no celular

### 📥 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/KaykeAhrens/Gastometro.git
cd gastometro
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Inicie o projeto**
```bash
npx expo start
```

### 📱 Executando no Dispositivo

1. **Baixe o Expo Go**
   - [Android - Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Conecte o dispositivo**
   - Escaneie o QR Code que aparece no terminal/navegador
   - Certifique-se de que o celular e computador estão na mesma rede WiFi

### 🔧 Problemas de Conexão?

Se o QR Code não funcionar, tente usar o modo **tunnel**:

```bash
npx expo start --tunnel
```

Este comando usa o serviço do Expo para criar um túnel, funcionando mesmo em redes diferentes.

## 🏗️ Estrutura do Projeto

```
gastometro/
├── src/
│   ├── components/          
│   │   ├── BotaoAcao.js   
│   │   ├── BotaoSimples.js 
│   │   ├── CampoInput.js   
│   │   ├── CategoriaItem.js 
│   │   ├── GraficoBarras.js
│   │   ├── ItemGasto.js    
│   │   ├── ModalCategoria.js 
│   │   ├── ModalSelecaoCategoria.js 
│   │   └── ModalSelecaoData.js 
│   ├── contexts/           
│   │   └── AuthContext.js 
│   ├── navigation/         
│   │   └── index.js      
│   ├── screens/           
│   │   ├── AdicionarGastoScreen.js 
│   │   ├── CategoriasScreen.js 
│   │   ├── DashboardScreen.js 
│   │   ├── EditarGastoScreen.js 
│   │   ├── HomeScreen.js   
│   │   ├── LoginScreen.js  
│   │   ├── PerfilScreen.js 
│   │   ├── RegisterScreen.js 
│   │   └── SplashScreen.js 
│   └── services/        
│       └── firebase.js    
├── assets/               
└── App.js               
```

## 🔥 Configuração do Firebase

### 1. Authentication
- Método: Email/Password
- Configuração automática de usuários

### 2. Firestore Database
**Coleções:**
- `gastos` - Armazena os gastos dos usuários
- `categorias` - Armazena as categorias personalizadas

**Regras de Segurança:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 👥 Funcionalidades por Tela

### 🏠 Home (Lista de Gastos)
- Visualização de todos os gastos
- Total gasto calculado automaticamente
- Edição e exclusão de gastos
- Navegação para adicionar novos gastos

### 📊 Dashboard (Relatórios)
- Gráfico de gastos por mês
- Top 5 maiores gastos
- Estatísticas detalhadas (maior, menor, média)
- Insights automáticos sobre padrões de gasto
- Auto-refresh a cada 30 segundos

### 🏷️ Categorias
- Criar categorias personalizadas
- Definir orçamentos por categoria
- Personalizar ícones e cores
- Acompanhar gastos vs orçamento

### 🔐 Login/Registro
- Autenticação segura via Firebase
- Validação de formulários
- Estados de loading
- Tratamento de erros

## 🎨 Design System

- **Figma**: https://www.figma.com/design/Xnb5GUjQz2gvXpdrI1Adle/Untitled?node-id=0-1&t=yXQeTTBeeGe4Ee2f-1
- **Cores Principais**: 
  - Background: `#1E1E2E`
  - Cards: `#2A2A3C`
- **Ícones**: Material Icons

## 🔄 Atualizações em Tempo Real

O aplicativo utiliza **Firestore listeners** para atualizações em tempo real:
- Gastos são atualizados automaticamente ao serem criados/editados
- Categorias sincronizam instantaneamente
- Dashboard possui auto-refresh configurável

## 🤝 Contribuição

Este projeto foi desenvolvido como trabalho acadêmico, demonstrando as principais funcionalidades do React Native e integração com Firebase.

---

<p align="center">
  Desenvolvido por Kayke e Bruna com ❤️
</p>

