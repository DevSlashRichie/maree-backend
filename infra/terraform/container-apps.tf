resource "azurerm_container_app_environment" "main" {
  name                       = "${var.app_name}-${var.environment}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

resource "azurerm_container_app" "main" {
  name                         = local.container_app_name
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"

  secret {
    name  = "db-host"
    value = "${azurerm_postgresql_flexible_server.main.name}.postgres.database.azure.com"
  }

  secret {
    name  = "db-port"
    value = "5432"
  }

  secret {
    name  = "db-username"
    value = var.database_username
  }

  secret {
    name  = "db-password"
    value = random_password.database.result
  }

  secret {
    name  = "db-database"
    value = var.app_name
  }

  secret {
    name  = "kapso-api-key"
    value = var.kapso_api_key
  }

  secret {
    name  = "authz-secret"
    value = var.authz_secret
  }

  secret {
    name  = "from-number"
    value = var.from_number
  }

  secret {
    name  = "twilio-phone-number"
    value = var.twilio_phone_number
  }

  secret {
    name  = "twilio-auth-token"
    value = var.twilio_auth_token
  }

  secret {
    name  = "twilio-account-sid"
    value = var.twilio_account_sid
  }

  secret {
    name  = "container-registry-password"
    value = azurerm_container_registry.main.admin_password
  }

  secret {
    name  = "google-creds"
    value = var.google_creds
  }

  secret {
    name  = "azure-storage-connection-string"
    value = azurerm_storage_account.main.primary_connection_string
  }

  secret {
    name  = "azure-storage-container-name"
    value = azurerm_storage_container.products.name
  }

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = var.container_registry_username != "" ? var.container_registry_username : azurerm_container_registry.main.admin_username
    password_secret_name = "container-registry-password"
  }

  ingress {
    external_enabled = true
    target_port      = 8080
    transport        = "auto"
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    container {
      name   = var.app_name
      image  = var.container_image != "" ? var.container_image : "${azurerm_container_registry.main.login_server}/${var.app_name}:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "DB_HOST"
        secret_name = "db-host"
      }

      env {
        name        = "DB_PORT"
        secret_name = "db-port"
      }

      env {
        name        = "DB_PASSWORD"
        secret_name = "db-password"
      }

      env {
        name        = "DB_DATABASE"
        secret_name = "db-database"
      }

      env {
        name        = "DB_USERNAME"
        secret_name = "db-username"
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "HOST"
        value = "0.0.0.0"
      }

      env {
        name  = "PORT"
        value = "8080"
      }

      env {
        name        = "KAPSO_API_KEY"
        secret_name = "kapso-api-key"
      }

      env {
        name        = "AUTHZ_SECRET"
        secret_name = "authz-secret"
      }

      env {
        name        = "FROM_NUMBER"
        secret_name = "from-number"
      }

      env {
        name        = "TWILIO_PHONE_NUMBER"
        secret_name = "twilio-phone-number"
      }

      env {
        name        = "TWILIO_AUTH_TOKEN"
        secret_name = "twilio-auth-token"
      }

      env {
        name        = "TWILIO_ACCOUNT_SID"
        secret_name = "twilio-account-sid"
      }

      env {
        name        = "GOOGLE_WALLET_CREDENTIALS"
        secret_name = "google-creds"
      }

      env {
        name  = "ADMIN_PHONE"
        value = "+524427536211"
      }

      env {
        name  = "GOOGLE_WALLET_ISSUER_ID"
        value = "3388000000023101441"
      }

      env {
        name  = "GOOGLE_WALLET_CLASS_SUFFIX"
        value = "class_maree"
      }

      env {
        name        = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "azure-storage-connection-string"
      }

      env {
        name        = "AZURE_STORAGE_CONTAINER_NAME"
        secret_name = "azure-storage-container-name"
      }
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}
