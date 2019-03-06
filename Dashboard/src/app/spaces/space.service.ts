import { Injectable } from "@angular/core";
import { ISpaces } from "./spaces";
import { Observable, throwError, forkJoin } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { catchError, tap } from 'rxjs/operators';
//import { forkJoin } from "rxjs/observable/forkJoin";

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  //private orgsUrl = 'api/orgs/orgTest.json'
  private spacesUrl = 'api/spaces/spaces.json';
  private orgUsageUrl = 'api/orgs/orgUsageSummary.json';

  //spaces URLs per foundation
  private pdcSpacesUrl = 'api/spaces/pdcSpaces.json';
  private cdcSpacesUrl = 'api/spaces/cdcSpaces.json';
  private stageSpacesUrl = 'api/spaces/stageSpaces.json';
  private devSpacesUrl = 'api/spaces/devSpaces.json';

  constructor(private http: HttpClient) {}

  getAllSpaces() {

    let response1 = this.http.get(this.pdcSpacesUrl);
    let response2 = this.http.get(this.cdcSpacesUrl);
    let response3 = this.http.get(this.stageSpacesUrl);
    let response4 = this.http.get(this.devSpacesUrl);

    return forkJoin([response1, response2, response3, response4]).pipe(
        catchError(this.handleError));
  }

  getSpaces() {
    return this.http.get(this.spacesUrl).pipe(
        catchError(this.handleError));

  }

  getSpaceUsage(/*orgGuid: string*/) {

    let response1 = this.http.get(this.spacesUrl);
    let response2 = this.http.get(this.orgUsageUrl);

    return forkJoin([response1, response2]);

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
