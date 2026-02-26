# 🚀 Déployer sur différents clusters Kubernetes

## Options disponibles

| Type | Coût | Setup | Production |
|------|------|-------|-----------|
| **minikube** | Gratuit | 2 min | ❌ |
| **kind** | Gratuit | 30 sec | ❌ |
| **k3s** | Gratuit | 1 min | ⚠️ Dev |
| **AWS EKS** | $$ | 15 min | ✅ |
| **Google GKE** | $$ | 15 min | ✅ |
| **DigitalOcean DOKS** | $$ | 5 min | ✅ |

---

## 🎓 Minikube (Local Learning)

```bash
# Installation
choco install minikube

# Démarrer
minikube start --cpus=4 --memory=4096

# Déployer
cd k8s/
nano secret.yaml
bash deploy.sh

# Accéder
kubectl port-forward svc/library-service 3001:80 -n library-system &
curl http://localhost:3001/health

# Cleanup
minikube delete
```

---

## 🎓 kind (Docker Kubernetes)

```bash
# Installation
choco install kind

# Créer cluster
kind create cluster --name library

# Déployer
cd k8s/
nano secret.yaml
bash deploy.sh

# Cleanup
kind delete cluster --name library
```

---

## ✅ k3s (Production-like Local)

```bash
# Installation (Linux/WSL2)
curl -sfL https://get.k3s.io | sh -

# Déployer
cd k8s/
nano secret.yaml
bash deploy.sh

# Accéder
kubectl port-forward svc/library-service 3001:80 -n library-system &
```

---

## ☁️ AWS EKS (Production)

```bash
# Prerequisites
choco install awscliv2
choco install eksctl

# Créer cluster
eksctl create cluster \
  --name library-service \
  --region eu-west-1 \
  --nodes=3

# Déployer
cd k8s/
nano secret.yaml
bash deploy.sh

# Cleanup
eksctl delete cluster --name library-service
```

---

## ☁️ Google GKE (Production)

```bash
# Prerequisites
gcloud auth login

# Créer cluster
gcloud container clusters create library-service \
  --region europe-west1 \
  --num-nodes 3

# Déployer
cd k8s/
nano secret.yaml
bash deploy.sh

# Cleanup
gcloud container clusters delete library-service
```

---

## ☁️ DigitalOcean DOKS (Budget)

```bash
# Prerequisites
doctl auth init

# Créer cluster
doctl kubernetes cluster create library-service \
  --region ams3 \
  --count 3

# Déployer
cd k8s/
nano secret.yaml
bash deploy.sh

# Cleanup
doctl kubernetes cluster delete library-service
```

---

**Choisissez le vôtre et déployez!** 🚀
