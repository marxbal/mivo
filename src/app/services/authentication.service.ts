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
  MENU, 
  MIVO_AUTH,
  DASH_INFO,
  SESSION_TIME
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

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject < User > (
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
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
  //         this.getPages(['account', 'outstanding']);
  //         return user;
  //       })
  //     );
  // }

  login(username: String, password: String) {
    return this.http.post(API_URL + '/auth/login', { username, password }).pipe(map((res) => {
      if (res["status"]) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        const user = new User(res["user"]);
        const pages = res["pages"];
        const token = res["token"];
        user.token = 'Bearer ' + token;

        localStorage.setItem(CURRENT_USER, JSON.stringify(user));
        this.currentUserSubject.next(user);

        this.getPages(pages);
        return user;
      } else {
        return null;
      }
    }));
  }

  getPages(pages: any[]) {
    const page = new Page();
    for (let p in page) {
      //includes all available pages for user
      if (pages.includes(p)) {
        page[p] = true;
      }
    }
    localStorage.setItem(MENU, JSON.stringify(page));
    localStorage.setItem(SESSION_TIME, new Date().toISOString());
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(MENU);
    localStorage.removeItem(MIVO_AUTH);
    localStorage.removeItem(DASH_INFO);
    localStorage.removeItem(SESSION_TIME);
    this.currentUserSubject.next(null);
  }
}
