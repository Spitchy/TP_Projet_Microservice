# ⚡ 60 Seconds to Production

## Les fichiers importants à retenir

```
k8s/
├── secret.yaml ⚠️          ← À MODIFIER (credentials)
├── deploy.sh               ← À EXÉCUTER
├── validate.sh             ← Pour vérifier
└── test-scaling.sh         ← Pour tester HPA
```

---

## Checklist avant déploiement (5 min)

- [ ] `kubectl cluster-info` → fonctionne?
- [ ] `kubectl get nodes` → au moins 1 nœud?
- [ ] S'il y a pas de PVC, créer PVC manuellement ou utiliser emptyDir

---

## GO! Déployer maintenant

### 1️⃣ Personnaliser les secrets

```bash
cd k8s/
nano secret.yaml
```

Chercher et modifier:
```yaml
stringData:
  POSTGRES_USER: "postgres"      # ← Changer
  POSTGRES_PASSWORD: "password"  # ← Changer! (générer: openssl rand -base64 32)
  # JWT_SECRET: ... 
```

### 2️⃣ Lancer le déploiement

```bash
# Rendre exécutable une seule fois
chmod +x deploy.sh validate.sh test-scaling.sh

# Déployer
bash deploy.sh

# ⏳ Attendre 2 minutes (postgres startup)
```

### 3️⃣ Vérifier

```bash
bash validate.sh

# Ou manuellement
kubectl get pods -n library-system
kubectl get svc -n library-system
```

### 4️⃣ Accéder au service

```bash
# Port-forward
kubectl port-forward svc/library-service 3001:80 -n library-system &

# Tester
curl http://localhost:3001/health

# Ou login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@admin.com","password":"password123"}'
```

### 5️⃣ Tester le scaling

```bash
bash test-scaling.sh
```

Vous devriez voir:
```
Replicas: 2 → 4 → 2 (after 60 seconds)
```

---

## En cas de problème

```bash
# Voir les logs
kubectl logs -f deployment/library-service -n library-system

# Voir les événements
kubectl describe pod <pod-name> -n library-system

# Lire le troubleshooting complet
cat ../K8S_TROUBLESHOOTING.md
```

---

## Tout fonctionne?

Si vous voyez:
```
NAME                  READY   STATUS    RESTARTS   AGE
library-app-...       1/1     Running   0          X
library-app-...       1/1     Running   0          X
postgres-...          1/1     Running   0          X
```

✅ **Vous êtes prêt!**

---

## Cleanup (destructif)

```bash
# Supprimer TOUT (données incluses)
kubectl delete namespace library-system

# Ou juste arrêter sans supprimer
kubectl scale deployment library-service --replicas=0 -n library-system
```

---

**Ready? Let's go!** 🚀

Questions? Voir les guides principaux.
