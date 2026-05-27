pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "ronak-portfolio"
        DOCKER_REGISTRY = "docker.io/rthakkar007"
        DOCKER_CREDENTIALS_ID = "dockerhub-credentials"
        SONAR_PROJECT_KEY = "ronak-portfolio"
        SONAR_CREDENTIALS_ID = "sonar-token"
        KUBECONFIG_CREDENTIALS_ID = "kubeconfig"
        TRIVY_SEVERITY = "HIGH,CRITICAL"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Code Quality Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Security Scan (SAST)') {
            steps {
                // Using Trivy for filesystem scanning
                sh "trivy fs --severity ${TRIVY_SEVERITY} --no-progress --format table ."
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                // Scan the built image before pushing
                sh "trivy image --severity ${TRIVY_SEVERITY} --no-progress ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
            }
        }

        stage('Push Docker Image') {
            when {
                branch 'master'
            }
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDENTIALS_ID) {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes (Dev)') {
            when {
                branch 'develop'
            }
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh "helm upgrade --install ronak-portfolio ./k8s/helm/ronak-portfolio --namespace dev --set image.tag=${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy to Kubernetes (Prod)') {
            when {
                branch 'master'
            }
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh "helm upgrade --install ronak-portfolio ./k8s/helm/ronak-portfolio --namespace prod --set image.tag=${env.BUILD_NUMBER}"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully!"
            // Add Slack or email notification here
        }
        failure {
            echo "Pipeline failed. Please check the logs."
            // Add Slack or email notification here
        }
    }
}
