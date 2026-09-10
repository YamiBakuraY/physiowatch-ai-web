# 🚀 Quick Start - PhysioWatch AI

## Executar o Projeto Localmente

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará em: `http://localhost:5173`

### 3. Build para Produção

```bash
npm run build
```

### 4. Preview do Build

```bash
npm run preview
```

---

## 🔐 Credenciais de Teste

### Pacientes
- **Nome**: Elias Souza
  - **Senha**: 123
  
- **Nome**: Marina Alves
  - **Senha**: 123

### Fisioterapeuta
- **Senha**: 1234

---

## 📱 Acessos Disponíveis

### Para Paciente
1. Login → Selecionar paciente → Digitar senha
2. Dashboard - Ver dados do dia
3. Registro Diário - Preencher dados de saúde
4. Medicamentos - Marcar como tomado
5. Redefinir Senha - Alterar senha

### Para Fisioterapeuta
1. Login → Selecionar "Sou fisioterapeuta" → Digitar senha (1234)
2. Painel de Pacientes - Ver status de todos
3. Relatório Clínico - Ver gráficos e comparações
4. Gerenciar Pacientes - Adicionar, editar ou excluir

---

## 🎨 Componentes Principais

### LoginScreen
- Tela de autenticação com dois papéis
- Validação de senha
- Interface amigável

### PatientHome
- Dashboard com dados do dia
- Botões de ação rápida
- Status de atualização

### DailyEntryForm
- Formulário de registro diário
- Validação em tempo real
- Campos opcionais para sinais vitais

### MedsScreen
- Lista de medicamentos
- Marcar como tomado
- Adicionar novos medicamentos

### PhysioList
- Visualização de todos os pacientes
- Status de saúde visual
- Ações de editar/excluir

### PhysioReport
- Gráficos interativos
- Comparação semana a semana
- Resumo automático

---

## 🔧 Estrutura de Pastas

```
physiowatch-ai-web/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Entrada React
│   └── index.css        # Estilos globais
├── api/                 # Endpoints serverless (futuro)
├── lib/                 # Utilitários
├── supabase/            # Schema do banco (futuro)
├── index.html           # HTML principal
├── vite.config.js       # Configuração Vite
├── tailwind.config.js   # Configuração Tailwind
├── postcss.config.js    # Configuração PostCSS
├── package.json         # Dependências
├── IMPROVEMENTS.md      # Detalhes das melhorias
├── CHANGELOG.md         # Histórico de mudanças
└── BEST_PRACTICES.md    # Guia de boas práticas
```

---

## 📊 Dados Armazenados (localStorage)

```javascript
// Dados de pacientes
localStorage['patients:list']

// Entradas de saúde por paciente
localStorage['entries:p1']
localStorage['entries:p2']

// Medicamentos por paciente
localStorage['meds:p1']
localStorage['meds:p2']

// Medicamentos tomados por paciente
localStorage['medTaken:p1']
localStorage['medTaken:p2']
```

---

## 🧪 Testar Funcionalidades

### 1. Adicionar Entrada Diária
- Acesse como paciente
- Clique "Preencher dados de hoje"
- Preencha os campos
- Clique "Salvar registro"

### 2. Registrar Medicamento Tomado
- Acesse "Meus medicamentos"
- Clique "Já tomei" no medicamento
- Status muda para "Tomado"

### 3. Adicionar Novo Paciente (Como Fisio)
- Acesse painel fisioterapeuta
- Clique "Cadastrar novo paciente"
- Preencha os dados
- Clique "Cadastrar"

### 4. Visualizar Gráficos
- Como fisio, selecione um paciente
- No relatório, clique em qualquer métrica
- Modal com gráfico aparece

### 5. Redefinir Senha (Como Paciente)
- No dashboard, clique "Redefinir senha"
- Digite senha atual e nova
- Clique "Salvar senha"

---

## 🐛 Troubleshooting

### Problema: "Erro ao recuperar dados"
**Solução**: Limpar localStorage
```javascript
// No console do navegador
localStorage.clear()
// Recarregar a página
window.location.reload()
```

### Problema: Fontes não carregando
**Solução**: Verificar conexão com Google Fonts
- Verificar conexão de internet
- Abrir DevTools (F12) → Network
- Procurar por googleapis.com

### Problema: Gráficos não aparecem
**Solução**: Verificar console para erros
- Abrir DevTools (F12) → Console
- Procurar por mensagens de erro
- Verificar dados de entrada

### Problema: Medicamentos não aparecem
**Solução**: Recarregar página
- Pressionar F5
- Se persistir, limpar localStorage

---

## 💡 Dicas de Uso

### Dados de Teste Pré-populados
- Cada paciente tem 14 dias de dados demo
- Dados variam realistically
- Útil para testar gráficos

### Tema Escuro
- Aplicativo usa tema escuro por padrão
- Paleta verde teal profissional
- Otimizado para leitura

### Responsividade
- Funciona bem em mobile
- Otimizado para telas até 480px
- Touch-friendly buttons

### Performance
- Sem requisições de rede
- Tudo armazenado localmente
- Rápido e responsivo

---

## 🚀 Próximos Passos

### Curto Prazo
1. Testar em mobile real
2. Adicionar mais dados de teste
3. Criar manual do usuário

### Médio Prazo
1. Integrar com Supabase
2. Configurar autenticação real
3. Deploy no Vercel

### Longo Prazo
1. Backend com Node.js/Express
2. Análise de IA avançada
3. Aplicativo mobile nativo

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique BEST_PRACTICES.md
2. Consulte CHANGELOG.md
3. Abra issue no repositório

---

## ✨ Melhorias Implementadas Nesta Versão

✅ Validação robusta de entrada
✅ Tratamento completo de erros
✅ Feedback visual ao usuário
✅ Fontes Google carregadas
✅ localStorage com segurança
✅ Operações destrutivas com confirmação
✅ Mensagens de erro em português
✅ Código bem documentado
✅ Componentes reutilizáveis
✅ Design responsivo

---

**PhysioWatch AI v1.1.0** ❤️
Desenvolvido com React, Vite e Tailwind CSS
