export interface VulnMeta {
  cause: string
  remedy: string
  reference?: string
}

const meta: Record<string, VulnMeta> = {
  'Cross-Domain Misconfiguration': {
    cause:
      '서버가 `Access-Control-Allow-Origin: *` 와 같이 과도하게 허용적인 CORS 헤더를 반환하고 있습니다. 이로 인해 공격자가 임의의 외부 도메인에서 이 리소스를 요청해 민감한 데이터를 탈취할 수 있습니다.',
    remedy:
      '`Access-Control-Allow-Origin` 헤더를 와일드카드(`*`) 대신 신뢰할 수 있는 출처 목록으로 제한하세요.\n예) `Access-Control-Allow-Origin: https://yourdomain.com`\n자격 증명(쿠키 등)이 필요한 경우 `Access-Control-Allow-Credentials: true` 와 함께 특정 도메인만 허용해야 합니다.',
    reference: 'https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny',
  },
  'Content Security Policy (CSP) Header Not Set': {
    cause:
      'HTTP 응답 헤더에 `Content-Security-Policy`가 없습니다. CSP가 없으면 브라우저가 인라인 스크립트나 외부 출처의 스크립트를 제한 없이 실행해 XSS(Cross-Site Scripting) 공격에 취약해집니다.',
    remedy:
      '응답 헤더에 CSP를 추가하세요.\n예) `Content-Security-Policy: default-src \'self\'; script-src \'self\'; object-src \'none\'`\n다음 순서로 적용을 권장합니다:\n1. `Content-Security-Policy-Report-Only` 로 먼저 테스트\n2. 위반 리포트 확인 후 정책 정제\n3. 실제 `Content-Security-Policy` 헤더로 전환',
    reference: 'https://developer.mozilla.org/ko/docs/Web/HTTP/CSP',
  },
  'X-Frame-Options Header Not Set': {
    cause:
      '`X-Frame-Options` 헤더가 없어 이 페이지를 `<iframe>` 안에 삽입할 수 있습니다. 공격자가 투명한 iframe 위에 클릭을 유도해 사용자 모르게 원치 않는 작업을 실행시키는 클릭재킹(Clickjacking) 공격에 노출됩니다.',
    remedy:
      '모든 응답에 아래 헤더 중 하나를 추가하세요.\n- `X-Frame-Options: DENY` (모든 프레임 허용 안 함)\n- `X-Frame-Options: SAMEORIGIN` (동일 출처만 허용)\n또는 CSP의 `frame-ancestors` 지시어를 사용하세요: `Content-Security-Policy: frame-ancestors \'self\'`',
  },
  'Missing Anti-clickjacking Header': {
    cause:
      'X-Frame-Options 또는 Content-Security-Policy의 frame-ancestors 지시어가 없어 클릭재킹 공격에 취약합니다.',
    remedy:
      '`X-Frame-Options: SAMEORIGIN` 또는 `Content-Security-Policy: frame-ancestors \'self\'` 헤더를 추가하세요.',
  },
  'X-Content-Type-Options Header Missing': {
    cause:
      '`X-Content-Type-Options: nosniff` 헤더가 없어 브라우저가 응답의 MIME 타입을 잘못 추측(MIME sniffing)할 수 있습니다. 이를 이용해 공격자는 이미지나 텍스트 파일로 위장한 악성 스크립트를 실행시킬 수 있습니다.',
    remedy:
      '모든 응답에 `X-Content-Type-Options: nosniff` 헤더를 추가하고, 각 리소스가 올바른 `Content-Type`을 반환하는지 확인하세요.',
  },
  'Information Disclosure - Suspicious Comments': {
    cause:
      '소스코드나 응답에 내부 정보(TODO, FIXME, 비밀번호 힌트, 내부 시스템 정보 등)가 포함된 주석이 노출되어 있습니다. 공격자가 이를 통해 시스템 구조나 취약점을 파악할 수 있습니다.',
    remedy:
      '프로덕션 빌드 시 민감한 주석을 자동으로 제거하도록 빌드 도구를 설정하세요. 코드 리뷰에서 민감 정보가 포함된 주석을 차단하는 정책을 도입하고, 시크릿 키나 내부 경로는 절대 주석에 기록하지 마세요.',
  },
  'Strict-Transport-Security Header Not Set': {
    cause:
      'HSTS(HTTP Strict Transport Security) 헤더가 없어 브라우저가 HTTP로 초기 연결을 시도할 수 있습니다. 이를 공격자가 가로채 SSL 스트리핑 공격으로 HTTPS 연결을 HTTP로 다운그레이드할 수 있습니다.',
    remedy:
      '`Strict-Transport-Security: max-age=31536000; includeSubDomains` 헤더를 추가하세요. HTTPS가 완전히 구성된 후 적용하고, HSTS Preload List 등록도 고려하세요.',
  },
  'Server Leaks Version Information via "Server" HTTP Response Header Field': {
    cause:
      '`Server` 응답 헤더가 서버 소프트웨어와 버전 정보를 노출하고 있습니다. 공격자가 이 정보를 이용해 알려진 취약점을 대상으로 표적 공격을 할 수 있습니다.',
    remedy:
      '웹 서버 설정에서 `Server` 헤더를 제거하거나 값을 최소화하세요.\n- Nginx: `server_tokens off;`\n- Apache: `ServerTokens Prod` + `ServerSignature Off`\n- Express: `app.disable(\'x-powered-by\')`',
  },
  'Cookie Without Secure Flag': {
    cause:
      '쿠키에 `Secure` 플래그가 없어 HTTP 연결에서도 전송될 수 있습니다. 네트워크를 도청하는 공격자(중간자 공격)가 쿠키를 가로채 세션을 탈취할 수 있습니다.',
    remedy:
      '세션 쿠키 및 인증 관련 쿠키 모두에 `Secure` 플래그를 추가하세요. HTTPS만 사용하는 서비스라면 `HttpOnly; Secure; SameSite=Strict` 조합을 권장합니다.',
  },
  'Cookie No HttpOnly Flag': {
    cause:
      '쿠키에 `HttpOnly` 플래그가 없어 JavaScript(`document.cookie`)로 쿠키를 읽을 수 있습니다. XSS 취약점과 결합되면 공격자가 세션 쿠키를 탈취해 계정을 탈취할 수 있습니다.',
    remedy:
      '세션·인증 관련 모든 쿠키에 `HttpOnly` 플래그를 추가하세요. 클라이언트 JS에서 쿠키를 직접 읽을 필요가 없다면 반드시 설정해야 합니다.',
  },
  'Vulnerable JS Library': {
    cause:
      '알려진 보안 취약점이 있는 버전의 JavaScript 라이브러리를 사용 중입니다. 공격자가 공개된 익스플로잇을 이용해 XSS, 프로토타입 오염 등의 공격을 수행할 수 있습니다.',
    remedy:
      '라이브러리를 최신 보안 패치 버전으로 업데이트하세요. `npm audit` 또는 Snyk, Dependabot 등의 도구로 정기적으로 의존성 취약점을 점검하세요.',
  },
  'HTTPS Content Available via HTTP': {
    cause:
      'HTTPS로 제공되는 사이트의 콘텐츠가 HTTP로도 접근 가능합니다. HTTP는 암호화되지 않아 중간자(MITM) 공격자가 전송 중인 데이터를 도청하거나 변조할 수 있습니다. 또한 HSTS가 설정되지 않은 경우 SSL 스트리핑 공격으로 HTTPS 연결을 강제로 HTTP로 다운그레이드할 수 있습니다.',
    remedy:
      '모든 HTTP 요청을 HTTPS로 리다이렉트하도록 서버를 설정하세요.\n- Nginx: `return 301 https://$host$request_uri;`\n- Apache: `RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`\n\n추가로 `Strict-Transport-Security: max-age=31536000; includeSubDomains` 헤더를 설정해 브라우저가 이후 요청을 항상 HTTPS로 전송하도록 강제하세요.',
    reference: 'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/02-Testing_for_Padding_Oracle',
  },
}

export function getVulnMeta(vulnType: string): VulnMeta | null {
  const exact = meta[vulnType]
  if (exact) return exact
  const key = Object.keys(meta).find((k) => vulnType.toLowerCase().includes(k.toLowerCase()))
  return key ? meta[key] : null
}
