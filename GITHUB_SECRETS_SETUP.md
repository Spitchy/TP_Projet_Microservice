# 🔐 GitHub Secrets Configuration

## Setup Guide — Configuration des Secrets GitHub

### ❌ Problèmes courants

1. Secrets non trouvés → déploiement échoue silencieusement
2. Base64 mal encodé → K8s déploiement échoue
3. Permissions insuffisantes → GHCR push échoue

---

## ✅ Configuration Étape par Étape

### 1️⃣ Accédez aux Secrets GitHub

```
Repository → Settings → Secrets and variables → Actions
```

### 2️⃣ SONAR_TOKEN (Analyse Statique)

**Récupération du token :**

1. Allez sur https://sonarcloud.io
2. Connectez-vous avec votre compte GitHub
3. Analysez/Importez le projet `Spitchy/TP_Projet_Microservice`
4. Allez dans **Account → Security → Generate Tokens**
5. Copiez le token

**Ajouter le secret :**

```
Name: SONAR_TOKEN
Secret: <votre_token_sonarcloud>
```

**Vérification :**
```bash
# Le workflow affichera:
# "SonarCloud Scan" ✓ ou "Skipped"
```

### 3️⃣ GITHUB_TOKEN (GHCR — Automatique)

Ce secret est **créé automatiquement** par GitHub.

- Utilisé pour Docker login vers `ghcr.io`
- Permissions par défaut suffisantes

**Vérification :**
```bash
# Le workflow affichera:
# "Build and push Docker image" ✓
```

---

## 🚀 Secrets Optionnels

### 4️⃣ DOCKER_USERNAME & DOCKER_PASSWORD (Docker Hub)

Si vous préférez publier sur Docker Hub au lieu de GHCR :

**Récupération :**

1. Docker Hub → Account Settings → Security → New Access Token
2. Écrire le nom et sélectionner permissions
3. Copier le token

**Ajouter les secrets :**

```
Name: DOCKER_USERNAME
Secret: <votre_username>

Name: DOCKER_PASSWORD
Secret: <votre_access_token>
```

**Modifier le workflow :**

Remplacer dans `.github/workflows/ci-cd.yml` la section `push` :

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

---

### 5️⃣ KUBE_CONFIG (Déploiement Kubernetes)

⚠️ **Requis uniquement** si vous avez un cluster Kubernetes

**Préparation :**

```bash
# 1. Récupérer le kubeconfig
cat ~/.kube/config

# 2. Encoder en base64
cat ~/.kube/config | base64 -w 0
# Sur Windows PowerShell:
certutil -encode ~/.kube/config temp.txt && type temp.txt
# Ou manuellement via base64 encoder en ligne

# 3. Copier le résultat
```

**Ajouter le secret :**

```
Name: KUBE_CONFIG
Secret: <la_chaine_base64_complete>
```

**Vérification :**

```bash
# Dans le workflow, la tâche "Deploy to Staging" s'exécutera
# Sur push de 'develop' uniquement
```

---

## 📋 Checklist des Secrets

- [ ] SONAR_TOKEN configuré (optionnel, mais recommandé)
- [ ] GITHUB_TOKEN existe (automatique)
- [ ] DOCKER_USERNAME & DOCKER_PASSWORD (si Docker Hub)
- [ ] KUBE_CONFIG encodé en base64 (si Kubernetes)

---

## 🧪 Tester les Secrets

### Vérifier que les secrets sont accessibles

1. Créez un PR ou un push
2. Allez dans **Actions**
3. Cliquez sur le run le plus récent
4. Consultez les logs de chaque job

**Erreurs courantes :**

```
❌ "SONAR_TOKEN not found"
→ Ajouter SONAR_TOKEN dans les secrets

❌ "Failed to log in to GHCR"
→ GITHUB_TOKEN permissions insuffisantes

❌ "Invalid kubeconfig"
→ Base64 mal encodé ou fichier corrompu

❌ "certificate verification failed"
→ CA certificate missing dans kubeconfig
```

---

## 🛡️ Bonnes Pratiques

1. **Jamais en dur** : Ne commitez jamais les secrets dans le code
2. **Rotation régulière** : Changez les tokens tous les 3-6 mois
3. **Restrictif** : Donnez les permissions minimales nécessaires
4. **Monitoring** : Consultez les logs d'accès des secrets

---

## 📞 Support

Si vous avez besoin d'aide :

1. Consultez les logs du workflow GitHub Actions
2. Vérifiez que tous les secrets sont bien encodés (base64 pour KUBE_CONFIG)
3. Assurez-vous que le compte a les permissions requises

**Happy deploying! 🚀**
