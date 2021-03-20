import {
  Injectable
} from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import {
  Utility
} from '../utils/utility';

import {
  AuthenticationService
} from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAgentPage = route.routeConfig.path == 'agent';
    const currentUser = this.authenticationService.currentUserValue;
    
    if (currentUser) {
      const noAgentCode = Utility.isUndefined(currentUser.agentCode);
      if (currentUser.role === 1 && isAgentPage) {
        // user cannot choose agent
        this.router.navigate(['']);
      } else if ((currentUser.role === 2 || currentUser.execAgent) && !isAgentPage && noAgentCode) {
        // user cannot navigate if no selected agent
        this.router.navigate(['/agent']);
      }
      // authorised so return true
      return true;
    }
    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
    return false;
  }
}