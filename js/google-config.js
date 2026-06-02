// ============================================
// CONFIGURAÇÃO GOOGLE CALENDAR API
// ============================================

const GoogleConfig = {
    // Credenciais OAuth 2.0
    CLIENT_ID: '1043225940082-uqvh1rj7m76smmf36k2ivjdvj998506s.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/calendar',
    
    // URL de redirecionamento
    REDIRECT_URI: 'https://thgwesley.github.io/app-agenda-plus/',
    
    // Endpoints do Google
    AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token',
    CALENDAR_API: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    
    // Estado local
    getToken: function() {
        return localStorage.getItem('google_access_token');
    },
    
    setToken: function(token) {
        localStorage.setItem('google_access_token', token);
    },
    
    clearToken: function() {
        localStorage.removeItem('google_access_token');
    },
    
    isConnected: function() {
        return !!this.getToken();
    }
};
