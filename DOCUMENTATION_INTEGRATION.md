# 🔗 Documentation Integration

## Flux de navigation par cas d'usage

### Cas 1: "Je veux déployer MAINTENANT"

```
→ k8s/README.md (60 sec)
→ k8s/secret.yaml (modifier credentials)
→ bash k8s/deploy.sh
→ bash k8s/validate.sh
```

**Temps:** 5 minutes

---

### Cas 2: "Je veux comprendre l'architecture"

```
→ PROJECT_STATUS.md (vue d'ensemble)
→ KUBERNETES_GUIDE.md (architecture)
→ Les fichiers k8s/*.yaml (étudier)
```

**Temps:** 30 minutes

---

### Cas 3: "J'ai une erreur"

```
→ K8S_TROUBLESHOOTING.md
→ Chercher le symptôme
→ Suivre la solution
```

**Temps:** 5-30 min

---

### Cas 4: "Je veux multi-env (dev/staging/prod)"

```
→ KUSTOMIZE_GUIDE.md
→ Créer base/ + overlays/
→ kubectl apply -k k8s/overlays/prod/
```

**Temps:** 30 min setup

---

### Cas 5: "Je veux déployer sur [cloud]"

```
→ K8S_CLUSTER_OPTIONS.md
→ Votre section cloud
→ bash k8s/deploy.sh
```

**Temps:** 10-20 min

---

## 📖 Quick Reference par Rôle

### 👨‍💼 Chef de Projet
1. PROJECT_STATUS.md
2. K8S_QUICKSTART.md
3. Comprendre la timeline

### 👨‍💻 Développeur
1. K8S_QUICKSTART.md
2. k8s/README.md
3. Déployer + développer

### 🔧 DevOps
1. KUBERNETES_GUIDE.md
2. K8S_TROUBLESHOOTING.md
3. KUSTOMIZE_GUIDE.md

### 🚨 Support/On-call
K8S_TROUBLESHOOTING.md (c'est votre bible)

### 📚 Apprenant
1. PROJECT_STATUS.md
2. KUBERNETES_GUIDE.md
3. K8S_EXAMPLE_DEPLOYMENT.md

---

## 📁 Fichiers par Type

| Type | Fichiers |
|------|----------|
| **Quick start** | k8s/README.md, K8S_QUICKSTART.md |
| **Complete ref** | KUBERNETES_GUIDE.md |
| **Debug/fix** | K8S_TROUBLESHOOTING.md |
| **Advanced** | KUSTOMIZE_GUIDE.md |
| **Cloud setup** | K8S_CLUSTER_OPTIONS.md |
| **Examples** | K8S_EXAMPLE_DEPLOYMENT.md |
| **Overview** | PROJECT_STATUS.md |

---

## 🎯 Tableau de Décision

**Vous êtes...** → **Lisez d'abord** → **Puis**

| Profil | 1ère | 2e | 3e |
|--------|------|----|----|
| Dev | K8S_QUICKSTART | k8s/README | GUIDE |
| DevOps | GUIDE | TROUBLESHOOTING | KUSTOMIZE |
| Support | TROUBLESHOOTING | GUIDE | k8s/ scripts |
| PM | PROJECT_STATUS | K8S_QUICKSTART | Summary |
| Étudiant | PROJECT_STATUS | GUIDE | EXAMPLE |

---

**Trouvez votre chemin!** 🚀
