# 🚀 Kubernetes Quick Start

## 30 secondes pour démarrer

```bash
# 1. Prérequis: kubectl installé et connecté au cluster
kubectl cluster-info

# 2. Adapter les secrets
cd k8s/
nano secret.yaml

# 3. Déployer
bash deploy.sh

# 4. Vérifier
bash validate.sh

# 5. Accéder au service
kubectl port-forward svc/library-service 3001:80 -n library-system &
curl http://localhost:3001/health
```

---

## À quoi s'attendre après déploiement

```
✅ Namespace "library-system" créé
✅ PostgreSQL pod en état Running (startup ~30s)
✅ 2 replicas de l'app en état Running
✅ Services (ClusterIP + LoadBalancer) actifs
✅ HPA prêt à scaler automatiquement
```

---

## Vérifications rapides

```bash
# Tous les pods prêts?
kubectl get pods -n library-system

# Les services en marche?
kubectl get svc -n library-system

# Le HPA fonctionne?
kubectl get hpa -n library-system

# Les logs OK?
kubectl logs -f deployment/library-service -n library-system
```

---

## Dépannage rapide

| Symptôme | Solution |
|----------|----------|
| **Pods restent "Pending"** | `kubectl describe pod <nom>` → vérifier les erreurs |
| **"CrashLoopBackOff"** | `kubectl logs <pod>` → lire les erreurs |
| **Service inaccessible** | `kubectl get endpoints library-service -n library-system` |
| **Connexion BD échoue** | `kubectl logs postgres-...` → vérifier credentials |
| **HPA ne scale pas** | `kubectl describe hpa library-service-hpa -n library-system` |

---

## Cleanup total

```bash
# Supprimer tout
kubectl delete namespace library-system
```

---

**Ready? Go `bash k8s/deploy.sh`! 🚀**
