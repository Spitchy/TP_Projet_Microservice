#!/bin/bash
set -e

NAMESPACE="library-system"
TIMEOUT=120

echo "===== Library Service Deployment ====="
echo ""

# 1. Create namespace
echo "[1/8] Creating namespace..."
kubectl create namespace $NAMESPACE 2>/dev/null || true

# 2. Apply ConfigMap
echo "[2/8] Applying ConfigMap..."
kubectl apply -f configmap.yaml

# 3. Apply Secrets
echo "[3/8] Applying Secrets..."
kubectl apply -f secret.yaml

# 4. Apply RBAC
echo "[4/8] Applying RBAC..."
kubectl apply -f rbac.yaml

# 5. Apply PVC
echo "[5/8] Applying PersistentVolumeClaim..."
kubectl apply -f pvc.yaml

# 6. Deploy PostgreSQL
echo "[6/8] Deploying PostgreSQL..."
kubectl apply -f postgres.yaml

echo ""
echo "   Waiting for PostgreSQL to be ready..."
echo "   (checking every 5 seconds, timeout: ${TIMEOUT}s)"
echo ""

ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  READY=$(kubectl get deployment postgres -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  if [ "$READY" = "1" ]; then
    echo "   ✅ PostgreSQL ready! (1/1)"
    break
  fi
  echo "   ⏳ PostgreSQL not ready yet (${READY:-0}/1)... [${ELAPSED}s elapsed]"
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "   ❌ Timeout waiting for PostgreSQL"
  exit 1
fi

# 7. Deploy Application
echo ""
echo "[7/8] Deploying Application..."
kubectl apply -f app-deployment.yaml

echo ""
echo "   Waiting for Application to be ready..."
echo "   (checking every 5 seconds, timeout: ${TIMEOUT}s)"
echo ""

ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  READY=$(kubectl get deployment library-service -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
  DESIRED=$(kubectl get deployment library-service -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
  if [ "$READY" = "$DESIRED" ] && [ "$READY" != "0" ]; then
    echo "   ✅ Application ready! (${READY}/${DESIRED})"
    break
  fi
  echo "   ⏳ Application not ready yet (${READY:-0}/${DESIRED})... [${ELAPSED}s elapsed]"
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
  echo "   ❌ Timeout waiting for Application"
  exit 1
fi

# 8. Apply Services and HPA
echo ""
echo "[8/8] Applying Services and HPA..."
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml

echo ""
echo "===== 🎉 Deployment Complete! ====="
echo ""
echo "Next steps:"
echo " 1. Run: bash validate.sh (to check all components)"
echo " 2. Run: bash test-scaling.sh (to test HPA)"
echo " 3. Access: kubectl port-forward svc/library-service 3001:80 -n library-system"
echo ""
