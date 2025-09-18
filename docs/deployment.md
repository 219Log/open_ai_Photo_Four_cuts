# 배포 가이드 (Caddy + PM2)

## 서버 요구사항
- OS: Ubuntu 22.04 LTS 권장
- Node.js v20+, npm, git, Caddy v2, PM2
- 도메인: `my-4cut-app.com` (예시)

## 설치 개요
1) 서버 준비: 방화벽에서 80, 443 허용
2) Node.js, npm, git 설치
3) Caddy 설치 및 서비스 등록
4) PM2 설치: `npm i -g pm2`
5) 리포지토리 클론 후 프론트/백엔드 의존성 설치

## 프론트엔드(Next.js) 배포
```bash
npm install
npm run build
pm2 start npm --name "frontend" -- start
# 기본 포트 3000 (환경에 따라 변경 가능)
```

## 백엔드(Express) 배포
```bash
npm install
pm2 start index.js --name "backend" --watch --time
# 기본 포트 8080 (env로 override 가능)
```

## 환경 변수
- `.env` 파일로 각 앱 루트에 배치
- PM2 에코시스템 파일 사용 시 `env` 블록 권장

## Caddy 설정
`/etc/caddy/Caddyfile` 예시:
```caddy
my-4cut-app.com {
    handle_path /api/* {
        reverse_proxy localhost:8080
    }

    handle {
        reverse_proxy localhost:3000
    }

    log {
        output file /var/log/caddy/access.log
    }

    encode gzip zstd
}
```

적용:
```bash
sudo systemctl enable caddy
sudo systemctl restart caddy
```

## 로그/모니터링
- Caddy: `/var/log/caddy/access.log`
- PM2: `pm2 logs`, `pm2 monit`

## 롤링 업데이트
- 프론트엔드: 새 빌드 후 `pm2 restart frontend`
- 백엔드: 코드 변경 반영 `pm2 restart backend`

## 문제 해결 체크리스트
- 80/443 포트 열림 여부
- DNS A 레코드 정상 전파
- Caddy 로그의 인증서 발급 에러 확인
- 백엔드 포트 바인딩 충돌 여부
