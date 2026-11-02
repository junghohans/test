/**
 * Trivy + LLM 보안 스캔 테스트용 더미 애플리케이션
 * 취약한 버전의 라이브러리 함수가 실제로 호출되는 맥락(Reachability)을 제공합니다.
 */

const _ = require('lodash');
const minimist = require('minimist');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// 1. minimist: CLI 인자 파싱 (Prototype Pollution 위험 지점)
const args = minimist(process.argv.slice(2), {
  default: { mode: 'audit' }
});
console.log(`[Config] Running mode: ${args.mode}`);

// 2. lodash: 객체 병합 (Prototype Pollution 위험 지점)
function updateUserProfile(baseProfile, userInput) {
  // 실제 취약점이 발생하는 lodash.merge 함수 호출
  const updated = _.merge({}, baseProfile, userInput);
  return updated;
}

const defaultProfile = { role: 'user', preferences: { theme: 'dark' } };
const mockInput = { preferences: { notifications: true } };
const user = updateUserProfile(defaultProfile, mockInput);
console.log(`[User] Profile updated:`, user);

// 3. axios: 외부 리소스 요청 (SSRF / ReDoS 위험 지점)
async function fetchRemoteReport(targetUrl) {
  try {
    const response = await axios.get(targetUrl, { timeout: 3000 });
    return response.status;
  } catch (err) {
    return 'fetch_failed';
  }
}

// 4. jsonwebtoken: 토큰 검증 로직 (Insecure Key Verification 위험 지점)
function authenticateRequest(authHeader) {
  const secretKey = 'pipeline-test-secret';
  try {
    // 취약 버전의 jwt.verify 함수 호출
    const decoded = jwt.verify(authHeader, secretKey);
    return decoded;
  } catch (err) {
    return null;
  }
}

console.log('[App] Dummy pipeline test application initialized successfully.');

