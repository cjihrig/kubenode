'use strict';

function certificate(data) {
  return `apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  labels:
    app.kubernetes.io/name: ${data.projectName}
    app.kubernetes.io/managed-by: kubenode
  name: selfsigned-issuer
  namespace: ${data.projectName}
spec:
  selfSigned: {}
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  labels:
    app.kubernetes.io/name: certificate
    app.kubernetes.io/instance: serving-cert
    app.kubernetes.io/component: certificate
    app.kubernetes.io/created-by: ${data.projectName}
    app.kubernetes.io/part-of: ${data.projectName}
    app.kubernetes.io/managed-by: kubenode
  name: serving-cert
  namespace: ${data.projectName}
spec:
  dnsNames:
  - webhook-service.${data.projectName}.svc
  - webhook-service.${data.projectName}.svc.cluster.local
  issuerRef:
    kind: Issuer
    name: selfsigned-issuer
  secretName: webhook-server-cert
`;
}

function service(data) {
  return `apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: ${data.projectName}
    app.kubernetes.io/managed-by: kubenode
  name: webhook-service
  namespace: ${data.projectName}
spec:
  ports:
    - port: 443
      protocol: TCP
      targetPort: 9443
  selector:
    control-plane: controller-manager
`;
}

module.exports = {
  certificate,
  service
};
