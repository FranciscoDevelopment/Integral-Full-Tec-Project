// Stricter than the global limit (600 requests per minute, see app.module.ts): these are the
// endpoints worth abusing. The key is the throttler name, the global one is called 'default'


// 5 attempts per minute per IP. From the 6th the IP stays blocked for 5 minutes, so guessing
// passwords is slower than just waiting for the window to reset
export const SIGNIN_THROTTLE = {

  default: { limit: 5, ttl: 60000, blockDuration: 300000 }

} ;


// 10 accounts per 10 minutes per IP: stops mass account creation without bothering a class
// that signs up together behind the same network
export const SIGNUP_THROTTLE = {

  default: { limit: 10, ttl: 600000 }

} ;
