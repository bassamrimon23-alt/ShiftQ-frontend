// شكل الخطأ الموحد اللي الـ UI بيتعامل معاه في كل التطبيق:
// { isAppError: true, code, message, status?, fieldErrors? }

export const ERROR_MESSAGES = {
  NO_INTERNET: 'No internet connection. Please check your network and try again.',
  TIMEOUT: 'The server took too long to respond. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_DISABLED: 'Your account is disabled. Please contact HR.',
  SUBSCRIPTION_SUSPENDED: 'Your company subscription is suspended.',
  FORBIDDEN: "You don't have permission to do this.",
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check the data you entered.',

  GPS_UNSUPPORTED: 'Location is not supported on this device.',
  GPS_DENIED: 'Location permission denied. Please enable it in your browser settings.',
  GPS_UNAVAILABLE: 'Could not get your location. Please try again.',
  GPS_TIMEOUT: 'Getting your location took too long. Please try again.',
  LOW_ACCURACY: 'Location accuracy is low. Please retry.',
  OUTSIDE_GEOFENCE: 'You are outside the allowed area.',

  QR_EXPIRED: 'QR expired. Please scan a new one.',
  QR_INVALID: 'Invalid QR code.',
  DEVICE_UNKNOWN: 'Unknown device. Additional verification is required.',
  DUPLICATE_CHECKIN: 'You already checked in for this shift.',
  CHECKOUT_WITHOUT_CHECKIN: 'You cannot check out before checking in.',
  NO_SHIFT: 'No shift assigned. Please contact HR.',

  SERVER_ERROR: 'Something went wrong on our side. Please try again later.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

export function makeAppError(code, extra = {}) {
  return {
    isAppError: true,
    code,
    message: ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN,
    ...extra,
  };
}

// بيحوّل أي error (axios أو GPS أو غيره) لـ AppError
export function toAppError(error) {
  if (error && error.isAppError) return error;

  // Axios: الـ Backend رد بـ status
  if (error && error.response) {
    const { status, data } = error.response;
    const code = (data && data.code) || (status >= 500 ? 'SERVER_ERROR' : `HTTP_${status}`);
    return {
      isAppError: true,
      code,
      status,
      message: ERROR_MESSAGES[code] || (data && data.message) || ERROR_MESSAGES.UNKNOWN,
      fieldErrors: data && data.fieldErrors,
    };
  }

  // Axios: مفيش رد خالص
  if (error && error.isAxiosError) {
    if (error.code === 'ECONNABORTED') return makeAppError('TIMEOUT');
    return makeAppError('NO_INTERNET');
  }

  return makeAppError('UNKNOWN');
}
