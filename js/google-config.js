// ============================================
// CONFIGURAÇÃO GOOGLE CALENDAR + DRIVE API
// ============================================

const GoogleConfig = {
    // API Key (para chamadas diretas)
    API_KEY: 'AIzaSyD15PiC_a6LkJqoVqD7XW2ogujETN-IjWk',
    
    // Credenciais OAuth 2.0
    CLIENT_ID: '1043225940082-uqvh1rj7m76smmf36k2ivjdvj998506s.apps.googleusercontent.com',
    SCOPES: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/drive.file'
    ].join(' '),
    
    // URL de redirecionamento
    REDIRECT_URI: 'https://thgwesley.github.io/app-agenda-plus/',
    
    // Endpoints do Google
    AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token',
    CALENDAR_API: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    DRIVE_API: 'https://www.googleapis.com/drive/v3/files',
    DRIVE_UPLOAD: 'https://www.googleapis.com/upload/drive/v3/files',
    
    // Estado local
    getToken: function() {
        return localStorage.getItem('google_access_token');
    },
    
    setToken: function(token) {
        localStorage.setItem('google_access_token', token);
    },
    
    clearToken: function() {
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_backup_file_id');
    },
    
    isConnected: function() {
        return !!this.getToken();
    },
    
    // Backup File ID no Drive
    getBackupFileId: function() {
        return localStorage.getItem('google_backup_file_id');
    },
    
    setBackupFileId: function(fileId) {
        localStorage.setItem('google_backup_file_id', fileId);
    }
};
