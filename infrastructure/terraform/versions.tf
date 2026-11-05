terraform {
  required_providers {
    aws = {
      version = ">= 6.0.0, < 7.0.0"
      source  = "hashicorp/aws"
    }
  }
  required_version = ">= 1.5.0, < 2.0.0"

  backend "s3" {
    bucket       = "linksnap-tfstate-tushar-2026-ttg69"
    key          = "linksnap/Infrastructure/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}