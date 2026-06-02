// ============================================
// MÓDULO DE BACKUP NO GOOGLE DRIVE
// ============================================

const GoogleDriveBackup = {
    BACKUP_FILENAME: 'AgendaPlusBackup.json',
    BACKUP_FOLDER: 'Agenda Plus Backup',
    backupFileId: null,
    
    // Encontrar ou criar pasta de backup
    async ensureBackupFolder() {
        try {
            // Procura pasta existente
            const response = await fetch(
                `${GoogleConfig.DRIVE_API}/files?q=name='${this.BACKUP_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive&access_token=${GoogleConfig.getToken()}`,
                { method: 'GET' }
            );
            
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
            
            // Cria nova pasta se não existir
            const createResponse = await fetch(
                `${GoogleConfig.DRIVE_API}/files?access_token=${GoogleConfig.getToken()}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.BACKUP_FOLDER,
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                }
            );
            
            const folderData = await createResponse.json();
            return folderData.id;
        } catch (error) {
            console.error('Erro ao criar pasta:', error);
            return null;
        }
    },
    
    // Encontrar arquivo de backup existente
    async findBackupFile(folderId) {
        try {
            const response = await fetch(
                `${GoogleConfig.DRIVE_API}/files?q=name='${this.BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false&spaces=drive&access_token=${GoogleConfig.getToken()}`,
                { method: 'GET' }
            );
            
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                this.backupFileId = data.files[0].id;
                return data.files[0].id;
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao procurar arquivo:', error);
            return null;
        }
    },
    
    // Salvar backup (cria ou atualiza)
    async backup() {
        if (!GoogleConfig.isConnected()) {
            console.warn('Google não conectado');
            return false;
        }
        
        try {
            const clients = Storage.get('clients') || [];
            const profile = Storage.get('profile') || {};
            
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                userEmail: GoogleConfig.getUserEmail(),
                data: {
                    clients: clients,
                    profile: profile
                }
            };
            
            const folderId = await this.ensureBackupFolder();
            if (!folderId) {
                console.error('Não conseguiu criar/acessar pasta');
                return false;
            }
            
            let fileId = this.backupFileId || await this.findBackupFile(folderId);
            
            if (fileId) {
                // Atualizar arquivo existente
                const updateResponse = await fetch(
                    `${GoogleConfig.DRIVE_API}/files/${fileId}?access_token=${GoogleConfig.getToken()}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mimeType: 'application/json'
                        })
                    }
                );
                
                // Upload do conteúdo
                await fetch(
                    `${GoogleConfig.DRIVE_API}/upload/drive/v3/files/${fileId}?uploadType=media&access_token=${GoogleConfig.getToken()}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(backupData)
                    }
                );
                
                console.log('✅ Backup atualizado no Google Drive');
            } else {
                // Criar novo arquivo
                const createResponse = await fetch(
                    `${GoogleConfig.DRIVE_API}/upload/drive/v3/files?uploadType=multipart&access_token=${GoogleConfig.getToken()}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: this.BACKUP_FILENAME,
                            mimeType: 'application/json',
                            parents: [folderId],
                            fields: 'id'
                        })
                    }
                );
                
                const fileData = await createResponse.json();
                this.backupFileId = fileData.id;
                
                // Upload do conteúdo
                await fetch(
                    `${GoogleConfig.DRIVE_API}/upload/drive/v3/files/${fileData.id}?uploadType=media&access_token=${GoogleConfig.getToken()}`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(backupData)
                    }
                );
                
                console.log('✅ Backup criado no Google Drive');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao fazer backup:', error);
            return false;
        }
    },
    
    // Restaurar backup
    async restore() {
        if (!GoogleConfig.isConnected()) {
            console.warn('Google não conectado');
            return false;
        }
        
        try {
            const folderId = await this.ensureBackupFolder();
            const fileId = await this.findBackupFile(folderId);
            
            if (!fileId) {
                console.warn('Nenhum backup encontrado');
                return false;
            }
            
            const response = await fetch(
                `${GoogleConfig.DRIVE_API}/files/${fileId}?alt=media&access_token=${GoogleConfig.getToken()}`
            );
            
            const backupData = await response.json();
            
            if (backupData.data) {
                Storage.set('clients', backupData.data.clients || []);
                Storage.set('profile', backupData.data.profile || {});
                console.log('✅ Backup restaurado com sucesso');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return false;
        }
    }
};

// Auto-backup a cada salvamento
document.addEventListener('DOMContentLoaded', function() {
    // Fazer backup sempre que algo muda
    const originalSetStorage = Storage.set;
    Storage.set = function(key, value) {
        originalSetStorage.call(this, key, value);
        
        // Auto-backup se conectado
        if (GoogleConfig.isConnected() && key === 'clients') {
            GoogleDriveBackup.backup();
        }
    };
});
