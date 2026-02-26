#!/bin/bash

NAMESPACE="library-system"
DEPLOYMENT="library-service"

echo "===== HPA Scaling Test ====="
echo ""

CURRENT=$(kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
echo "Current replicas: $CURRENT"
echo ""

# Test 1: Scale up
echo "[1/3] Scaling to 4 replicas..."
kubectl scale deployment $DEPLOYMENT --replicas=4 -n $NAMESPACE

echo "Waiting for rollout..."
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=120s

echo "✅ Scaled to 4!"
echo ""
echo "Current pods:"
kubectl get pods -n $NAMESPACE -l app=library-app -o wide
echo ""

# Wait 60 seconds
echo "[2/3] Waiting 60 seconds..."
for i in {1..60}; do
  printf "\r⏳ %d/60 seconds" $i
  sleep 1
done
echo ""
echo ""

# Scale down
echo "[3/3] Scaling back to $CURRENT replicas..."
kubectl scale deployment $DEPLOYMENT --replicas=$CURRENT -n $NAMESPACE

echo "Waiting for rollout..."
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=120s

echo "✅ Scale back complete!"
echo ""

echo "===== Test Complete ====="
echo ""
echo "Final state:"
kubectl get deployment $DEPLOYMENT -n $NAMESPACE
