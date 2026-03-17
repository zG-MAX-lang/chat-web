// app/components/verifition/api/index.js

// 获取验证码接口 (对应你 Spring Boot 后端的 /captcha/get 接口)
export function reqGet(data) {
  return $fetch('/captcha/get', {
    method: 'POST',
    body: data,
    baseURL: '/api' // 根据你实际的后端代理前缀调整，如果没有代理前缀就去掉这行
  })
}

// 滑动匹配核对接口 (对应你 Spring Boot 后端的 /captcha/check 接口)
export function reqCheck(data) {
  return $fetch('/captcha/check', {
    method: 'POST',
    body: data,
    baseURL: '/api' // 同上
  })
}