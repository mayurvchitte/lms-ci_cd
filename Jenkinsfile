pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        BACKEND_IMAGE = 'mahesh1925/lms-backend'
        FRONTEND_IMAGE = 'mahesh1925/lms-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/maheshpalakonda/lms-ci_cd.git',
                    credentialsId: 'github-pat'
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                  docker build -t $BACKEND_IMAGE:latest -f backend/Dockerfile.backend backend
                  docker build -t $FRONTEND_IMAGE:latest -f frontend/Dockerfile.frontend frontend
                '''
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                      echo "$PASS" | docker login -u "$USER" --password-stdin
                      docker push $BACKEND_IMAGE:latest
                      docker push $FRONTEND_IMAGE:latest
                      docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'backend-env', variable: 'BACKEND_ENV'),
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')
                ]) {
                    sh '''
                      echo "🚀 Deploying using Jenkins secret env files..."

                      export BACKEND_ENV="$BACKEND_ENV"
                      export FRONTEND_ENV="$FRONTEND_ENV"

                      docker compose down || true
                      docker compose up -d --force-recreate --remove-orphans

                      echo "✅ Deployment completed successfully"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline succeeded!"
        }
        failure {
            echo "❌ CI/CD Pipeline failed!"
        }
    }
}

