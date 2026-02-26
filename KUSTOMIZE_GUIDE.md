# 🔄 Kustomize Deployment Guide

## Qu'est-ce que Kustomize?

Kustomize permet:
- Pas de templating complexe (pas de Helm needed)
- Patches appliqués sur les manifests
- Multi-env facilement (dev, staging, prod)
- Réutilisation de base communes

---

## Utilisation Simple

```bash
# Voir le manifest généré
kubectl kustomize k8s/

# Déployer
kubectl apply -k k8s/

# Vérifier
kubectl get all -n library-system

# Nettoyer
kubectl delete -k k8s/
```

---

## Multi-env (Base + Overlays)

Créer cette structure:
```
k8s/
├── base/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   └── ... (tous les manifests)
├── overlays/
│   ├── dev/
│   │   └── kustomization.yaml
│   ├── staging/
│   │   └── kustomization.yaml
│   └── prod/
│       └── kustomization.yaml
```

**k8s/overlays/prod/kustomization.yaml:**
```yaml
bases:
- ../../base

replicas:
- name: library-service
  count: 3

configMapGenerator:
- name: library-config
  behavior: merge
  literals:
  - NODE_ENV=production
  - LOG_LEVEL=warn
```

Déployer:
```bash
kubectl apply -k k8s/overlays/prod/
```

---

**Voir KUBERNETES_GUIDE.md pour plus de détails** 📖
