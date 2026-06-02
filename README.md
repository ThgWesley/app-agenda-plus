# 📱 App Agenda Plus + Google Calendar Sync

## 🎯 O que é isso?

Seu app **Agenda Plus** foi modificado para **sincronizar automaticamente com Google Calendar**!

Agora quando você cria um agendamento no seu app, ele aparece **automaticamente** no Google Calendar.

---

## 📊 Arquivos Inclusos

```
📦 App-Agenda-Plus-Com-Google-Sync.zip
├── 📄 README.md (este arquivo)
├── 📄 GUIA_RAPIDO.md ← COMECE POR AQUI
├── 📄 CHECKLIST.md ← Use para verificar cada etapa
├── 📄 SETUP_GOOGLE_CALENDAR.md ← Instruções detalhadas
├── 📄 DETALHES_TECNICOS.md ← Para curiosos
├── 📄 index.html (✨ modificado)
├── 📁 js/
│   ├── app.js (✨ modificado)
│   ├── google-config.js (✨ novo)
│   ├── google-sync.js (✨ novo)
│   ├── google-form-sync.js (✨ novo)
│   └── ... (outros intactos)
├── 📁 css/ (intacto)
├── 📁 icons/ (intacto)
└── 📄 manifest.json (intacto)
```

---

## 🚀 Quick Start (3 minutos)

### 1️⃣ Google Cloud
- Acesse: https://console.cloud.google.com
- Projeto: **lofty-bolt-378803**
- Vá a: APIs & Services → Credentials
- Procure: **"Agenda Plus Web"**
- Adicione Redirect URI: `https://thgwesley.github.io/app-agenda-plus/`

### 2️⃣ Atualizar App
- Extrair o ZIP
- Copiar arquivos para seu projeto
- Fazer commit e push

### 3️⃣ Usar
- Abrir seu app
- Perfil (⚙️) → "☁️ Sincronizar com Google Agenda"
- Clicar "🔗 Conectar Google Agenda"
- Pronto!

---

## ✨ Novas Features

### Na Seção "Perfil"

#### 🔗 Conectar Google Agenda
Faz login com sua conta Google e autoriza sincronização.

#### 📤 Sincronizar Todos os Eventos
Coloca todos os agendamentos antigos no Google Calendar.

#### ❌ Desconectar
Remove acesso do app ao Google Calendar.

---

## 📋 Como Funciona

```
ANTES (só no app)
└── App Agenda Plus
    └── Seu dados ficam só aqui

AGORA (app + Google)
├── App Agenda Plus
│   └── Dados continuam aqui ✅
└── Google Calendar
    └── Dados também aparecem aqui ✅
```

### Fluxo Automático

```
Você cria evento
    ↓
Salva no app ✅
    ↓
Sincroniza para Google automaticamente ✅
    ↓
Aparece no Google Calendar ✅
```

---

## 🔐 Segurança

✅ **O que é seguro:**
- Token do Google guardado no navegador (encriptado)
- Seus dados continuam no app
- Apenas você acessa (login pessoal)

✅ **O que NÃO é armazenado:**
- Senhas
- Credenciais do Google
- Informações de terceiros

---

## 📱 O que Sincroniza

Quando você cria um evento, estas informações vão para Google Calendar:
- ✅ Nome do cliente
- ✅ Tipo de serviço/kit
- ✅ Data e hora
- ✅ Valor (R$)
- ✅ Status (Pendente, Pago, etc)
- ✅ Forma de pagamento
- ✅ Cor automática por status

---

## 🎨 Cores Automáticas

Cada status tem cor diferente no Google Calendar:
- 🔴 Pendente → Vermelho
- 🟠 50% Pago → Amarelo  
- 🟢 Pago → Verde
- 🔵 Crédito → Azul

---

## ⚙️ O Que Mudou no Código

### Arquivos Novos (3):
- `js/google-config.js` - Configuração do Google
- `js/google-sync.js` - Sincronização
- `js/google-form-sync.js` - Auto-sync do formulário

### Arquivos Modificados (2):
- `index.html` - Nova seção no Perfil
- `js/app.js` - Integração com deleção

### NÃO Foram Modificados:
- Tudo o resto continua igual!
- Seu app funciona exatamente como antes
- Só adicionar Google é opcional

---

## ❓ Dúvidas Comuns

**P: E se eu deletar um evento no Google Calendar?**
R: O app não sincroniza de volta (app é a fonte de verdade).

**P: Minha esposa vê meus agendamentos?**
R: Não. Cada pessoa faz seu login do Google pessoal.

**P: Precisa de conexão internet?**
R: Só para sincronizar. App funciona offline normal.

**P: Quanto custa?**
R: NADA. Google Calendar API é grátis para uso pessoal.

**P: Posso desconectar depois?**
R: Sim. Dados no app continuam, só não sincroniza mais.

---

## 📖 Documentação Completa

Dentro do ZIP tem 4 guias:

1. **GUIA_RAPIDO.md** (LEIA PRIMEIRO)
   - Visão geral rápida
   - Casos de uso
   - FAQ

2. **CHECKLIST.md**
   - Passo a passo com checkboxes
   - Use para não esquecer nada

3. **SETUP_GOOGLE_CALENDAR.md**
   - Instruções detalhadas de setup
   - Troubleshooting

4. **DETALHES_TECNICOS.md**
   - Para desenvolvedores
   - Estrutura de código
   - APIs usadas

---

## 🔄 Fluxo Técnico (Resumido)

```
1. Você clica "Conectar"
   └─→ Google OAuth
   
2. Você faz login
   └─→ Google autoriza
   
3. App recebe token
   └─→ Guardado no navegador
   
4. Você cria evento
   └─→ Salva localmente
   └─→ Envia para Google Calendar
   
5. Pronto! Está em 2 lugares
   └─→ App Agenda Plus
   └─→ Google Calendar
```

---

## 🛠️ Manutenção

### Atualizações Futuras
Se quiser adicionar funcionalidades depois, veja `DETALHES_TECNICOS.md`.

Ideias para o futuro:
- Sincronização bidirecional (Google → App)
- Notificações do Google Calendar
- Múltiplos calendários
- Backup em nuvem

---

## 📞 Suporte

### Se algo não funcionar:

1. Verifique `CHECKLIST.md` - todos passos feitos?
2. Veja console do navegador (F12 → Console) - tem erro?
3. Leia `SETUP_GOOGLE_CALENDAR.md` - dicas de troubleshooting

### Erros comuns:

**"Não sincroniza"**
→ Redirect URI correto? Ver SETUP_GOOGLE_CALENDAR.md

**"Conectar não funciona"**
→ Limpar cache (Ctrl+Shift+Del)

**"Evento não aparece no Google"**
→ Recarregar Google Calendar (F5)

---

## 🎉 Parabéns!

Seu app está **pronto para sincronizar com Google Calendar**! 

Agora é só:
1. Seguir o **GUIA_RAPIDO.md**
2. Usar o **CHECKLIST.md** para controlar
3. Aproveitar a sincronização automática!

---

## 📌 Info Técnica

- **Framework:** Vanilla JavaScript (HTML5, CSS3)
- **Armazenamento:** LocalStorage + Google Calendar API
- **Autenticação:** OAuth 2.0 Implicit Flow
- **API:** Google Calendar API v3
- **Compatibilidade:** Chrome, Firefox, Safari, Edge
- **Modo Offline:** Sim (PWA)

---

## ✅ Status

- ✅ Integração concluída
- ✅ Documentação completa
- ✅ Pronto para produção
- ✅ Seguro e cirúrgico

---

**Desenvolvido com ❤️ para automação de agendamentos**

*Última atualização: Junho 2026*
