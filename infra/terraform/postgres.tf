resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${var.app_name}-${var.environment}-db"
  location               = azurerm_resource_group.main.location
  resource_group_name    = azurerm_resource_group.main.name
  version                = "18"
  sku_name               = "B_Standard_B1ms"
  storage_mb             = 32768
  administrator_login    = var.database_username
  administrator_password = random_password.database.result

  authentication {
    password_auth_enabled         = true
    active_directory_auth_enabled = false
  }

  backup_retention_days = 7

  lifecycle {
    create_before_destroy = true
  }
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.app_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}
