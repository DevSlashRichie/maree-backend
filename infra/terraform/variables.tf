variable "location" {
  description = "Azure location for resources"
  type        = string
  default     = "centralus"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "maree"
}

variable "container_image" {
  description = "Docker image to deploy"
  type        = string
  default     = ""
}

variable "container_registry_username" {
  description = "Container registry username"
  type        = string
  default     = ""
  sensitive   = true
}

variable "container_registry_password" {
  description = "Container registry password"
  type        = string
  default     = ""
  sensitive   = true
}

variable "database_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "mareeadmin"
}

variable "kapso_api_key" {
  description = "Kapso API key for WhatsApp integration"
  type        = string
  default     = ""
  sensitive   = true
}

variable "authz_secret" {
  description = "Authorization secret for PASETO tokens"
  type        = string
  default     = ""
  sensitive   = true
}

variable "from_number" {
  description = "WhatsApp from phone number"
  type        = string
  default     = ""
  sensitive   = true
}

variable "twilio_phone_number" {
  description = "Twilio phone number"
  type        = string
  default     = ""
  sensitive   = true
}

variable "twilio_auth_token" {
  description = "Twilio auth token"
  type        = string
  default     = ""
  sensitive   = true
}

variable "google_creds" {
  description = "google credentials"
  type        = string
  default     = ""
  sensitive   = true
}

variable "apple_creds_wwdr" {
  description = "Apple Wallet WWDR"
  type        = string
  default     = ""
  sensitive   = true
}

variable "apple_creds_cert_pem" {
  description = "Apple Wallet CERT PEM Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "apple_creds_key_pem" {
  description = "Apple Wallet KEY PEM Key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "twilio_account_sid" {
  description = "Twilio account SID"
  type        = string
  default     = ""
  sensitive   = true
}

locals {
  resource_group_name = "${var.app_name}-${var.environment}-rg"
  container_app_name  = var.app_name
  acr_name            = replace("${var.app_name}registry${var.environment}", "-", "")
}
