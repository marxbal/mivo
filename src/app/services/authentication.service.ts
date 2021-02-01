import {
  Injectable
} from "@angular/core";
import {
  HttpClient
} from "@angular/common/http";
import {
  BehaviorSubject,
  Observable
} from "rxjs";
import {
  map
} from "rxjs/operators";
import {
  User
} from "../objects/User";
import {
  CURRENT_USER,
  MENU
} from "../constants/local.storage";
import {
  Page
} from "../objects/Page";
import {
  API_URL
} from '../constants/app.constant';

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject < User > ;
  public currentUser: Observable < User > ;

  username: String;
  password: String;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject < User > (
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {

    const user = JSON.parse(localStorage.getItem(CURRENT_USER));

    return new User(user);

    // console.log("this.currentUserSubject.value: " + this.currentUserSubject.value);
    // return this.currentUserSubject.value;
  }

  // login(username: String, password: String) {
  //   return this.http
  //     .post < any > (`${API_URL}/users/authenticate`, {
  //       username,
  //       password,
  //     })
  //     .pipe(
  //       map((user) => {
  //         // store user details and jwt token in local storage to keep user logged in between page refreshes
  //         delete user.password;
  //         localStorage.setItem(CURRENT_USER, JSON.stringify(user));
  //         this.currentUserSubject.next(user);
  //         this.getPages();
  //         return user;
  //       })
  //     );
  // }

  login(username: String, password: String) {
    return this.http.post(API_URL + '/auth/login', { username, password }).pipe(map((res) => {
      if (res["status"]) {
      // store user details and jwt token in local storage to keep user logged in between page refreshes
        const user = new User(res["user"]);
        // user.userId = 1101;
        // user.role = 1;
        // user.userName = username as string;
        // user.firstName = "MAPFRE";
        // user.lastName = "INSULAR";
        // user.fullName = "MAPFRE INSULAR";
        // user.address = 'Sta. Rita, Olonggapo City, Zambales, Philippines';
        // user.expiryDay = 4;
        const token = res["token"];
        user.token = this.createAuthToken(token);

        localStorage.setItem(CURRENT_USER, JSON.stringify(user));
        console.log("user " + user);
        this.currentUserSubject.next(user);

        this.getPages();
        return user;
      } else {
        return null;
      }
    }));
  }

  createAuthToken(token: String) {
    return 'Bearer ' + token;
  }

  getPages() {
    // removing pages for user
    const unavailablePages = [
      "query",
      "changePassword",
      "news",
    ];
    const page = new Page();
    for (let p in page) {
      if (unavailablePages.includes(p)) {
        page[p] = false;
      }
    }
    localStorage.setItem(MENU, JSON.stringify(page));
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(MENU);
    this.currentUserSubject.next(null);
  }
}
