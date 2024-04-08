const path = require('../path');
const createAmi = require('../service/architectureService')

async function createVpc(req, res) {
  let vpcTagName = req.body.vpc.vpcTagName
  let cidr = req.body.vpc.cidr
  let vpcSoruce = []

  if (vpcTagName.length == 0) {
    return res.status(400).json({ message: "vpc name is required" })
  }

  for (let i = 0; i < vpcTagName.length; i++) {
    if (cidr.length == 0) {
      let vpc = `
      resource "aws_vpc" "${vpcTagName[i]}" {
          cidr_block       = "10.0.0.0/16"
          instance_tenancy = "default"
          tags = {
            Name = "${vpcTagName[i]}"
          }
        }
      `
      vpcSoruce += vpc;
    } else {
      let vpc = `
      resource "aws_vpc" "${vpcTagName[i]}" {
          cidr_block       = "${cidr[i]}"
          instance_tenancy = "default"
          tags = {
            Name = "${vpcTagName[i]}"
          }
        }
      `
      vpcSoruce += vpc;
    }
  }

  return vpcSoruce;

}

async function createSubnet(req, res) {
  let subnetTagName = req.body.subnet.subnetTagName
  let availability_zone = req.body.subnet.availability_zone
  let cidr = req.body.subnet.cidr
  let vpcId = req.body.subnet.vpcId
  let vpcTittle = req.body.vpc.vpcTittle
  let vpcTagName = req.body.vpc.vpcTagName
  let subnetDetail = []


  if (subnetTagName.length == 0) {
    return res.status(400).json({ message: "subnet name is required" })
  }
  if (cidr.length == 0) {
    return res.status(400).json({ message: "cidr is required" })
  }
  if (availability_zone.length == 0) {
    return res.status(400).json({ message: "availability zone is required" })
  }

  for (let i = 0; i < subnetTagName.length; i++) {
    if (vpcId.length > 0) {
      if (vpcId.length < i) {
        vpcId[i] = vpcId[0]
        let subnet = `
          resource "aws_subnet" "${subnetTagName[i]}" {
              vpc_id = "${vpcId[i]}"
              cidr_block = "${cidr[i]}"
              availability_zone = "${availability_zone[i]}"
              tags = {
                Name = "${subnetTagName[i]}"
              }
            }
          `
        subnetDetail += subnet;
      } else {
        let subnet = `
          resource "aws_subnet" "${subnetTagName[i]}" {
              vpc_id = "${vpcId[i]}"
              cidr_block = "${cidr[i]}"
              availability_zone = "${availability_zone[i]}"
              tags = {
                Name = "${subnetTagName[i]}"
              }
            }
          `
        subnetDetail += subnet;
      }

    } else if (!vpcTittle) {
      return res.status(400).json({ message: "vpc id is required" })
    } else {
      if (vpcTagName.length < i) {
        vpcTagName[i] = `Default_name-${i}`
        let subnet = `
          resource "aws_subnet" "${subnetTagName[i]}" {
              vpc_id = aws_vpc.${vpcTagName[i]}.id
              cidr_block = "${cidr[i]}"
              availability_zone = "${availability_zone[i]}"
              tags = {
                Name = "${subnetTagName[i]}"
              }
            }
          `
        subnetDetail += subnet;
      } else {
        let subnet = `
          resource "aws_subnet" "${subnetTagName[i]}" {
              vpc_id = aws_vpc.${vpcTagName[i]}.id
              cidr_block = "${cidr[i]}"
              availability_zone = "${availability_zone[i]}"
              tags = {
                Name = "${subnetTagName[i]}"
              }
            }
          `
        subnetDetail += subnet;
      }

    }
  }
  return subnetDetail

}

async function createInternetGateWay(req, res) {
  let vpcId = req.body.internetGateWay.vpcId
  let vpcTagName = req.body.vpc.vpcTagName
  let internetGateWayTagName = req.body.internetGateWay.internetGateWayTagName
  let internetGatewayDetail = []

  if (internetGateWayTagName.length == 0) {
    return res.status(400).json({ message: "internet gate way name is required" })
  }

  for (let i = 0; i < internetGateWayTagName.length; i++) {
    if (vpcId.length > 0) {
      let internetGateWay = `
          resource "aws_internet_gateway" "${internetGateWayTagName[i]}" {
              vpc_id = "${vpcId[i]}"
              tags = {
                Name = "${internetGateWayTagName[i]}"
              }
            }
          `
      // console.log("internetGateWay : ", internetGateWay);
      internetGatewayDetail += internetGateWay;
    } else if (vpcTagName.length > 0) {
      let internetGateWay = `
      resource "aws_internet_gateway" "${internetGateWayTagName[i]}" {
          vpc_id = aws_vpc.${vpcTagName[i]}.id
          tags = {
            Name = "${internetGateWayTagName[i]}"
          }
        }
      `
      internetGatewayDetail += internetGateWay;
    } else {
      return req.status(400).json({ message: "vpc id is required" })
    }

  }
  return internetGatewayDetail;
}

async function createRouteTable(req, res) {
  try{
  let vpcId = req.body.routeTable.vpcId
  let vpcTagName = req.body.vpc.vpcTagName
  let routeTableTagName = req.body.routeTable.routeTableTagName
  let cidr = req.body.routeTable.cidr
  let internetGateWayId = req.body.routeTable.internetGateWayId
  let internetGateWayTittle = req.body.internetGateWay.internetGateWayTittle
  let internetGateWayTagName = req.body.internetGateWay.internetGateWayTagName
  let private = req.body.routeTable.privateRouteTable
  let routeTableDetail = []
    // console.log("private : ",private);
  if (routeTableTagName.length == 0) {
    return res.status(400).json({ message: "route table name is required" })
  }

  if (private == false) {
    if (cidr.length == 0) {
      return res.status(400).json({ message: "cidr is required" })
    }
    if ((internetGateWayId.length == 0) && (internetGateWayTittle != "internetGateWay")) {
      return res.status(400).json({ message: "internet gate way id is required" })
    }
  }
  for (let i = 0; i < routeTableTagName.length; i++) {
    if (private == true) {
      if (vpcId.length > 0) {
        let routeTable = `
              resource "aws_route_table" "${routeTableTagName[i]}" {
                  vpc_id = "${vpcId[i]}"
                  tags = {
                    Name = "${routeTableTagName[i]}"
                  }
                }
              `
        routeTableDetail += routeTable;
      } else if (vpcTagName.length > 0) {
        let routeTable = `
              resource "aws_route_table" "${routeTableTagName[i]}" {
                  vpc_id = aws_vpc.${vpcTagName[i]}.id
                  tags = {
                    Name = "${routeTableTagName[i]}"
                  }
                }
              `
        routeTableDetail += routeTable;
      } else {
        return req.status(400).json({ message: "vpc id is required" })
      }

    } else {
      if (vpcId.length > 0) {
        if (internetGateWayTittle) {
          let routeTable = `
                  resource "aws_route_table" "${routeTableTagName[i]}" {
                      vpc_id = "${vpcId[i]}"
                      route {
                          cidr_block = "${cidr[i]}"
                          gateway_id = aws_internet_gateway.${internetGateWayTagName[i]}.id
                        }
                      tags = {
                        Name = "${routeTableTagName[i]}"
                      }
                    }
                  `
          routeTableDetail += routeTable;
        } else {
          let routeTable = `
              resource "aws_route_table" "${routeTableTagName[i]}" {
                  vpc_id = "${vpcId[i]}"
                  route {
                      cidr_block = "${cidr[i]}"
                      gateway_id = ${internetGateWayId[i]}
                    }
                  tags = {
                    Name = "${routeTableTagName[i]}"
                  }
                }
              `
          routeTableDetail += routeTable;
        }
      } else if (vpcTagName) {
        if (internetGateWayTagName) {
          let routeTable = `
                  resource "aws_route_table" "${routeTableTagName[i]}" {
                      vpc_id = aws_vpc.${vpcTagName[i]}.id
                      route {
                          cidr_block = "${cidr[i]}"
                          gateway_id = aws_internet_gateway.${internetGateWayTagName[i]}.id
                        }
                      tags = {
                        Name = "${routeTableTagName[i]}"
                      }
                    }
                  `
          routeTableDetail += routeTable;
        } else {
          let routeTable = `
                  resource "aws_route_table" "${routeTableTagName[i]}" {
                      vpc_id = aws_vpc.${vpcTagName[i]}.id
                      route {
                          cidr_block = "${cidr[i]}"
                          gateway_id = ${internetGateWayId[i]}
                        }
                      tags = {
                        Name = "${routeTableTagName[i]}"
                      }
                    }
                  `
          routeTableDetail += routeTable;
        }
      } else {
        return req.status(400).json({ message: "vpc id is required" })
      }
    }
  }
  return routeTableDetail
}catch (error){
  return res.status(400).json({message: "something went wrong", result: error.message})
}
}

async function createSecurityGroup(req, res) {
  try {
    let vpcId = req.body.securityGroup.vpcId
    let vpcTagName = req.body.vpc.vpcTagName
    let securityGroupTagName = req.body.securityGroup.securityGroupTagName
    let private = req.body.securityGroup.privatesecurityGroup
    let securityGroupDetail = []
    if (securityGroupTagName.length == 0) {
      return res.status(400).json({ message: "security group name is required" })
    }
    if ((vpcId.length == 0) && (vpcTagName.length == 0)) {
      return res.status(400).send({ message: "vpc id is required " })
    }

    for (let i = 0; i < securityGroupTagName.length; i++) {
      if (private == true) {
        if (vpcId.length > 0) {
          let securityGroup = `
                  resource "aws_security_group" "${securityGroupTagName[i]}" {
                      name        = "${securityGroupTagName[i]}"
                      description = "Allow TLS inbound traffic"
                      vpc_id      = "${vpcId[i]}"
                    
                      ingress {
                        description      = "TLS from VPC"
                        from_port        = 0
                        to_port          = 65535
                        protocol         = "tcp" 
                        cidr_blocks      = ["10.0.1.0/24"]  
                        ipv6_cidr_blocks = ["::/0"]
                      }     
                      egress {
                        from_port        = 0
                        to_port          = 0
                        protocol         = "-1"
                        cidr_blocks      = ["0.0.0.0/0"]
                        ipv6_cidr_blocks = ["::/0"]
                      }
                    
                      tags = {
                        Name = "${securityGroupTagName[i]}"
                      }
                    } `
          securityGroupDetail += securityGroup;
        } else if (vpcTagName.length > 0) {
          let securityGroup = `
                  resource "aws_security_group" "${securityGroupTagName[i]}" {
                      name        = "${securityGroupTagName[i]}"
                      description = "Allow TLS inbound traffic"
                      vpc_id      = aws_vpc.${vpcTagName[i]}.id
                    
                      ingress {
                        description      = "TLS from VPC"
                        from_port        = 0
                        to_port          = 65535
                        protocol         = "tcp" 
                        cidr_blocks      = ["10.0.1.0/24"]  
                        ipv6_cidr_blocks = ["::/0"]
                      }     
                      egress {
                        from_port        = 0
                        to_port          = 0
                        protocol         = "-1"
                        cidr_blocks      = ["0.0.0.0/0"]
                        ipv6_cidr_blocks = ["::/0"]
                      }
                    
                      tags = {
                        Name = "${securityGroupTagName[i]}"
                      }
                    } `
          securityGroupDetail += securityGroup;
        }
      } else {
        if (vpcId.length > 0) {
          let securityGroup = `
              resource "aws_security_group" "${securityGroupTagName[i]}" {
                  name        = "${securityGroupTagName[i]}"
                  description = "Allow TLS inbound traffic"
                  vpc_id      =  "${vpcId[i]}"
                
                //type ssh,rdp,http
                  ingress {
                    description      = "TLS from VPC"
                    from_port        = 22
                    to_port          = 22
                    protocol         = "tcp" 
                    cidr_blocks      = ["0.0.0.0/0"]  
                    ipv6_cidr_blocks = ["::/0"]
                  }
                    ingress {
                    description      = "TLS from VPC"
                    from_port        = 443
                    to_port          = 443
                    protocol         = "tcp" 
                    cidr_blocks      = ["0.0.0.0/0"] 
                    ipv6_cidr_blocks = ["::/0"]
                  }
                    ingress {
                    description      = "TLS from VPC"
                    from_port        = 80
                    to_port          = 80
                    protocol         = "tcp" 
                    cidr_blocks      = ["0.0.0.0/0"] 
                    ipv6_cidr_blocks = ["::/0"]
                  }
               
                  egress {
                    from_port        = 0
                    to_port          = 0
                    protocol         = "-1"
                    cidr_blocks      = ["0.0.0.0/0"]
                    ipv6_cidr_blocks = ["::/0"]
                  }
                
                  tags = {
                    Name = "${securityGroupTagName[i]}"
                  }
                }
              `
          securityGroupDetail += securityGroup;
        } else if (vpcTagName.length > 0) {
          let securityGroup = `
              resource "aws_security_group" "${securityGroupTagName[i]}" {
                  name        = "${securityGroupTagName[i]}"
                  description = "Allow TLS inbound traffic"
                  vpc_id      =  aws_vpc.${vpcTagName[i]}.id
                
                //type ssh,rdp,http
                  ingress {
                    description      = "TLS from VPC"
                    from_port        = 22
                    to_port          = 22
                    protocol         = "tcp" 
                    cidr_blocks      = ["0.0.0.0/0"]  
                    ipv6_cidr_blocks = ["::/0"]
                  }
                    ingress {
                    description      = "TLS from VPC"
                    from_port        = 443
                    to_port          = 443
                    protocol         = "tcp" 
                    cidr_blocks      = ["0.0.0.0/0"] 
                    ipv6_cidr_blocks = ["::/0"]
                  }
                    ingress {
                    description      = "TLS from VPC"
                    from_port        = 80
                    to_port          = 80
                    protocol         = "tcp" 
                    cidr_blocks      = ["0.0.0.0/0"] 
                    ipv6_cidr_blocks = ["::/0"]
                  }
                
                  egress {
                    from_port        = 0
                    to_port          = 0
                    protocol         = "-1"
                    cidr_blocks      = ["0.0.0.0/0"]
                    ipv6_cidr_blocks = ["::/0"]
                  }
                
                  tags = {
                    Name = "${securityGroupTagName[i]}"
                  }
                }
              `
          securityGroupDetail += securityGroup;
        }
      }

    }
    return securityGroupDetail;
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

function myFunction(value) {
  let result = [];
  console.log("value is : ",value);
  let data;
  for (let i = 0; i < value.length; i++) {
      switch (value[i]) {
          case 'Amazon Linux 2023 kernel-6.1':
              data = "ami-02a2af70a66af6dfb";
              result.push(data)
              break;
          case 'Amazon Linux 2 Kernel-5.10':
              data = "ami-0d92749d46e71c34c";
              result.push(data)
              break;
          case 'Ubuntu focal 20.04 LTS':
              data = "ami-0a7cf821b91bcccbc";
              result.push(data)
              break;
          case 'Ubuntu jammy 22.04 LTS':
              data = "ami-0287a05f0ef0e9d9a";
              result.push(data)
              break;
          case 'Windows server core base-2022':
              data = "ami-08ac34653a1e1b4b9";
              result.push(data)
              break;
          case 'Windows server core base-2019':
              data = "ami-0b33299742a1b79e0";
              result.push(data)
              break;
          case 'Windows server core base-2016':
              data = "ami-06d692ce72530031b";
              result.push(data)
              break;
          case 'Windows with SQL server-2022 Standard':
              data = "ami-0798b918496671569";
              result.push(data)
              break;
          case 'Red Had Enterprise Linux 9':
              data = "ami-0645cf88151eb2007";
              result.push(data)
              break;
          default:
              data = 'Value is not recognized';
      }
  }


  return result;
}

async function createEc2Instance(req, res) {
  try {
    let subnetId = req.body.ec2Instance.subnetId
    let subnetTittle = req.body.subnet.subnetTittle
    let subnetTagName = req.body.subnet.subnetTagName
    let publicIP = req.body.ec2Instance.publicIP
    let ami = myFunction(req.body.ec2Instance.ami)
    let instanceTagName = req.body.ec2Instance.ec2InstanceTagName
    let securityGroupTittle = req.body.securityGroup.securityGroupTittle
    let securityGroupTagName = req.body.securityGroup.securityGroupTagName
    let securityGroupId = req.body.ec2Instance.securityGroupId
    let vpcTagName = req.body.vpc.vpcTagName
    let instanceDetail = []
    if (instanceTagName.length == 0) {
      return res.status(400).json({ message: "instance name is required" })
    }
    let instanceType = req.body.ec2Instance.instanceType
    if (instanceType.length == 0) {
      return res.status(400).json({ message: "instance type is required" })
    }
    // console.log("detailsssss",instanceDetail)
    // let keyName = req.body.keyName
    // if (keyName.length == 0) {
    //   return res.status(400).json({ message: "key name is required" })
    // }
    if ((securityGroupTagName == 0) && (securityGroupId.length == 0)) {
      return res.status(400).json({ message: "security group id is required" })
    }

    var nameList = [
      "c-dat-security","Demo_security","c-dat-sample-1","c-dat-security-2","c-dat-security-3","c-dat-security-4",
      "c-dat-security-5","c-dat-security-6"
    ];
    
    var finalName = nameList[Math.floor(Math.random() * nameList.length)];
      
       
    for (let i = 0; i < instanceTagName.length; i++) {
      if (publicIP[i] == 'false') {
        publicIP[i] == false
      } else {
        publicIP[i] == true
      }
      let instance = `
      resource "aws_security_group" "${finalName}" {
        name        = "${finalName}"
        description = "Allow TLS inbound traffic"
        vpc_id      =  aws_vpc.${vpcTagName[i]}.id
      
      //type ssh,rdp,http
        ingress {
          description      = "TLS from VPC"
          from_port        = 22
          to_port          = 22
          protocol         = "tcp" 
          cidr_blocks      = ["0.0.0.0/0"]  
          ipv6_cidr_blocks = ["::/0"]
        }
          ingress {
          description      = "TLS from VPC"
          from_port        = 443
          to_port          = 443
          protocol         = "tcp" 
          cidr_blocks      = ["0.0.0.0/0"] 
          ipv6_cidr_blocks = ["::/0"]
        }
          ingress {
          description      = "TLS from VPC"
          from_port        = 80
          to_port          = 80
          protocol         = "tcp" 
          cidr_blocks      = ["0.0.0.0/0"] 
          ipv6_cidr_blocks = ["::/0"]
        }
      
        egress {
          from_port        = 0
          to_port          = 0
          protocol         = "-1"
          cidr_blocks      = ["0.0.0.0/0"]
          ipv6_cidr_blocks = ["::/0"]
        }
      
        tags = {
          Name = "${finalName}"
        }
      }
      resource "aws_instance" "${instanceTagName[i]}"{
          ami = "${ami[i]}"
          instance_type = "${instanceType[i]}"
          associate_public_ip_address = "${publicIP[i]}"
          subnet_id = aws_subnet.${subnetTagName[i]}.id
          vpc_security_group_ids = [aws_security_group.${finalName}.id]
          tags = {
          Name = "${instanceTagName[i]}"
        }
      }`
      instanceDetail += instance;
      // if (subnetId.length > 0) {
      //   if (securityGroupId) {
      //     let instance = `
      //     resource "aws_instance" "${instanceTagName[i]}"{
      //         ami = "${ami[i]}"
      //         instance_type = "${instanceType[i]}"
      //         associate_public_ip_address = "${publicIP[i]}"
      //         subnet_id = "${subnetId[i]}"
      //         vpc_security_group_ids = ["${securityGroupId[i]}"]
      //         tags = {
      //         Name = "${instanceTagName[i]}"
      //       }
      //     }`
      //     instanceDetail += instance;
      //   } else if (securityGroupTittle) {
      //     let instance = `
      //             resource "aws_instance" "${instanceTagName[i]}"{
      //                 ami = "${ami[i]}"
      //                 instance_type = "${instanceType[i]}"
      //                 associate_public_ip_address = ${publicIP[i]}
      //                 subnet_id = "${subnetId[i]}"
      //                 vpc_security_group_ids = ["aws_security_group.${securityGroupTagName[i]}.id"]
      //                 tags = {
      //                 Name = "${instanceTagName[i]}"
      //               }
      //             }`
      //     instanceDetail += instance;
      //   }

      // } else if (subnetTittle) {
      //   if (securityGroupId) {
      //     let instance = `resource "aws_instance" "${instanceTagName[i]}" {
      //         ami = "${ami[i]}"
      //         instance_type = "${instanceType[i]}"
      //         associate_public_ip_address = ${publicIP[i]}
      //         subnet_id = aws_subnet.${subnetTagName[i]}.id
      //         vpc_security_group_ids = ["${securityGroupId[i]}"]
      //         tags = {
      //         Name = "${instanceTagName[i]}"
      //       }
      //     }`
      //     instanceDetail += instance;
      //   } else if (securityGroupTittle) {
      //     let instance = `
      //             resource "aws_instance" "${instanceTagName[i]}"{
      //                 ami = "${ami[i]}"
      //                 instance_type = "${instanceType[i]}"
      //                 associate_public_ip_address = ${publicIP[i]}
      //                 subnet_id = "aws_subnet.${subnetTagName[i]}.id"
      //                 vpc_security_group_ids = ["aws_security_group.${securityGroupTagName[i]}.id"]
      //                 tags = {
      //                 Name = "${instanceTagName[i]}"
      //               }
      //             }`
      //     instanceDetail += instance;
      //   }
      // }
    }
    console.log("instanceDetail : ",instanceDetail);
    return instanceDetail;
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}







module.exports = {
  createVpc, createSubnet, createInternetGateWay, createRouteTable,
  createSecurityGroup, createEc2Instance
};

