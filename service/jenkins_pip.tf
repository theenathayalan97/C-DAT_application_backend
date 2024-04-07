
        terraform {
            required_providers {
              jenkins = {
                source  = "overmike/jenkins"
                version = "0.6.1"
              }
            }
          }
          
          provider "jenkins" {
            server_url = "http://13.233.142.3:8080/"  # Specify the correct Jenkins server URL
            username   = "root"
            password   = "root"
          }
          
          resource "jenkins_job" "dys_jenkins" {
            name     = "dys_jenkins"
            template = file("job.xml")
          }