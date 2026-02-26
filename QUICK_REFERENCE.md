# 🎯 QUICK REFERENCE - Kubernetes Phase 5

## 📋 TODO List — Avant de déployer

- [ ] Lire `k8s/README.md` (2 min)
- [ ] Modifier `k8s/secret.yaml` (2 min)
- [ ] Exécuter `bash k8s/deploy.sh` (3 min)
- [ ] Exécuter `bash k8s/validate.sh` (1 min)

**Total: 8 minutes** → Application running! 🚀

---

## 📚 Documentation Rapide

| Besoin | Fichier | Temps |
|--------|---------|-------|
| Déployer maintenant | `k8s/README.md` | ⚡ 5 min |
| Apprendre vite | `K8S_QUICKSTART.md` | 10 min |
| Tout comprendre | `KUBERNETES_GUIDE.md` | 1h |
| Fixer un problème | `K8S_TROUBLESHOOTING.md` | 5-30 min |
| Multi-env setup | `KUSTOMIZE_GUIDE.md` | 30 min |
| Cloud provider | `K8S_CLUSTER_OPTIONS.md` | 20 min |
| Voir un exemple | `K8S_EXAMPLE_DEPLOYMENT.md` | 15 min |

---

## 🚀 Commandes Essentielles

```bash
# DÉPLOYER
cd k8s/
bash deploy.sh

# VÉRIFIER
bash validate.sh

# TESTER
bash test-scaling.sh

# PORT-FORWARD
kubectl port-forward svc/library-service 3001:80 -n library-system &
curl http://localhost:3001/health

# LOGS
kubectl logs -f deployment/library-service -n library-system

# CLEANUP
kubectl delete namespace library-system
```

---

## ✅ Par Rôle

| Rôle | Lire d'abord | Action |
|------|-------------|--------|
| Dev | k8s/README.md | Déployer |
| DevOps | KUBERNETES_GUIDE | Setup |
| Support | K8S_TROUBLESHOOTING | Fixer |
| PM | PROJECT_STATUS | Valider |
| Étudiant | K8S_QUICKSTART | Apprendre |

---

## 🎬 Right Now

```bash
cd k8s/
nano secret.yaml          # Change POSTGRES_PASSWORD
bash deploy.sh            # Deploy
bash validate.sh          # Verify
```

**That's it!** 🚀

---

**Help?** → Voir DOCUMENTATION_INTEGRATION.md 📖
