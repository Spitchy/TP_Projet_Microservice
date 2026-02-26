# 🐳 PHASE 5 — Kubernetes Deployment Guide

## Overview

Phase 5 déploie le service Library Management sur Kubernetes avec haute disponibilité, auto-scaling et persistance de données.

### Architecture

```
┌─ Namespace: library-system ─────────────────────────┐
│                                                       │
│  ┌─ Deployment: library-service ──────────────────┐ │
│  │ • 2-6 replicas (HPA basé CPU 70%)              │ │
│  │ • RollingUpdate (maxSurge: 1, maxUnavailable: 0)│ │
│  │ • ConfigMap + Secrets (injected)               │ │
│  │ • Liveliness & Readiness probes                │ │
│  └─────────────────────────────────────────────────┘ │
│                          ↓                            │
│  ┌─ Service: library-service (ClusterIP) ─────────┐ │
│  │ • Internal access (port 80 → 3001)             │ │
│  └─────────────────────────────────────────────────┘ │
│                          ↓                            │
│  ┌─ Service: library-service-lb (LoadBalancer) ──┐ │
│  │ • External access (port 80/443 → 3001)        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ Deployment: postgres ──────────────────────────┐ │
│  │ • 1 replica (database tier)                    │ │
│  │ • PVC: postgres-pvc (1 Gi)                     │ │
│  │ • PVC: postgres-backup-pvc (500 Mi)            │ │
│  │ • Headless Service                             │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ ConfigMap: library-config & postgres-config ─┐ │
│  │ • Non-sensitive configuration data             │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ Secret: database-credentials & app-secrets ──┐ │
│  │ • Base64-encoded credentials                  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ HPA: library-service-hpa ──────────────────────┐ │
│  │ • Min: 2, Max: 6 replicas                      │ │
│  │ • CPU threshold: 70%                           │ │
│  │ • Memory threshold: 80%                        │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Installation & Déploiement

### Prérequis

1. **Kubernetes Cluster** (v1.24+)
2. **kubectl configuré**
3. **storage-class disponible**

### Deployment avec script

```bash
chmod +x k8s/deploy.sh
bash k8s/deploy.sh
```

### Validation

```bash
bash k8s/validate.sh
```

### Test de scaling

```bash
bash k8s/test-scaling.sh
```

---

## ✅ Vérifications Essentielles

```bash
# Voir les pods
kubectl get pods -n library-system

# Voir les services
kubectl get svc -n library-system

# Voir le HPA
kubectl get hpa -n library-system

# Logs
kubectl logs -f deployment/library-service -n library-system
```

---

## 📊 Monitoring

```bash
# Métriques en temps réel
kubectl top pods -n library-system

# Events
kubectl get events -n library-system

# Describe pod
kubectl describe pod <pod-name> -n library-system
```

---

## 🎯 Prochaines Étapes

1. Adapter les secrets en production
2. Configurer le LoadBalancer réel
3. Setup Ingress + TLS
4. Configurer monitoring
5. Tester failover

---

**Voir les autres guides pour plus de détails!**
