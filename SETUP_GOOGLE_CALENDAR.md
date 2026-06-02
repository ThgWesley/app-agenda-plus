# 🔧 SETUP - Integração Google Calendar

## ✅ O que foi feito no seu app

Seu app foi modificado de forma **cirúrgica** para sincronizar automaticamente com Google Calendar:

### Novos Arquivos:
- **`js/google-config.js`** - Configurações do OAuth
- **`js/google-sync.js`** - Lógica de sincronização
- **`js/google-form-sync.js`** - Interceptação do formulário

### Modificações:
- **`index.html`** - Nova seção no Perfil para conectar Google Agenda
- **`js/app.js`** - Integração com deleção de eventos

---

## 📋 PRÓXIMO PASSO - Configurar no Google Cloud

Você precisa fazer **UMA ÚNICA VEZ** para liberar seu app a acessar seu Google Calendar pessoal:

### 1️⃣ Vá ao Google Cloud Console
```
https://console.cloud.google.com
```

### 2️⃣ Selecione seu projeto
- Clique no dropdown "Select a Project" no topo
- Escolha **"lofty-bolt-378803"**

### 3️⃣ Vá para Credentials
- Menu esquerdo → **"APIs & Services"**
- Clique em **"Credentials"**

### 4️⃣ Encontre sua credencial OAuth
Procure por um item chamado **"Agenda Plus Web"** (do tipo "Web application")

### 5️⃣ Atualize o Redirect URI
Clique nela e encontre a seção **"Authorized redirect URIs"**

**Adicione este Redirect URI:**
```
https://thgwesley.github.io/app-agenda-plus/
```

E também deixe (se ainda não estiver):
```
http://localhost:3000
```

Clique **"Salvar"**

---

## 🚀 Pronto!

Agora quando você abrir seu app:

1. ✅ Vá para **Perfil** (⚙️)
2. ✅ Procure por **"☁️ Sincronizar com Google Agenda"**
3. ✅ Clique **"🔗 Conectar Google Agenda"**
4. ✅ Fará login no Google (apenas uma vez)
5. ✅ Pronto! Agora está conectado

---

## 📱 Como funciona

### Quando você cria um agendamento:
```
Você cria: João Silva - Pegue e Monte P - 15/06/2026
    ↓
Salva localmente no app ✅
    ↓
Sincroniza automaticamente para seu Google Calendar ✅
```

### No Google Calendar, você vê:
```
📅 João Silva - Pegue e Monte P
⏰ 15/06/2026 às 9h
Cliente: João Silva
Serviço: Pegue e Monte P
Valor: R$ 500,00
Status: 🟢 Pago
```

---

## 🔄 Sincronizar eventos antigos

Se você já tem agendamentos no app e quer colocá-los no Google:

1. ✅ Conecte ao Google (conforme acima)
2. ✅ Volte para **Perfil**
3. ✅ Clique **"📤 Sincronizar todos os eventos"**
4. ✅ Pronto! Todos irão para Google Calendar

---

## ⚠️ Importante

- **Google Calendar é optional** - se desconectar, seu app continua funcionando normalmente
- **Dados offline** - tudo continua salvo no app mesmo se desconectar
- **Sincronização automática** - não precisa fazer nada, é automático quando conectado
- **Deletar evento** - se deletar no seu app, deleta também do Google Calendar

---

## ❓ Dúvidas?

Tudo está bem documentado no código. Se tiver problema:

1. Verifique se o Redirect URI foi salvo corretamente
2. Tente fazer login novamente
3. Verifique se o Google Calendar API está habilitado no projeto

---

## 📝 Resumo técnico

- **Auth:** OAuth 2.0 Implicit Flow
- **Token:** Armazenado seguro em localStorage
- **API:** Google Calendar API v3
- **Encoding:** UTF-8 com suporte a emojis
- **Timezone:** America/Sao_Paulo (automático)

---

**Seu app está pronto para sincronizar! 🎉**
