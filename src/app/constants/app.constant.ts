import { environment } from '../../environments/environment';

/*AUTH*/
// export const TOKEN_AUTH_USERNAME = 'jwtmivoclientid';
// export const TOKEN_AUTH_PASSWORD = 'jwtpa$$w0rd';
export const TOKEN_AUTH_USERNAME = 'testjwtclientid';
export const TOKEN_AUTH_PASSWORD = 'XY7kmzoNzl100';
export const TOKEN_NAME = 'access_token';

//access authentication token
export const AUTH_TOKEN = environment.apiUrl + 'oauth/token';

//access API URL
export const API_URL = environment.apiUrl + 'api';

//expiration time notification in minutes
export const EXPIRY_NOTI_MINUTES = 52;

//expiration time in minutes
export const EXPIRY_MINUTES = 55;

//deployment version
export const VER = 'v1.20210621';