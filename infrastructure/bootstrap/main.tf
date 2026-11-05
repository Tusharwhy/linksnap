
resource "aws_s3_bucket" "linksnap_state" {
  bucket = "linksnap-tfstate-tushar-2026-ttg69"

  tags = {
    Name        = "LinkSnap Terraform State"
    Environment = "Infrastructure"
    ManagedBy   = "Terraform"
  }
}

# Enable versioning to recover previous state files
resource "aws_s3_bucket_versioning" "linksnap_versioning" {
  bucket = aws_s3_bucket.linksnap_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption using SSE-S3
resource "aws_s3_bucket_server_side_encryption_configuration" "linksnap_encryption" {
  bucket = aws_s3_bucket.linksnap_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "linksnap_public_access" {
  bucket = aws_s3_bucket.linksnap_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
