// Frontend CI/CD for the Hostinger VPS.
// Jenkins runs on the same VPS and deploys with the local Docker engine.
// The branch that deploys is set in the Jenkins job ("Branch Specifier").

pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '15'))
    timeout(time: 30, unit: 'MINUTES')
  }

  triggers {
    githubPush()
  }

  environment {
    // Same-origin API through the host nginx. Change to an absolute URL only
    // if the API moves to its own domain (then add that origin to the
    // backend's ALLOWED_ORIGINS).
    VITE_API_BASE_URL = '/api'
    VITE_APP_NAME     = 'Ticketing System'
    COMPOSE           = 'docker compose -p ticketing-frontend -f docker-compose.prod.yml'
    HEALTH_URL        = 'http://127.0.0.1:4001/'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git log -1 --format="Deploying %h - %s (%an)"'
      }
    }

    stage('Build image') {
      // Runs tsc + vite build inside Docker; type errors fail the build here,
      // before the running site is touched.
      steps {
        sh '$COMPOSE build --pull web'
      }
    }

    stage('Deploy') {
      steps {
        sh '$COMPOSE up -d --remove-orphans'
      }
    }

    stage('Health check') {
      steps {
        sh '''
          for i in $(seq 1 20); do
            if curl -fsS "$HEALTH_URL" >/dev/null; then
              echo "Frontend is up."
              exit 0
            fi
            echo "Waiting for frontend ($i/20)..."
            sleep 2
          done
          echo "Frontend did not come up in time."
          exit 1
        '''
      }
    }
  }

  post {
    failure {
      sh '$COMPOSE logs --tail=100 web || true'
    }
    always {
      sh 'docker image prune -f >/dev/null || true'
    }
  }
}
