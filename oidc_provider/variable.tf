variable "installer_role_arn" {
  description = "STS Role ARN with get secrets permission, relevant only for unmanaged OIDC config"
  type        = string
  default     = "arn:aws:iam::729416225111:role/account-role-blmo-Installer-Role"
}
 variable "token" {
  type = string
  default = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhZDUyMjdhMy1iY2ZkLTRjZjAtYTdiNi0zOTk4MzVhMDg1NjYifQ.eyJpYXQiOjE3MDIwMjAwNjIsImp0aSI6IjA4MWM5NjI4LTNmZDktNGU1Yi05NjJiLTJhNTY1NzNjZDBjZCIsImlzcyI6Imh0dHBzOi8vc3NvLnJlZGhhdC5jb20vYXV0aC9yZWFsbXMvcmVkaGF0LWV4dGVybmFsIiwiYXVkIjoiaHR0cHM6Ly9zc28ucmVkaGF0LmNvbS9hdXRoL3JlYWxtcy9yZWRoYXQtZXh0ZXJuYWwiLCJzdWIiOiJmOjUyOGQ3NmZmLWY3MDgtNDNlZC04Y2Q1LWZlMTZmNGZlMGNlNjpoYXJzaHVzYW5qdSIsInR5cCI6Ik9mZmxpbmUiLCJhenAiOiJjbG91ZC1zZXJ2aWNlcyIsIm5vbmNlIjoiYTI4MGYxYmYtNGNhZi00NGM0LWJkNjItNGY1NGQwMjMyODI1Iiwic2Vzc2lvbl9zdGF0ZSI6Ijg5MDE4NWQzLTZiZWEtNGE0NS1hMWExLTFmZDUxNThkMDUzZiIsInNjb3BlIjoib3BlbmlkIGFwaS5pYW0uc2VydmljZV9hY2NvdW50cyBvZmZsaW5lX2FjY2VzcyIsInNpZCI6Ijg5MDE4NWQzLTZiZWEtNGE0NS1hMWExLTFmZDUxNThkMDUzZiJ9.eyUglzRpjU2dzALWFt5W-Gtggc5RgyodGYmBc5Bj02A"
}

variable "url" {
  type        = string
  description = "Provide OCM environment by setting a value to url"
  default     = "https://api.openshift.com"
}

variable "managed" {
  description = "Indicates whether it is a Red Hat managed or unmanaged (Customer hosted) OIDC Configuration"
  type        = bool
  default = false
}

variable "operator_role_prefix" {
  type = string
  default = "dat-1"
  # validation {
  #   condition     = can(regex("^[\\w+=,.@-]+$", var.operator_role_prefix)) || length(var.operator_role_prefix) == 0
  #   error_message = "Invalid operator_role_prefix. It should match the pattern ^[\\w+=,.@-]+$ or be an empty string."
  # }
}

variable "account_role_prefix" {
    type    = string
    default = "dat-1"
    description = "Your account roles are prepended with whatever value you enter here. The default value in the ROSA CLI is 'ManagedOpenshift-' before all of your account roles."
  }

variable "cloud_region" {
  type    = string
  default = "ap-south-1"
}

variable "tags" {
  description = "List of AWS resource tags to apply."
  type        = map(string)
  default     = null
}

variable "path" {
  description = "(Optional) The arn path for the account/operator roles as well as their policies."
  type        = string
  default     = null
}