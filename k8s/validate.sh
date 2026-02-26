#!/bin/bash

NAMESPACE="library-system"

echo "===== Library System Status ====="
echo ""

# Check kubectl
if ! command -v kubectl &> /dev/null; then
  echo "❌ kubectl is not installed"
  exit 1
fi
echo "✅ kubectl is available"

# Check namespace
if kubectl get namespace $NAMESPACE &> /dev/null; then
  echo "✅ Namespace '$NAMESPACE' exists"
else
  echo "❌ Namespace '$NAMESPACE' does not exist"
  exit 1
fi

echo ""
echo "📦 PODS:"
kubectl get pods -n $NAMESPACE -o wide
echo ""

# Check if all pods are running
RUNNING=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
TOTAL=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l)

if [ "$RUNNING" = "$TOTAL" ] && [ "$TOTAL" != "0" ]; then
  echo "✅ All pods running!"
else
  echo "⚠️  Not all pods running ($RUNNING/$TOTAL)"
fi

echo ""
echo "🌐 SERVICES:"
kubectl get svc -n $NAMESPACE
echo ""

# Check endpoints
ENDPOINTS=$(kubectl get endpoints -n $NAMESPACE library-service -o jsonpath='{.subsets[0].addresses[*].targetRef.name}' 2>/dev/null | wc -w)
if [ "$ENDPOINTS" -gt 0 ]; then
  echo "✅ Service has endpoints ($ENDPOINTS pods)"
else
  echo "⚠️  Service has no endpoints"
fi

echo ""
echo "⚡ DEPLOYMENTS:"
kubectl get deployments -n $NAMESPACE
echo ""

echo "💾 STORAGE:"
kubectl get pvc -n $NAMESPACE
echo ""

echo "📊 HPA:"
kubectl get hpa -n $NAMESPACE
echo ""

# Check HPA metrics
HPA_TARGETS=$(kubectl get hpa -n $NAMESPACE -o jsonpath='{.items[0].status.currentMetrics[*].resource.name}' 2>/dev/null)
if [ -z "$HPA_TARGETS" ]; then
  echo "ℹ️ (metrics unavailable - metrics-server may not be installed)"
else
  echo "✅ HPA metrics available"
fi

echo ""
echo "✅ System Status: HEALTHY"
echo ""
echo "Quick actions:"
echo " - Port-forward: kubectl port-forward svc/library-service 3001:80 -n $NAMESPACE"
echo " - Logs: kubectl logs -f deployment/library-service -n $NAMESPACE"
echo " - Describe: kubectl describe pod <pod-name> -n $NAMESPACE"
