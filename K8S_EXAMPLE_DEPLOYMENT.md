# 📍 Exemple de Déploiement Complet

## Scénario: Déployer sur kind (Local)

### Step 1: Créer le cluster

```bash
$ kind create cluster --name library

Creating cluster "library" ...
 ✓ Ensuring node image
 ✓ Preparing nodes
 ✓ Starting control-plane
 ✓ Installing CNI
 ✓ Installing StorageClass
Set kubectl context to "kind-library"

# ✅ Cluster créé!
```

### Step 2: Adapter les secrets

```bash
$ cd k8s/
$ nano secret.yaml

# Changer:
stringData:
  POSTGRES_USER: "admin"
  POSTGRES_PASSWORD: "MySecurePassword123!@#"
  JWT_SECRET: "<random-secret>"
```

### Step 3: Déployer

```bash
$ chmod +x deploy.sh validate.sh

$ bash deploy.sh

===== Library Service Deployment =====

[1/8] Creating namespace...
namespace/library-system created

[2/8] Applying ConfigMap...
configmap/library-config created

...

✅ All pods ready!
✅ PostgreSQL ready!

===== 🎉 Deployment Complete! =====
```

### Step 4: Valider

```bash
$ bash validate.sh

✅ kubectl is available
✅ Namespace 'library-system' exists
✅ All pods running!
✅ Service has endpoints (2 pods)
✅ System Status: HEALTHY
```

### Step 5: Tester

```bash
# Port-forward
$ kubectl port-forward svc/library-service 3001:80 -n library-system &

# Health check
$ curl http://localhost:3001/health
{"status":"OK"}

# Login
$ curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@admin.com","password":"password123"}'

{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### Step 6: Test de scaling

```bash
$ bash test-scaling.sh

===== HPA Scaling Test =====

Current replicas: 2

[1/3] Scaling to 4 replicas...
✅ Scaled to 4!

[2/3] Waiting 60 seconds...

[3/3] Scaling back to 2 replicas...
✅ Scale back complete!
```

---

## Timeline du déploiement

```
00:00 - Cluster créé
00:30 - Secrets adaptés
01:00 - Deploy script lancé
02:00 - PostgreSQL prêt ✅
03:00 - App prête ✅
03:30 - Test réussi ✅
04:00 - Scaling test ✅

Temps total: ~4 minutes
```

---

**Prêt à déployer?** 🚀
