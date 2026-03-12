# 📋 App de Acompanhamento de Tarefas

Aplicação web para **registro e acompanhamento de tarefas diárias**, permitindo identificar **quem realizou cada atividade** e gerar **relatórios de participação dos responsáveis**.

O sistema foi desenvolvido com **Node.js, Express, MySQL, HTML, CSS e JavaScript**, funcionando tanto em **computador quanto em celular**.

---

# 🚀 Funcionalidades

O sistema possui os seguintes módulos:

## 👥 Responsáveis
- Cadastro de responsáveis
- Listagem de responsáveis
- Edição de responsáveis
- Exclusão de responsáveis

## 📝 Tarefas
- Cadastro de tarefas
- Definição do **dia da semana** em que a tarefa deve ser realizada
- Listagem de tarefas

## 📅 Painel Diário
- Seleção de uma data
- Carregamento automático das tarefas daquele dia
- Registro de execução das tarefas
- Possibilidade de associar **um ou mais responsáveis**
- Atualização de status da tarefa:
  - PENDENTE
  - EM ANDAMENTO
  - CONCLUÍDA

## 📊 Relatórios
- Resumo do período selecionado
- Total de tarefas executadas
- Total de tarefas concluídas
- Ranking de participação por responsável
- Percentual de participação de cada responsável

---

# 🧱 Tecnologias Utilizadas

## Backend
- Node.js
- Express
- MySQL
- mysql2

## Frontend
- HTML
- CSS
- JavaScript (Vanilla)

## Banco de Dados
- MySQL

---

# ⚙️ Como executar o projeto

## 1️⃣ Clonar o repositório
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

Entrar na pasta do projeto:
cd SEU-REPOSITORIO

2️⃣ Instalar dependências
Entre na pasta backend:
cd backend

Instale as dependências:
npm install

3️⃣ Configurar o banco de dados
Crie um banco no MySQL chamado:
tarefas_app

Depois configure o arquivo:
backend/config/db.js

Exemplo de configuração:
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'SUA_SENHA',
  database: 'tarefas_app'
});

module.exports = db;

4️⃣ Executar o servidor
Dentro da pasta backend execute:
node server.js
ou usando nodemon:
nodemon server.js

O servidor iniciará em:
http://localhost:3000

5️⃣ Abrir o sistema
Abra no navegador o arquivo:
frontend/pages/index.html

📊 Exemplos de relatórios
O sistema gera relatórios como:
Resumo do período
Total de tarefas
Concluídas
Pendentes
Em andamento
Percentual de conclusão
Ranking de responsáveis

Exemplo:
1º Giovanna — 8 tarefas — 61%
2º Vinícius — 5 tarefas — 39%

📄 Licença

Este projeto está disponível para uso educacional e acadêmico.