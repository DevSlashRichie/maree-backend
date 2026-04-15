resource "random_string" "storage_suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_storage_account" "main" {
  name                            = replace("${var.app_name}${var.environment}${random_string.storage_suffix.result}", "-", "")
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = true

  blob_properties {
    versioning_enabled = true
  }

  tags = {
    environment = var.environment
  }
}

resource "azurerm_storage_container" "products" {
  name                  = "products"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}
