# PhysioWatch AI 🏥

> Seu acompanhamento inteligente de saúde e bem-estar

[![Status](https://img.shields.io/badge/Status-Ativo-brightgreen)]()
[![Versão](https://img.shields.io/badge/Versão-1.1.0-blue)]()
[![Licença](https://img.shields.io/badge/Licença-MIT-green)]()

## 📋 Sobre

**PhysioWatch AI** é uma aplicação web moderna para acompanhamento de saúde e bem-estar de pacientes em tratamento de fisioterapia. Desenvolvida com foco em usabilidade, segurança e eficiência.

### Características Principais

- 👤 **Dois Papéis**: Paciente e Fisioterapeuta
- 📊 **Gráficos Interativos**: Visualização de tendências de saúde
- 💊 **Gerenciamento de Medicamentos**: Rastreamento de adesão
- 📱 **Design Responsivo**: Funciona em desktop e mobile
- 🔐 **Segurança**: Validação robusta e tratamento de erros
- 🚀 **Performance**: Armazenamento local, sem latência

---

## 🎯 Funcionalidades

### Para Pacientes

1. **Autenticação Segura**
   - Login com senha
   - Redefinição de senha
   - Gestão de conta

2. **Dashboard Personalizado**
   - Visualização de dados do dia
   - Status de atualização
   - Atalhos para ações rápidas

3. **Registro Diário de Saúde**
   - Humor e bem-estar (0-10)
   - Nível de dor (0-10)
   - Sono (horas e minutos)
   - Sinais vitais:
     - Frequência Cardíaca (bpm)
     - Pressão Arterial (sistólica/diastólica)
     - Oxigenação (SpO₂)
     - Passos no dia

4. **Gerenciamento de Medicamentos**
   - Lista de medicamentos prescritos
   - Marcar como tomado
   - Adicionar novos medicamentos
   - Rastreamento de adesão

### Para Fisioterapeuta

1. **Painel de Pacientes**
   - Visualização de todos os pacientes
   - Status de saúde com indicador visual
   - Ações rápidas (editar, excluir)

2. **Relatório Clínico Detalhado**
   - Média semanal de indicadores
   - Comparação semana anterior vs. atual
   - Gráficos interativos por métrica
   - Resumo automático em português

3. **Gerenciamento de Pacientes**
   - Cadastrar novo paciente
   - Editar informações
   - Excluir paciente e dados associados
   - Histórico completo de saúde

---

## 🛠️ Tech Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React | 18.3.1 |
| **Build** | Vite | 5.3.1 |
| **Styling** | Tailwind CSS | 3.4.4 |
| **Gráficos** | Recharts | 2.12.7 |
| **Ícones** | Lucide React | 0.383.0 |
| **Armazenamento** | localStorage | - |
| **Tipagem** | JavaScript | - |

---

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passo 1: Clonar Repositório
```bash
git clone https://github.com/seu-usuario/physiowatch-ai.git
cd physiowatch-ai-web
```

### Passo 2: Instalar Dependências
```bash
npm install
```

### Passo 3: Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:5173`

---

## 🚀 Deployment

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

### Deploy no Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🔐 Credenciais de Teste

### Pacientes
| Nome | Senha |
|------|-------|
| Elias Souza | 123 |
| Marina Alves | 123 |

### Fisioterapeuta
| Função | Senha |
|--------|-------|
| Painel do Fisioterapeuta | 1234 |

---

## 📚 Documentação

- [QuickStart](./QUICKSTART.md) - Guia de início rápido
- [Boas Práticas](./BEST_PRACTICES.md) - Padrões de desenvolvimento
- [Melhorias](./IMPROVEMENTS.md) - Detalhes das otimizações
- [Changelog](./CHANGELOG.md) - Histórico de versões

---

## 🎨 Design System

### Paleta de Cores
```
Primary:     #0F6E5C (Verde Teal)
Secondary:   #E3F1EC (Mint)
Warning:     #F59E0B (Amber)
Error:       #EF4444 (Coral)
Background:  #F4F7F6 (Cinza Claro)
Text:        #17231F (Cinza Escuro)
```

### Tipografia
- **Títulos**: Space Grotesk (500, 600, 700)
- **Corpo**: Inter (400, 500, 600)
- **Carregamento**: Google Fonts

### Componentes
- Cards com sombra
- Botões com feedback visual
- Modais responsivos
- Gráficos interativos
- Indicadores de status

---

## 📱 Responsividade

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)
- ✅ Touch-friendly interface

---

## 🔒 Segurança

### Implementado
- ✅ Validação de entrada em todos os formulários
- ✅ Tratamento seguro de erros
- ✅ Confirmação para operações destrutivas
- ✅ Senhas não expostas em logs
- ✅ Sanitização de dados

### Recomendações Futuras
- 🔜 HTTPS obrigatório
- 🔜 Autenticação OAuth
- 🔜 Criptografia de dados
- 🔜 Rate limiting
- 🔜 Auditoria de ações

---

## 🧪 Testes

### Executar Testes (Futuro)
```bash
npm run test
```

### Verificar Erros
```bash
npm run lint
```

### Build Verificação
```bash
npm run build
```

---

## 🐛 Troubleshooting

### Problema: Dados não aparecem
**Solução**: Limpar localStorage
```javascript
localStorage.clear()
location.reload()
```

### Problema: Fontes não carregam
**Solução**: Verificar conexão com Google Fonts

### Problema: Gráficos vazios
**Solução**: Consultar console para erros (F12)

Veja [QUICKSTART.md](./QUICKSTART.md) para mais soluções.

---

## 📊 Estrutura de Dados

### Paciente
```javascript
{
  id: "p1",
  name: "Nome do Paciente",
  age: 45,
  treatment: "Reabilitação de joelho",
  password: "senha123"
}
```

### Entrada de Saúde
```javascript
{
  date: "2024-01-15",
  mood: "bem",
  pain: 3,
  fc: 72,
  paSys: 120,
  paDia: 80,
  spo2: 97,
  sleepHours: 7.5,
  wellbeing: 8,
  steps: 5000
}
```

### Medicamento
```javascript
{
  id: "m1",
  name: "Anti-inflamatório",
  time: "08:00"
}
```

---

## 🗺️ Roadmap

### v1.2.0 (Próxima)
- [ ] Exportar relatórios em PDF
- [ ] Tema claro/escuro
- [ ] Notificações push
- [ ] Modo offline

### v1.3.0
- [ ] Integração com Supabase
- [ ] Autenticação OAuth
- [ ] Aplicativo mobile nativo
- [ ] API REST completa

### v2.0.0
- [ ] Análise de IA avançada
- [ ] Recomendações personalizadas
- [ ] Integração com wearables
- [ ] Suporte a múltiplas clínicas

---

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Veja [BEST_PRACTICES.md](./BEST_PRACTICES.md) para padrões de código.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

---

## 👥 Autores

- **Desenvolvedor**: Seu Nome
- **Versão**: 1.1.0
- **Última Atualização**: 2024

---

## 📞 Contato & Suporte

- 📧 Email: support@physiowatch.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/physiowatch-ai/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-usuario/physiowatch-ai/discussions)

---

## 🙏 Agradecimentos

- React Team pela excelente framework
- Tailwind CSS pela estilização
- Recharts pelos gráficos
- Comunidade open source

---

## 📈 Status do Projeto

| Aspecto | Status |
|---------|--------|
| **Funcionalidades Core** | ✅ Completo |
| **Validação** | ✅ Implementado |
| **Documentação** | ✅ Atualizado |
| **Testes** | 🔄 Em Progresso |
| **Deploy** | 🔄 Configurando |

---

**Desenvolvido com ❤️ para a comunidade de fisioterapia**

*PhysioWatch AI - Seu acompanhamento inteligente de saúde e bem-estar*
