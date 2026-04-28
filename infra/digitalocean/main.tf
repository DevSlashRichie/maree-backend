terraform {
  required_version = ">= 1.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "do_token" {}
variable "region" {
  default = "sfo3"
}
variable "ssh_key_name" {
  description = "Name of the SSH key in DigitalOcean"
  default     = "ricardo"
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_vpc" "maree_vpc" {
  name   = "maree-vpc"
  region = var.region
}

resource "digitalocean_container_registry" "maree_registry" {
  name                   = "maree-registry"
  subscription_tier_slug = "starter"
}

resource "digitalocean_droplet" "maree_server" {
  image    = "ubuntu-24-04-x64"
  name     = "maree-server"
  region   = var.region
  size     = "s-1vcpu-2gb"
  vpc_uuid = digitalocean_vpc.maree_vpc.id
  ssh_keys = [data.digitalocean_ssh_key.main.id]

  user_data = <<-EOF
              #!/bin/bash
              export DEBIAN_FRONTEND=noninteractive
              apt-get update
              apt-get install -y docker.io docker-compose-v2 wget
              systemctl enable --now docker

              # Install doctl
              cd /tmp
              wget https://github.com/digitalocean/doctl/releases/download/v1.101.0/doctl-1.101.0-linux-amd64.tar.gz
              tar xf doctl-1.101.0-linux-amd64.tar.gz
              mv doctl /usr/local/bin

              # Authenticate Docker with the Registry
              doctl auth init -t ${var.do_token}
              doctl registry login --expiry-seconds 0

              # Create .env file with default/provided values
              cat <<ENV > /root/maree/.env
DB_PASSWORD=${var.db_password}
DB_DATABASE=maree
DB_USERNAME=maree_user
KAPSO_API_KEY=
AUTHZ_SECRET=
FROM_NUMBER=
TWILIO_PHONE_NUMBER=
TWILIO_AUTH_TOKEN=
TWILIO_ACCOUNT_SID=
GOOGLE_WALLET_CREDENTIALS=
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER_NAME=
ENV
              EOF

  lifecycle {
    ignore_changes = ["user_data"]
  }
}

variable "db_password" {
  description = "Password for the database"
  sensitive   = true
}

data "digitalocean_ssh_key" "main" {
  name = var.ssh_key_name
}

resource "digitalocean_firewall" "maree_firewall" {
  name = "maree-firewall"

  droplet_ids = [digitalocean_droplet.maree_server.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "8080"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

output "droplet_ip" {
  value = digitalocean_droplet.maree_server.ipv4_address
}

output "registry_endpoint" {
  value = digitalocean_container_registry.maree_registry.endpoint
}
