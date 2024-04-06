
        resource "aws_sns_topic" "example" {
            name = "my_sns_topic"
          }
          
          
          resource "aws_sns_topic_subscription" "example" {
            topic_arn = aws_sns_topic.example.arn
            protocol  = "email"
            endpoint  = "theenathayalan0497@gmail.com"
          }
          
          
          resource "null_resource" "publish_message" {
              
            provisioner "local-exec" {
              command = <<EOF
                aws sns publish --topic-arn ${aws_sns_topic.example.arn} --message "welcome, theena and C-Dat Team! create "
              EOF
            }
          }
        