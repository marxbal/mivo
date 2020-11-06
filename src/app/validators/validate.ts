import {
  AbstractControl,
  Validators
} from '@angular/forms';
import * as moment from 'moment';
import {
  Utility
} from '../utils/utility';
import {
  GroupPolicy
} from '../objects/GroupPolicy';

export function validateUrl(control: AbstractControl) {
  if (!control.value.startsWith('https') || !control.value.includes('.io')) {
    return {
      validUrl: true
    };
  }
  return null;
}

export function validateItinerary(control: AbstractControl) {
  if (!Utility.isUndefined(control.value)) {
    const smallcaps = control.value.toLowerCase();

    var arr = smallcaps.split('-');
    var firstItinerary = arr[0].trim();
    var lastItinarary = arr[arr.length - 1].trim();
  
    var hasEmptyItem = false;
    arr.forEach(a => {
      if (a.trim() == '') {
        hasEmptyItem = true;
      }
    });
  
    //invalid if first and last itinerary is not the same, has empty item and itinerary is only 1
    if (firstItinerary != lastItinarary || hasEmptyItem || arr.length < 3) {
      return {
        invalidItinerary: true
      };
    }
  }
  return null;
}

export function validateNumber(control: AbstractControl) {
  debugger
  if (!Utility.isUndefined(control.value)) {
    const val = control.value;
    const int = parseInt(control.value);
    console.log("val " + val);
    console.log("int " + int);
    //invalid if value is not the same
    if (int.toString() != val) {
      return {
        invalidNumber: true
      };
    }
  }
  return null;
}

export class Validate {
  static setGroupPolicyValidations(form: any, gp: GroupPolicy) {
    var groupPolicy = form.get('groupPolicy');
    var contract = form.get('contract');
    var subContract = form.get('subContract');

    var cbIsRenewal = form.get('cbIsRenewal');
    var expiringPolicyNumber = form.get('expiringPolicyNumber');

    groupPolicy.valueChanges.subscribe(policy => {
      Utility.updateValidator(contract, Utility.isUndefined(policy) ? null : Validators.required);
      Utility.updateValidator(subContract, Utility.isUndefined(policy) ? null : Validators.required);
      gp.contract = Utility.setNull(!Utility.isUndefined(policy), gp.contract);
      gp.subContract = Utility.setNull(!Utility.isUndefined(policy), gp.subContract);
    });

    cbIsRenewal.valueChanges.subscribe(isRenewal => {
      if (!Utility.isUndefined(isRenewal)) {
        gp.expiringPolicyNumber = Utility.setNull(isRenewal, gp.expiringPolicyNumber);
        Utility.updateValidator(expiringPolicyNumber, isRenewal ? Validators.required : null);
      }
    });
  }
}
