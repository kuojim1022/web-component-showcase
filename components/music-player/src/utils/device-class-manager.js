const MOBILE_REGEX =
  /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Opera Mini/i;

let mobileClassOwnerCount = 0;

// 判斷目前執行環境是否為行動裝置。
export function isMobileDevice() {
  return MOBILE_REGEX.test(navigator.userAgent);
}

// 取得 mobile class 使用權，必要時加到 body。
export function acquireMobileClass() {
  mobileClassOwnerCount += 1;
  document.body.classList.add("mobile-device");
}

// 釋放 mobile class 使用權，無持有者時移除 body class。
export function releaseMobileClass() {
  mobileClassOwnerCount = Math.max(0, mobileClassOwnerCount - 1);
  if (mobileClassOwnerCount === 0) {
    document.body.classList.remove("mobile-device");
  }
}
