# 📋 Guide de Test - Postman

## Import de la Collection

1. Ouvrez **Postman**
2. Cliquez sur **Import** (en haut à gauche)
3. Sélectionnez le fichier `postman_collection.json`
4. Cliquez sur **Import**

---

## 🚀 Étapes de Test

### 1️⃣ **Register - Créer un compte**

**Requête:**
```
POST http://localhost:3001/api/auth/register
```

**Body (JSON):**
```json
{
  "nom": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Réponse (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 2️⃣ **Login - Se connecter**

**Requête:**
```
POST http://localhost:3001/api/auth/login
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**⚠️ Copier le token pour l'utiliser dans les autres requêtes!**

---

### 3️⃣ **Get My Profile - Voir mon profil**

**Requête:**
```
GET http://localhost:3001/api/auth/profile
```

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse (200 OK):**
```json
{
  "user": {
    "id": 1,
    "nom": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-02-26T10:00:00.000Z",
    "updatedAt": "2026-02-26T10:00:00.000Z"
  }
}
```

---

### 4️⃣ **Get All Users - Lister tous les utilisateurs (ADMIN)**

**Requête:**
```
GET http://localhost:3001/api/users
```

**Header:**
```
Authorization: Bearer TOKEN_DE_USER_ADMIN
```

**Réponse (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "nom": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2026-02-26T10:00:00.000Z",
      "updatedAt": "2026-02-26T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 5️⃣ **Update User - Mettre à jour un utilisateur**

**Requête:**
```
PUT http://localhost:3001/api/users/1
```

**Header:**
```
Authorization: Bearer YOUR_TOKEN
```

**Body (JSON):**
```json
{
  "nom": "Jane Doe",
  "email": "jane@example.com"
}
```

**Réponse (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "nom": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

### 6️⃣ **Delete User - Supprimer un utilisateur (ADMIN)**

**Requête:**
```
DELETE http://localhost:3001/api/users/2
```

**Header:**
```
Authorization: Bearer TOKEN_DE_USER_ADMIN
```

**Réponse (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 🔑 Comment Utiliser les Tokens dans Postman

### Méthode 1: Header Manuel
1. Allez dans l'onglet **Headers**
2. Ajoutez une clé: `Authorization`
3. Valeur: `Bearer VOTRE_TOKEN`

### Méthode 2: Variable d'Environnement (Recommandé)
1. Créez un nouvel **Environment** nommé "Library API"
2. Ajoutez une variable: `token` = `VOTRE_TOKEN`
3. Utilisez `{{token}}` dans le header: `Bearer {{token}}`

---

## ❌ Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 401 Unauthorized | Token manquant ou invalide | Copiez le token du login dans le header |
| 403 Forbidden | Pas de permission admin | Utilisez un token d'admin |
| 409 Conflict | Email déjà enregistré | Utilisez un email unique |
| 400 Bad Request | Champs manquants ou invalides | Vérifiez le body de la requête |

---

## 📝 Exemple Complet de Test

```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# 2. Login (copier le token)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Get Profile avec token
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer TOKEN_REÇU"
```

---

**Bon test! 🚀**
