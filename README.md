# PhysioWatch AI

Protótipo de Mini App para acompanhamento semanal de pacientes de fisioterapia,
com painel do paciente, painel do fisioterapeuta e análise por IA.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

## Como os dados são guardados

Este MVP guarda os dados no `localStorage` do navegador — ou seja, **no
próprio dispositivo**, sem precisar de banco de dados externo. Isso é
suficiente para a demonstração (paciente e fisioterapeuta testando no mesmo
computador/navegador). Para um app real com paciente e fisioterapeuta em
aparelhos diferentes, o próximo passo seria trocar isso por um banco como o
Supabase (isso pode ficar como "evolução futura" na apresentação).

Três pacientes de demonstração já vêm pré-cadastrados com 14 dias de dados
simulados, para o painel do fisioterapeuta não começar vazio.

## Análise por IA

O botão "Gerar análise" chama a rota `/api/analyze` (uma função serverless
em `api/analyze.js`), que por sua vez chama a API da Anthropic (Claude) no
servidor — a chave nunca fica exposta no navegador.

- **Sem chave configurada:** o app funciona normalmente e mostra um resumo
  gerado localmente (regras simples), sem custo e sem configuração.
- **Com chave configurada:** o app usa a IA de verdade para escrever a
  análise clínica.

Para ativar a IA de verdade depois do deploy:

1. Crie uma conta em [console.anthropic.com](https://console.anthropic.com)
   e gere uma chave de API.
2. No painel do seu projeto na Vercel, vá em **Settings → Environment
   Variables** e adicione `ANTHROPIC_API_KEY` com o valor da chave.
3. Refaça o deploy (Vercel → Deployments → ⋯ → Redeploy).

## Publicando na Vercel

Veja o passo a passo completo na conversa com o Claude, ou resumidamente:

```bash
npm install -g vercel
vercel
```

Siga as perguntas no terminal (login, nome do projeto, diretório = pasta
atual). Ao final, a Vercel te dá uma URL pública (`algo.vercel.app`) —
esse é o link que o professor pode acessar.

Para publicar atualizações depois:

```bash
vercel --prod
```
