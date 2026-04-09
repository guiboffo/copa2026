# 🏆 Copa do Mundo 2026 — Simulador Interativo

## Guia Completo: do Zero ao Site no Ar (GRÁTIS)

---

## 📋 Resumo do que você vai fazer

| Etapa | O quê | Custo | Tempo |
|-------|--------|-------|-------|
| 1 | Criar conta no GitHub | Grátis | 2 min |
| 2 | Subir o projeto pro GitHub | Grátis | 5 min |
| 3 | Criar conta na Vercel e publicar | Grátis | 3 min |
| **Total** | **Site no ar com URL própria** | **R$ 0** | **~10 min** |

> **Sobre o banco de dados:** O app usa `localStorage` — os dados ficam salvos
> no navegador de cada usuário automaticamente. Não precisa de banco de dados
> nenhum! Cada pessoa que acessar o site terá seus próprios resultados salvos.

---

## PASSO 1 — Instalar o necessário no seu computador

Você precisa ter instalado:

### Node.js
- Acesse https://nodejs.org
- Baixe a versão **LTS** (botão verde)
- Instale normalmente (Next, Next, Next...)
- Para verificar, abra o terminal/prompt e digite:
  ```
  node --version
  ```
  Deve aparecer algo como `v20.x.x`

### Git
- Acesse https://git-scm.com
- Baixe e instale
- Para verificar:
  ```
  git --version
  ```

---

## PASSO 2 — Preparar o projeto no seu computador

### 2.1 — Extrair os arquivos
Extraia o arquivo ZIP deste projeto em uma pasta no seu computador.
A estrutura deve ficar assim:

```
copa2026-site/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── src/
│   ├── main.jsx
│   └── App.jsx
└── public/
```

### 2.2 — Instalar as dependências
Abra o terminal/prompt na pasta do projeto e rode:

```bash
cd copa2026-site
npm install
```

### 2.3 — Testar localmente
```bash
npm run dev
```

Vai aparecer algo como:
```
Local: http://localhost:5173/
```

Abra esse link no navegador. Se aparecer o simulador, está tudo certo!
Aperte `Ctrl+C` no terminal para parar.

---

## PASSO 3 — Criar conta no GitHub e subir o projeto

### 3.1 — Criar conta
- Acesse https://github.com
- Clique em **Sign up**
- Crie sua conta (é grátis)

### 3.2 — Criar um repositório
- No GitHub, clique no **+** no canto superior direito → **New repository**
- Nome: `copa2026` (ou o que quiser)
- Deixe como **Public**
- **NÃO** marque "Add a README file"
- Clique **Create repository**

### 3.3 — Subir o código
No terminal, dentro da pasta do projeto, rode estes comandos **um por um**:

```bash
git init
git add .
git commit -m "Simulador Copa 2026"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/copa2026.git
git push -u origin main
```

> ⚠️ Troque `SEU_USUARIO` pelo seu nome de usuário do GitHub!

Se pedir login, coloque seu usuário e senha do GitHub.
(Se usar autenticação de dois fatores, precisará criar um Personal Access Token —
o GitHub vai te guiar nesse processo.)

---

## PASSO 4 — Publicar na Vercel (GRÁTIS!)

### 4.1 — Criar conta na Vercel
- Acesse https://vercel.com
- Clique em **Sign Up**
- Escolha **Continue with GitHub** (mais fácil!)
- Autorize o acesso

### 4.2 — Importar o projeto
- No painel da Vercel, clique em **Add New... → Project**
- Vai aparecer a lista dos seus repositórios do GitHub
- Encontre `copa2026` e clique **Import**
- A Vercel vai detectar automaticamente que é um projeto Vite
- Clique em **Deploy**
- Aguarde ~1 minuto

### 4.3 — Pronto! 🎉
A Vercel vai te dar uma URL tipo:
```
https://copa2026-seuusuario.vercel.app
```

**Esse é o seu site! Pode compartilhar com quem quiser.**

---

## 🔄 Como atualizar o site depois

Sempre que quiser fazer alterações:

1. Edite os arquivos no seu computador
2. No terminal, rode:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```
3. A Vercel atualiza automaticamente em ~30 segundos!

---

## 🌐 Domínio personalizado (OPCIONAL)

Quer um endereço tipo `copa2026.com.br`?

1. Compre o domínio no Registro.br (~R$ 40/ano) ou Namecheap (~$10/ano)
2. Na Vercel, vá em **Settings → Domains**
3. Adicione seu domínio e siga as instruções para apontar o DNS

---

## ❓ Perguntas Frequentes

### "Os dados dos usuários ficam salvos?"
Sim! Cada navegador salva os dados automaticamente via `localStorage`.
Se a pessoa limpar os dados do navegador, perde o progresso.

### "Preciso de banco de dados?"
Para o uso atual (cada pessoa salva seus próprios resultados), **não**.
Se no futuro quiser que os dados sincronizem entre dispositivos,
aí sim precisaria de um banco. Opções gratuitas:
- **Supabase** (free tier: banco PostgreSQL grátis) — https://supabase.com
- **Firebase** (free tier: Firestore grátis) — https://firebase.google.com

### "Quantas pessoas podem acessar?"
O plano grátis da Vercel suporta até **100GB de banda por mês**.
Como o site é leve (~200KB), isso dá milhões de acessos tranquilamente.

### "Posso colocar anúncios?"
Sim, o site é seu! Pode adicionar Google AdSense ou qualquer outro serviço.

### "E se eu quiser editar o visual?"
Edite o arquivo `src/App.jsx` — todo o código está lá.
As cores, fontes e layout podem ser alterados nas constantes de estilo no final do arquivo.
