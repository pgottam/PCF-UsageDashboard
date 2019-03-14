import { Injectable } from '@angular/core';
import { IOrgs } from './orgs';
import { Observable, throwError, forkJoin } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
// import { forkJoin } from "rxjs/observable/forkJoin";

@Injectable({
  providedIn: 'root'
})
export class OrgService {
  //private testOrgsUrl = `http://localhost:8080/api/orgs?foundation=${foundation}`;
  // private orgsUrl = 'api/orgs/orgTest.json'
  private orgsUrl = 'api/orgs/orgs.json';
  // any request that needs space/app level info per GUID for a foundation
  private appUsageUrl = 'http://localhost:8080/api/appUsage'
  private svcUsageUrl = 'http://localhost:8080/api/svcUsage'
  // private orgsUrl = 'https:///api.run.pivotal.io/v2/organizations';
  private orgUsageUrl = 'api/orgs/orgUsageSummary.json';
  // orgs URLs
  private pdcOrgsUrl = 'api/orgs/pdcOrgs.json';
  private getOrgsUrl = 'http://localhost:8080/api/getOrgs';
  // private pdcOrgsUrl = 'http://localhost:8080/api/getOrgs';
  // private cdcOrgsUrl = 'api/orgs/cdcOrgs.json';
  private cdcOrgsUrl = 'http://localhost:8080/api/getOrgs';
  // private stageOrgsUrl = 'api/orgs/stageOrgs.json';
  private stageOrgsUrl = 'http://localhost:8080/api/getOrgs';
  // private devOrgsUrl = 'api/orgs/devOrgs.json';
  private devOrgsUrl = 'http://localhost:8080/api/getOrgs';

  constructor(private http: HttpClient) {}

  // TEST Code...DELETE when DONE //

  getOrgDetails(foundation: string) {

    return this.http.get(`http://localhost:8080/api/orgs?foundation=${foundation}`).pipe(
      catchError(this.handleError));
  } 

  TESTOrgAppUsage(fName: string, guid: string, quarter: number) {
    return this.http.get(`http://localhost:8080/api/org/${guid}/appusage/${quarter}?foundation=${fName}`).pipe(
      catchError(this.handleError));
  }
  TESTOrgSvcUsage(fName: string, guid: string, quarter: number) {
    return this.http.get(`http://localhost:8080/api/org/${guid}/svcusage/${quarter}?foundation=${fName}`).pipe(
      catchError(this.handleError));
  } // end of TEST code....delete when DONE //

  getAllOrgs() {

    let response1 = this.http.get(this.pdcOrgsUrl);
    let response2 = this.http.get(this.cdcOrgsUrl);
    let response3 = this.http.get(this.stageOrgsUrl);
    let response4 = this.http.get(this.devOrgsUrl);

    return forkJoin([response1, response2, response3, response4]).pipe(
        catchError(this.handleError));
}

  getOrgAppUsage(foundationName: string, guid: string, quarter: string) {
    // console.log("Params: ", foundationName, guid, quarter);

    return this.http.get(this.appUsageUrl, {
      params: {
        foundationName: foundationName,
        orgGuid: guid,
        quarter: quarter
      },
      observe: 'response'
    }).pipe(
        catchError(this.handleError));

  }

  getOrgSvcUsage(foundationName: string, guid: string, quarter: string) {
    // console.log("Params: ", foundationName, guid, quarter);

    return this.http.get(this.svcUsageUrl, {
      params: {
        foundationName: foundationName,
        orgGuid: guid,
        quarter: quarter
      },
      observe: 'response'
    }).pipe(
        catchError(this.handleError));

  }

  /*getOrgDetails(foundationName: string) {

    return this.http.get(this.getOrgsUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    }).pipe(
        catchError(this.handleError));

  }*/

  /*getProd1OrgDetails(foundationName: string) {
    return this.http.get(this.getOrgsUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    }).pipe(
        catchError(this.handleError));
  }*/

  getPdcUsage() {
    return this.http.get(this.orgUsageUrl).pipe(
        catchError(this.handleError));
  }

  getOrgUsage(/*orgGuid: string*/) {

    let response1 = this.http.get(this.orgsUrl);
    let response2 = this.http.get(this.orgUsageUrl);

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));;

    /*return this.http.get(this.orgUsageUrl/*, { //add something like this when needs to pull org specific usage
      params: {
        guid: orgGuid
      },
      observe: 'response'
      })
      .then(response => {
        console.log('Response: ', response);
      })
      .pipe(
        catchError(this.handleError));*/

  }

  /*getOrgs(): Observable<IOrgs[]> {
    return this.http.get<IOrgs[]>(this.orgsUrl).pipe(
          tap(data => console.log('All: ' + JSON.stringify(data))),
          catchError(this.handleError));
  }*/

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {

      errorMessage = `Server returned code ${err.status}, error message is: ${err.message}`;

    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

}
