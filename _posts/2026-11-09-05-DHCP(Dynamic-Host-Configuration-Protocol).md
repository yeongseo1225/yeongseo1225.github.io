---
title: DHCP(Dynamic Host Configuration Protocol)
filename: 2026-11-09-05-DHCP(Dynamic-Host-Configuration-Protocol)
date: 2026-11-09
categories:
  - Security/Application
share: true
tags:
---

## DHCP(Dynamic Host Configuration Protocol)

- <strong>동적으로 클라이언트의 네트워크 주소(IP)를 설정하기 위한 프로토콜</strong>
- <strong>67/udp(server), 68/udp(client)</strong> 포트 사용

#### 관련 명령어

- ipconfig <strong>/release</strong> : 할당받은  IP 주소를 해제
- ipconfig <strong>/renew</strong> : 새로운 IP 주소를 DHCP 서버로부터 받음.

#### IP 할당 절차

- <strong>DHCP Discover 메세지</strong> : DHCP 서버를 찾기 위한 메세지로 자신의 MAC 주소를 담아서 브로드캐스트한다.
- <strong>DHCP Offer 메세지</strong> : DHCP 서버가 클라이언트에게 IP 정보를 제공해주는 메세지
- <strong>DHCP Request 메세지</strong> : 해당 IP를 사용하겠다고 서버에 용청하는 메세지. 서버가 Offer 메세지를 통해 주소를 제공하면 바로 설정하지 않고 사용하겠다는 메세지를 다시 보낸다.
- <strong>DHCP Ack 메세지</strong> : 서버는 해당 MAC과 IP 주소 정보를 테이블에 저장하고 다시 한 번 할당된 주소 정보를 클라이언트에게 전송해준다. 이 메세지를 받고 IP 정보를 설정한다.

#### DHCP Starvation 공격

- DHCP 서버의 IP 주소 할당 범위를 모두 소진시켜 정상적인 클라이언트가 IP를 할당받지 못하게 하는 공격.
- discover 메세지를 서로 다른 MAC 주소로 대량으로 보내게 되면 이에 대한 offer가 올 것이고 여기서 Request 메세지까지 보낸 후에 실제로는 할당하지 않는다.
- <strong>공격 방식</strong>
    - 서로 다른 MAC 주소를 사용하여 DHCP Discover 메시지를 대량 전송.
    - DHCP 서버로부터 Offer를 받은 후 Request까지 전송하여 IP 주소를 임대받는 것처럼 만들지만, 실제로는 IP를 사용하지 않음.
    - 결과적으로 DHCP 서버의 할당 가능한 IP 주소가 고갈되어 정상적인 IP 할당이 불가능해짐.
