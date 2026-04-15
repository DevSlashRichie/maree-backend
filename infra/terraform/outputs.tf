output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "container_app_url" {
  description = "URL of the deployed container app"
  value       = "https://${azurerm_container_app.main.name}.${azurerm_resource_group.main.location}.azurecontainerapps.io"
}

output "container_registry_url" {
  description = "URL of the container registry"
  value       = azurerm_container_registry.main.login_server
}

output "container_registry_username" {
  description = "Container registry admin username"
  value       = azurerm_container_registry.main.admin_username
}

output "container_registry_password" {
  description = "Container registry admin password"
  value       = azurerm_container_registry.main.admin_password
  sensitive   = true
}

output "database_host" {
  description = "PostgreSQL server hostname"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  description = "PostgreSQL database name"
  value       = azurerm_postgresql_flexible_server_database.main.name
}

output "database_username" {
  description = "PostgreSQL admin username"
  value       = var.database_username
}

output "database_password" {
  description = "PostgreSQL admin password (auto-generated)"
  value       = random_password.database.result
  sensitive   = true
}

output "azure_storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "azure_storage_connection_string" {
  description = "Connection string for the storage account"
  value       = azurerm_storage_account.main.primary_connection_string
  sensitive   = true
}

output "azure_storage_container_name" {
  description = "Name of the storage container"
  value       = azurerm_storage_container.products.name
}
