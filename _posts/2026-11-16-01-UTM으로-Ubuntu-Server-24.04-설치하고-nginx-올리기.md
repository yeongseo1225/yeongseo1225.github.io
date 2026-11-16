---
title: "[리눅스 실습 #1] UTM으로 Ubuntu Server 24.04 설치하고 nginx 올리기"
filename: 2026-11-16-01-UTM으로-Ubuntu-Server-24.04-설치하고-nginx-올리기
date: 2026-11-16
categories:
  - Infra
share: true
tags:
---

## 목표
- 맥북에서 리눅스 서버 실습 환경 만들기
- 서버를 설치하고 → 상태를 확인하고 → 서비스(nginx)를 올리고 → 외부에서 접속하고 → 로그를 읽는 흐름을 한 번 경험하기
## 환경

| 항목    | 내용                             |
| ----- | ------------------------------ |
| 호스트   | 맥북 M5 (Apple Silicon)          |
| 가상화   | UTM (가상화 모드)                   |
| OS    | Ubuntu Server 24.04 LTS, ARM64 |
| VM 사양 | 메모리 2GB, CPU 2코어, 디스크 20GB     |
| 서버 이름 | `ubuntu-lab`                   |

## VM 만들기
### 준비물
1. [mac.getutm.app](https://mac.getutm.app/)에서 UTM을 받는다. (웹사이트 버전은 무료, App Store 버전은 유료)
2. Ubuntu 공식 사이트(ubuntu.com/download/server/arm)에서 **Ubuntu Server ARM64** 이미지를 받는다. 
3. 기존 버전을 다운 받고 싶다면 <strong>Alternative and previous releases → 원하는 버전 선택 → release 선택 → 서버 설치 이미지에서 64비트 ARM 다운 </strong>
### UTM 가상 머신 만들기
1. UTM에서 **새 가상 머신 만들기** → **가상화(Virtualize)** → **Linux**를 고른다. 
2. 부트 ISO에 받은 이미지를 지정하고, 메모리 2048MB, CPU 2코어, 저장 공간 20GB로 설정한다.
3. 공유 디렉터리는 건너뛰기, 이름은 `ubuntu-server` 정도로 저장
4. 하드웨어 항목의 **Enable display output**은 켜 둔다. 끄면 콘솔 화면이 나오지 않는다. **하드웨어 OpenGL 가속**은 서버에서는 필요 없어서 체크하지 않았다.
### Ubuntu 설치
1. 재생 버튼으로 VM을 켜고 **Try or Install Ubuntu Server** 선택
2. 언어는 English. (에러 메시지를 검색하기 쉬움.)
3. 키보드는 그대로, 설치 유형은 **Ubuntu Server** (minimized 아님)
4. 네트워크와 프록시는 기본값 그대로
5. 디스크는 기본값(전체 디스크 사용)
6. 사용자 이름, 서버 이름, 비밀번호 설정
7. **Install OpenSSH server** 체크 (스페이스바로 선택)
8. 추가 snap 패키지는 아무것도 선택하지 않고 진행
9. 설치가 끝나면 **Reboot Now**
10. 설치 CD를 빼지 못했다는 메시지 “Failed unmounting /cdrom” 이 뜨면, **Enter**를 누른다. 그러면 VM이 재부팅된다.
11. 재부팅이 시작되면 설치 화면이 다시 뜨지 않도록 UTM 창 왼쪽 위의 **전원 버튼**(⏻)을 눌러 **VM을 종료**.
12. UTM 메인 화면에서 `ubuntu-server`를 선택하고 오른쪽 위 **VM 설정(슬라이더 아이콘)**을 연다.
13. 왼쪽 목록에서 **CD/DVD**(또는 Drive) 항목을 선택하고, Ubuntu ISO 파일을 **Clear(비우기)** 한다.
14. 저장하고 VM을 다시 **재생 버튼**으로 킨다.
15. 그러면 `ubuntu-lab login:`이 뜬다.

## 기본확인
```bash
whoami          # 내 계정 이름
hostname        # 서버 이름 (ubuntu-lab)
ip a            # IP 주소 확인
uname -a        # 커널과 아키텍처 (aarch64)
cat /etc/os-release   # 우분투 버전
df -h           # 디스크 사용량
free -m         # 메모리
```
### 한국 시간으로 바꾸기
```bash
sudo timedatectl set-timezone Asia/Seoul
timedatectl
```
## 패키지 업데이트
```bash
sudo apt update
sudo apt upgrade -y
```
## nginx 설치

```bash
sudo apt install -y nginx
systemctl status nginx      # 초록색 active (running)이면 성공, 나올 때 q
curl http://localhost       # "Welcome to nginx!" HTML이 나오면 성공
```

<strong>systemd</strong> : 리눅스가 부팅될 때 제일 먼저 실행되어서, nginx 같은 **서비스(백그라운드 프로그램)** 를 켜고 끄고 감시하는 관리자.
<strong>systemctl</strong>은 **systemd라는 서비스 관리자를 조작하는 명령어**. “system control”의 줄임말.
### Systemctl 명령어

```bash
sudo systemctl stop nginx       # 중지
sudo systemctl start nginx      # 시작
sudo systemctl restart nginx    # 재시작
sudo systemctl enable nginx     # 부팅 시 자동 시작
```
## 브라우저에서 접속하기

서버 안에서 `curl`이 되는 건 확인했다. 이제 브라우저에서 접속해 볼 차례다.
그런데, 접속이 되질 않았다.

터미널에서 먼저 테스트해봤다.

```bash
ping -c 3 192.168.64.2
curl -I http://192.168.64.2
```
둘 다 정상적인 응답이 돌아왔다.

문제는 크롬의 로컬 네트워크 권한 확인이 꺼져있는 탓이었다.

**시스템 설정 → 개인정보 보호 및 보안 → 로컬 네트워크**에서 터미널과 사용하는 브라우저(크롬, 사파리 등)를 켜줬다. 브라우저를 완전히 종료했다가 다시 실행하니 브라우저에서 정상적으로 접속됐다. 
## 서비스를 껐다 켜보고 로그 보기
```bash
sudo systemctl stop nginx       # 중지
curl http://localhost           # 연결 실패 확인
sudo systemctl start nginx      # 시작
sudo tail -n 5 /var/log/nginx/access.log   # 접속 기록 보기
sudo tail -n 5 /var/log/nginx/error.log #에러 기록 보기
```
`tail -f`를 붙이면 로그를 실시간으로 볼 수 있다.

## 정리
여기까지 서버를 설치하고, 상태를 확인하고, 서비스를 올리고, 외부에서 접속해 보고, 로그를 읽는 흐름을 한 번 해봤다. 

지금은 비밀번호만 알면 누구든 접속을 시도할 수 있고, 방화벽도 따로 설정하지 않은 상태다. 다음 글에서는 SSH 키 인증으로 접속 방식을 바꾸고, ufw 방화벽으로 필요한 포트만 열어 보려고 한다.


