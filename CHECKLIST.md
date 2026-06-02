# ✅ CHECKLIST - Implementação Google Calendar Sync

## 📋 Antes de Começar

- [ ] Você tem acesso ao Google Cloud Console
- [ ] Você conhece a URL do seu app: `https://thgwesley.github.io/app-agenda-plus/`
- [ ] Seu app está funcionando normalmente
- [ ] Você tem 10 minutos disponíveis

---

## 🔧 FASE 1: Configurar Google Cloud (5 minutos)

### ☁️ Google Cloud Console

- [ ] Abrir: https://console.cloud.google.com
- [ ] Fazer login com sua conta Google
- [ ] Selecionar projeto: **"lofty-bolt-378803"**

### 🔑 Credentials

- [ ] Menu esquerdo → **"APIs & Services"**
- [ ] Clique em **"Credentials"**
- [ ] Procurar por **"Agenda Plus Web"** (tipo: Web application)
- [ ] Clicar nela para abrir detalhes

### 🌐 Redirect URI

- [ ] Encontrar seção **"Authorized redirect URIs"**
- [ ] Verificar se já existe: `http://localhost:3000`
- [ ] **ADICIONAR** novo URI: `https://thgwesley.github.io/app-agenda-plus/`
- [ ] Clique **"Salvar"**

### ✅ Verificação

- [ ] Apareceu mensagem de sucesso
- [ ] Aguardar 1-2 minutos para aplicar (Google leva um tempo)

---

## 📦 FASE 2: Atualizar Arquivos do App (2 minutos)

### 📥 Download

- [ ] Baixar arquivo: **`App-Agenda-Plus-Com-Google-Sync.zip`**
- [ ] Extrair em local seguro

### 📁 Substituir Arquivos

Copiar para seu projeto (substitua):
- [ ] `index.html` (modificado)
- [ ] `js/app.js` (modificado)
- [ ] `js/google-config.js` (novo)
- [ ] `js/google-sync.js` (novo)
- [ ] `js/google-form-sync.js` (novo)

NÃO substituir (continuam iguais):
- [ ] `css/style.css`
- [ ] `js/calendar.js`
- [ ] `js/finance.js`
- [ ] `js/report.js`
- [ ] `js/storage.js`
- [ ] `js/ui.js`
- [ ] `manifest.json`
- [ ] `icons/`

### ✅ Verificação

- [ ] Todos os arquivos no lugar correto
- [ ] Nenhum arquivo foi deletado por acidente

---

## 🚀 FASE 3: Deploy (1 minuto)

### 📤 Upload para GitHub Pages

- [ ] Fazer commit dos arquivos alterados
- [ ] Push para o repositório
- [ ] Aguardar GitHub atualizar (2-5 minutos)

### ✅ Verificação

- [ ] Entrar em: https://thgwesley.github.io/app-agenda-plus/
- [ ] Verificar se carregou corretamente
- [ ] Verificar se o console (F12) não tem erros

---

## 🔗 FASE 4: Conectar ao Google (1 minuto)

### 📱 No seu app

- [ ] Abrir seu app no navegador
- [ ] Ir para aba **Perfil** (⚙️)
- [ ] Procurar por **"☁️ Sincronizar com Google Agenda"**
- [ ] Clicar em **"🔗 Conectar Google Agenda"**

### 🔐 Login Google

- [ ] Fazer login com sua conta Google
- [ ] Permitir acesso ao calendário
- [ ] Volta automaticamente para o app

### ✅ Verificação

- [ ] Mensagem aparece: "✅ Status: Conectado ao Google Calendar"
- [ ] Botões mudam (mostra "Sincronizar" e "Desconectar")

---

## 🧪 FASE 5: Teste (2 minutos)

### 📝 Criar novo evento

- [ ] Voltar para **Agenda** (📅)
- [ ] Clicar **"+ Novo"**
- [ ] Preencher dados:
  - [ ] Nome: "Teste Google Sync"
  - [ ] Data: hoje ou amanhã
  - [ ] Valor: R$ 100,00
  - [ ] Status: Pago
- [ ] Clicar **"Salvar no Calendário"**

### 🔍 Verificar Sincronização

- [ ] Aguardar 2-3 segundos
- [ ] Verificar console (F12 → Console)
- [ ] Procurar pela mensagem: "✅ Evento criado no Google Calendar"
- [ ] Abrir Google Calendar em outra aba
- [ ] Procurar pelo evento "Teste Google Sync"
- [ ] ✅ Encontrou? Perfeito!

### 🔄 Testar Atualização

- [ ] Voltar para seu app
- [ ] Clicar no evento criado
- [ ] Mudar status para "Pendente"
- [ ] Abrir Google Calendar em outra aba
- [ ] Verificar se a cor do evento mudou (vermelho)
- [ ] ✅ Mudou? Ótimo!

### 🗑️ Testar Deleção

- [ ] Voltar para seu app
- [ ] Procurar o evento de teste
- [ ] Clicar em "..." (ações) e deletar
- [ ] Abrir Google Calendar
- [ ] Verificar se o evento foi deletado lá também
- [ ] ✅ Deletou? Perfeito!

---

## 🎯 FASE 6: Sincronizar Eventos Antigos (opcional)

Se tem agendamentos antigos que quer colocar no Google:

- [ ] Ir para **Perfil**
- [ ] Procurar por **"📤 Sincronizar todos os eventos"**
- [ ] Clicar
- [ ] Aguardar mensagem de conclusão
- [ ] Abrir Google Calendar
- [ ] Verificar se todos os eventos apareceram
- [ ] ✅ Apareceram?

---

## 🏁 FASE FINAL: Validação Completa

### No App

- [ ] Criar mais 2-3 agendamentos novos
- [ ] Mudar status de alguns eventos
- [ ] Deletar um evento teste
- [ ] Tudo funcionando normal?

### No Google Calendar

- [ ] Todos os novos eventos aparecem?
- [ ] Cores estão corretas por status?
- [ ] Informações estão completas (cliente, valor, etc)?
- [ ] Deletar um evento no app → deleta no Google?

### Documentação

- [ ] Leu `GUIA_RAPIDO.md`?
- [ ] Leu `SETUP_GOOGLE_CALENDAR.md` para referência?
- [ ] Salvou `DETALHES_TECNICOS.md` em local seguro?

---

## 🎉 SUCESSO!

Se todos os itens acima estão marcados ✅, parabéns!

Seu app está 100% sincronizando com Google Calendar! 🚀

---

## 🆘 Se algo não funcionou

### Se Google Calendar não sincroniza

- [ ] Verificar console (F12 → Console) para erros
- [ ] Desconectar e reconectar ao Google
- [ ] Limpar cache do navegador
- [ ] Verificar Redirect URI no Google Cloud

### Se Google Cloud não aceita o Redirect URI

- [ ] Verificar se foi digitado exatamente: `https://thgwesley.github.io/app-agenda-plus/`
- [ ] Sem espaços, sem typos
- [ ] Aguardar 5 minutos depois de salvar

### Se o evento não aparece no Google

- [ ] Verificar console para mensagem de erro
- [ ] Recarregar Google Calendar (F5)
- [ ] Verificar se está na agenda correta
- [ ] Tentar criar outro evento

---

## 📞 Próximos Passos

Depois que tudo estiver funcionando:

1. **Compartilhe com sua esposa** a URL do app
2. **Cada um faz seu próprio login** (Google)
3. **Cada um vê sua própria agenda** Google
4. **Dados do app são compartilhados** entre vocês

Se tiver dúvidas sobre funcionalidades futuras, veja `DETALHES_TECNICOS.md`.

---

**Boa sorte! 🍀**
