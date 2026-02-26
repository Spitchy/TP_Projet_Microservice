# 🚀 CI/CD Pipeline Documentation

## Overview

Ce projet utilise **GitHub Actions** pour automatiser le cycle de vie du logiciel. Le pipeline comprend 5 jobs :

1. **Lint & Static Analysis** — Vérification du style de code avec ESLint et analyse de sécurité SAST
2. **Tests & Coverage** — Tests unitaires/intégration avec Jest et rapports de couverture
3. **Build & Scan** — Construction Docker, scan de vulnérabilités avec Trivy, génération SBOM
4. **Push Registry** — Publication sur GitHub Container Registry (GHCR)
5. **Deploy** — Déploiement automatique sur Kubernetes staging (optionnel)

---

## 🔧 Configuration

### Structure des fichiers

```
.github/
  └── workflows/
       └── ci-cd.yml              # Workflow GitHub Actions principal

src/
  └── __tests__/                   # Dossier des tests
       ├── server.test.js          # Tests des endpoints
       └── auth.test.js            # Tests de l'authentification

k8s/
  └── deployment.yaml              # Manifest Kubernetes avec Deployment, Service, HPA

.eslintrc.json                      # Configuration ESLint
jest.config.js                      # Configuration Jest
jest.setup.js                       # Setup Jest
```

### Triggers

Le pipeline s'exécute sur :
- **Push** sur `main`, `develop`, ou `5-jwt-auth`
- **Pull Requests** sur `main` ou `develop`

---

## 🔐 GitHub Secrets

Pour fonctionner correctement, configurez les secrets GitHub suivants :

### 1. **SONAR_TOKEN** (Optionnel)
- Pour SonarCloud SAST
- Récupérez le token sur https://sonarcloud.io
- Activez le projet dans SonarCloud

```bash
# Dans GitHub: Settings → Secrets and variables → Actions
# Ajouter: SONAR_TOKEN = <votre_token_sonarcloud>
```

### 2. **DOCKER_USERNAME** & **DOCKER_PASSWORD** (si Docker Hub)
- Récupérez depuis Docker Hub personal access tokens
- Ou utilisez GitHub Container Registry (automatique avec GITHUB_TOKEN)

```bash
# Pour Docker Hub:
DOCKER_USERNAME=<votre_username>
DOCKER_PASSWORD=<votre_pat_token>
```

### 3. **KUBE_CONFIG** (Déploiement K8s)
- Fichier `~/.kube/config` encodé en base64
- Pour la branche `develop` uniquement

```bash
# Générer le secret:
cat ~/.kube/config | base64 > kube_config_b64.txt

# Copier dans GitHub Secrets: KUBE_CONFIG
```

### 4. **GITHUB_TOKEN** (Automatique)
- Créé automatiquement par GitHub
- Utilisé pour GHCR (GitHub Container Registry)

---

## 📦 Dépendances

### DevDependencies ajoutées

```json
{
  "eslint": "^8.54.0",
  "eslint-config-airbnb-base": "^15.0.0",
  "eslint-plugin-import": "^2.29.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.3"
}
```

Installez localement :

```bash
npm install
```

---

## 🧪 Exécution local

### Lint

```bash
npm run lint          # Vérifier le style
npm run lint -- --fix # Fixer automatiquement
```

### Tests

```bash
npm test              # Exécuter avec couverture
npm run test:watch   # Mode watch
npm run test:coverage # Rapport détaillé
```

### Docker Build

```bash
docker build -t library-app:latest .
docker run -p 3001:3001 library-app:latest
```

---

## 📊 Artefacts générés

### Dans le Pipeline

| Artefact | Job | Stockage | Rétention |
|----------|-----|----------|-----------|
| Test Results | test | GitHub Artifacts | 30 jours |
| Coverage Report | test | GitHub Artifacts | 30 jours |
| SBOM (CycloneDX) | build | GitHub Artifacts | 30 jours |
| Trivy Scan (SARIF) | build | GitHub Security | Permanent |

### Télécharger les artefacts

```bash
# Via GitHub CLI:
gh run download <run_id> --dir <output_dir>

# Via l'interface GitHub:
# Actions → Run → Artifacts → Télécharger
```

---

## 🚢 Déploiement Kubernetes

### Prérequis

1. Cluster Kubernetes configuré
2. Namespace `staging` créé
3. Secrets Kubernetes :

```bash
# Créer les secrets avant déploiement:
kubectl create secret generic postgres-credentials \
  --from-literal=database=library_db \
  --from-literal=username=libraryuser \
  --from-literal=password=librarypassword \
  -n staging

kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your_jwt_secret_change_in_production \
  -n staging
```

### Manifest Features

Le fichier `k8s/deployment.yaml` inclut :

- **Deployment** : 2 replicas avec rolling update
- **Service** : ClusterIP exposant le port 80 → 3001
- **HPA** : Auto-scaling basé CPU (70%) et Memory (80%)
- **Probes** : Liveness et Readiness probes
- **Resources** : Requests et limits définis
- **Security Context** : Non-root user (1000)
- **Pod Anti-Affinity** : Distribution sur plusieurs nœuds

### Déployer manuellement

```bash
kubectl apply -f k8s/deployment.yaml

# Vérifier
kubectl get pods -n staging
kubectl get svc -n staging
kubectl rollout status deployment/library-app -n staging
```

---

## 📈 Monitoring & Rapports

### Coverage Threshold

Défini dans `jest.config.js` :
- Lines: 50%
- Functions: 50%
- Branches: 50%
- Statements: 50%

Augmentez progressivement en ajoutant plus de tests.

### GitHub Security

- Trivy scans sont uploadés à **GitHub Security → Code scanning**
- Consultables dans l'onglet **Security** du repo

### Codecov (Optionnel)

Connecter Codecov pour des rapports détaillés :
1. Activez Codecov dans https://codecov.io
2. Token ajouté automatiquement
3. Consultez les rapports de couverture par commit

---

## 🔄 Workflow Visuel

```
Push to main/develop
         ↓
    ┌────┴────┐
    ↓         ↓
  Lint    (Parallèle de lint + test)
    ↓         ↓
  Test       ↓
    ├─────────┘
    ↓
  Build
    ├─ Trivy Scan
    └─ SBOM Generation
    ↓
  (main/develop seulement)
    ↓
  Push to GHCR
    ↓
  (develop seulement)
    ↓
  Deploy to Staging K8s
```

---

## ⚙️ Troubleshooting

### Pipeline échoue sur Lint

```bash
# Fixer localement:
npm run lint -- --fix
git add .
git commit -m "fix: eslint issues"
git push
```

### Tests échouent

```bash
# Exécuter localement:
npm test

# Ou avec PostgreSQL local:
docker run -d -e POSTGRES_PASSWORD=testpass postgres:15-alpine
npm test
```

### Push to GHCR échoue

- Vérifiez que le token GitHub a les permissions `read:packages`, `write:packages`
- Vérifiez l'authentification : `docker login ghcr.io -u <username>`

### K8s Deployment échoue

```bash
# Vérifiez le secret KUBE_CONFIG:
# 1. Base64 bien encodé ?
# 2. Cluster accessible ?
# 3. Namespace staging existe ?

kubectl get ns staging
kubectl get all -n staging
```

---

## 📚 Ressources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Trivy Scanner](https://github.com/aquasecurity/trivy-action)
- [Jest Documentation](https://jestjs.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

---

**Bon déploiement! 🚀**
