import { Injectable } from "@angular/core";
import { IFoundations } from "./foundations";
import { Observable, throwError, forkJoin } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { catchError } from 'rxjs/operators';
//import { forkJoin } from "rxjs/observable/forkJoin";

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  //private orgsUrl = 'api/orgs/orgTest.json'
  private foundationsUrl = 'api/foundations.json';

  //AI URLs
  private AIUsageUrl = 'http://localhost:8080/api/foundationAppUsage';
  //SI URLs
  private SIUsageUrl = 'http://localhost:8080/api/foundationSvcUsage';
  //User URLs
  private getUserUrl = 'http://localhost:8080/api/getUsers';
  private pdcUserURL = 'api/orgs/pdc-users.json';
  private cdcUserURL = 'api/orgs/cdc-users.json';
  private stageUserURL = 'api/orgs/stage-users.json';
  private devUserURL = 'api/orgs/dev-users.json';

  constructor(private http: HttpClient) {}

  getFoundations(): Observable<IFoundations[]> {
    return this.http.get<IFoundations[]>(this.foundationsUrl).pipe(
        catchError(this.handleError));
  }

  // Takes the foundation name passed into this method and sends an API request to fetch AI and SI consumption
  getPdcUsage(foundationName: string) {

    //pass Foundation Name as parameter so backend can fetch data for each specific foundation
    let response1 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    })
    //let response1 = this.http.get(this.pdcProdAIUrl);
    let response2 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
      });

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));
    /*let response1 = this.http.get(this.pdcUsageURL);
    let response2 = this.http.get(this.cdcUsageURL);

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));*/
    //return this.http.get(this.pdcUsageURL).pipe(
    //    catchError(this.handleError));
  }

  getCdcUsage(foundationName: string) {

    let response1 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    })
    let response2 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    })

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));
    //return this.http.get(this.cdcUsageURL).pipe(
      //  catchError(this.handleError));
  }

  getStageUsage(foundationName: string) {

    let response1 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    });

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));
    //return this.http.get(this.stageUsageURL).pipe(
      //  catchError(this.handleError));
  }

  getDevUsage(foundationName: string) {

    let response1 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName
      },
      observe: 'response'
    });

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));
    //return this.http.get(this.devUsageURL).pipe(
    //    catchError(this.handleError));
  }

  getProdAIs(foundationName1: string, foundationName2: string) {

    let response1 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName1
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName2
      },
      observe: 'response'
    });

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));
  }

  getProdSIs(foundationName1: string, foundationName2: string) {

    let response1 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName1
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName2
      },
      observe: 'response'
    });

    return forkJoin([response1, response2]).pipe(
        catchError(this.handleError));
  }

  getAllAIs(foundationName1: string, foundationName2: string, foundationName3: string, foundationName4: string) {

    let response1 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName1
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName2
      },
      observe: 'response'
    });
    let response3 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName3
      },
      observe: 'response'
    });
    let response4 = this.http.get(this.AIUsageUrl, {
      params: {
        foundationName: foundationName4
      },
      observe: 'response'
    });

    return forkJoin([response1, response2, response3, response4]).pipe(
        catchError(this.handleError));

  }

  getAllSIs(foundationName1: string, foundationName2: string, foundationName3: string, foundationName4: string) {

    let response1 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName1
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName2
      },
      observe: 'response'
    });
    let response3 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName3
      },
      observe: 'response'
    });
    let response4 = this.http.get(this.SIUsageUrl, {
      params: {
        foundationName: foundationName4
      },
      observe: 'response'
    });

    return forkJoin([response1, response2, response3, response4]).pipe(
        catchError(this.handleError));

  }

  getUsers(foundationName1: string, foundationName2: string, foundationName3: string, foundationName4: string) {

    let response1 = this.http.get(this.getUserUrl, {
      params: {
        foundationName: foundationName1
      },
      observe: 'response'
    });
    let response2 = this.http.get(this.getUserUrl, {
      params: {
        foundationName: foundationName2
      },
      observe: 'response'
    });
    let response3 = this.http.get(this.getUserUrl, {
      params: {
        foundationName: foundationName3
      },
      observe: 'response'
    });
    let response4 = this.http.get(this.getUserUrl, {
      params: {
        foundationName: foundationName4
      },
      observe: 'response'
    });

    return forkJoin([response1, response2, response3, response4]).pipe(
        catchError(this.handleError));

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
