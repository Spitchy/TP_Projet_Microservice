# 📘 Troubleshooting Kubernetes

## 🔴 Les pods restent en "Pending"

### Diagnostic

```bash
kubectl describe pod <pod-name> -n library-system
```

Cherchez le message d'erreur dans "Events".

### Solutions

**Pas assez de ressources:**
```bash
# Réduire les requests
nano k8s/app-deployment.yaml
# resources:
#   requests:
#     cpu: 50m (au lieu de 100m)
kubectl apply -f k8s/app-deployment.yaml
```

**PVC non bindée:**
```bash
kubectl get pvc -n library-system
kubectl apply -f k8s/pvc.yaml
```

---

## 🔴 Les pods crashent ("CrashLoopBackOff")

### Diagnostic

```bash
kubectl logs <pod-name> -n library-system
kubectl logs <pod-name> -n library-system --previous
```

### Solutions

**Env vars manquantes:**
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl rollout restart deployment/library-service -n library-system
```

**Erreur connexion BD:**
```bash
# Vérifier que postgres est en cours d'exécution
kubectl get pod -n library-system -l app=postgres
kubectl logs <postgres-pod> -n library-system
```

---

## 🔴 Service inaccessible

### Vérifications

```bash
kubectl get endpoints library-service -n library-system
kubectl describe svc library-service -n library-system
```

### Solution

```bash
# Vérifier que les pods sont "Ready"
kubectl get pods -n library-system
# S'ils ne sont pas ready, voir sections ci-dessus
```

---

## 🟡 Port-forward échoue

```bash
# Vérifier que le service existe
kubectl get svc library-service -n library-system
kubectl get endpoints library-service -n library-system

# Réessayer
kubectl port-forward svc/library-service 3001:80 -n library-system
```

---

## 🟡 HPA ne scale pas

```bash
# Vérifier HPA
kubectl describe hpa library-service-hpa -n library-system

# Metrics disponibles?
kubectl top pods -n library-system
# Si "Unknown", metrics-server absent
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 🎯 Checklist de debug

1. ✅ Pods en "Running"?
   ```bash
   kubectl get pods -n library-system
   ```

2. ✅ Pods "Ready"?
   ```bash
   kubectl describe pod <pod> -n library-system
   ```

3. ✅ Services ont endpoints?
   ```bash
   kubectl get endpoints -n library-system
   ```

4. ✅ HPA actif?
   ```bash
   kubectl get hpa -n library-system
   ```

5. ✅ Metrics disponibles?
   ```bash
   kubectl top pods -n library-system
   ```

---

**Plus d'aide? Consultez KUBERNETES_GUIDE.md** 📖
