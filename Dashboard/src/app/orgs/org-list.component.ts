import { Component, OnInit } from '@angular/core';
import { IOrgs } from './orgs';
import { OrgService } from './org.service';
import { IOrgUsage } from './orgUsage';
import { PlatformService } from '../platform-summary/platform-summary.service';
import { IFoundations } from '../platform-summary/foundations';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { toArray } from 'rxjs/operators';
// import { OrgAppUsageService } from './org-app-usage.service'

@Component ({
  // selector: 'cb-orgs',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.css']
})

export class OrgListComponent implements OnInit {
  pageTitle = 'Usage by Organization';
  // imageWidth: number = 50;
  // imageMargin: number = 2
  // showImage: boolean = false;

  _listFilter: string;
  errorMessage: any;

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value:string) {
    this._listFilter = value;
    this.filteredOrgs = this.listFilter ? this.performFilter(this.listFilter) : this.orgs;
  }

  // assign Date object
  d = new Date;
  // find current year for HTML display of columns
  currentYear = this.d.getFullYear();

  foundations: IFoundations[] = [];
  filteredOrgs: any = [];
  orgs: any = [];
  orgTemp: any = [];
  orgNamesList: any = [];
  orgsDetail: any = [];

  // pdcOrgs: any = [];
  orgUsageTemp: any = [];
  orgUsage: IOrgUsage[] = [];
  pdcOrgDetail: IOrgUsage[] = [];

  appUsageTempArr: any = [];
  appUsageArrByOrg: any = [];
  cbmArrTemp: any = [];

  // prod1 objects for calculations
  prod1Orgtemp: any = [];
  prod1Foundation  = 'PDC';

  // prod2 objects for calculations
  prod2Orgtemp: any = [];
  prod2Foundation  = 'CDC';

  // stage objects for calculations
  stageOrgTemp: any = [];
  stageFoundation  = 'Stage';

  // stage objects for calculations
  devOrgTemp: any = [];
  devFoundation  = 'Dev';

  // set quarterly usage calculation global variables
  private aiCalcQ1 = 0;
  private aiCalcQ2 = 0;
  private aiCalcQ3 = 0;
  private aiCalcQ4 = 0;

  private siCalcQ1 = 0;
  private siCalcQ2 = 0;
  private siCalcQ3 = 0;
  private siCalcQ4 = 0;

  // global array variables used in the de-dup function to create a final array for HTML output of usage data for each foundation
  private prod1Arr: any = [];
  private prod2Arr: any = [];
  private stageArr = [];
  private devArr = [];

  constructor(private orgService: OrgService, private platformService: PlatformService, private http: HttpClient) {}

  performFilter(filterBy: string) {
    filterBy = filterBy.toLocaleLowerCase();
    return this.orgs.filter((org: any) =>
        org.entity.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  // Receives initial object from API call, cleans it up to begin calculating quarterly usage //

  prepareUsageObject(fName: string, usageArr: any = []) {
    let fArr: any = [];
    console.log('usageArr Test: ', usageArr);
    // loop through the larger object of combined Org data
    for (let i = 0; i < usageArr.length; i++) {
      // filter out system orgs
      if (usageArr[i].entity.name !== undefined){
        // Filter out system orgs
        if ( (usageArr[i].entity.name.indexOf('p-') !== -1) ||
            (usageArr[i].entity.name.indexOf('system') !== -1)) {
          // do nothing to remove system orgs
        } else {
          // for all other orgs, create a new object
          fArr.push(
          // this.initialUsageArr.push(
            {
              foundationName: fName,

              orgInfo: {
                name: usageArr[i].entity.name,
                guid: usageArr[i].metadata.guid,
                status: usageArr[i].entity.status
              }
            });
          }
      } // end of IF statement
   } // end of FOR loop
    return fArr;
  } // end of prepareUsageObject function

  async combineArrays(aiArr: any = [], siArr: any = [], fName: string, orgName: string, qtr: number) {
    const usageOrgTempArr: any = [];
    this.cbmArrTemp = [];
    
    // console.log('siArr: ', siArr);
    // console.log('aiArr: ', aiArr);
    
    // combine AI and SI HTTP response objects into a single object...changed duration name elements
    // will allow object to be consumed and manipulated together instead of separately
    this.cbmArrTemp.push(
      {
        foundationName: fName,
        orgName: orgName,
        quarter: qtr,
        org_guid: aiArr.orgGuid,
        // app_name: usageOrgTempArr[u][x].app_name,
        ai_duration: aiArr.aiDurationInSecs,
        // svc_name: usageOrgTempArr[u][x].service_name,
        si_duration: siArr.siDurationInSecs
      }
    );
  } // end of combineArrays function

  // function to pull back app usage info for each org
  async getAppUsage(fName: string, orgObjArr: any = []) {

    const qtrArr: any = ['1', '2', '3', '4'];
    const tempOrgObj: any = orgObjArr;

    // console.log('getAppUsage: imported testTemp Object: ', tempOrgObj);

    // Loop through the org array passed in (orgObj:tempOrgObj)...contains only org names, guids and foundation names
    for (let k = 0; k < tempOrgObj.length; k++) {
      // reset global usage array
      this.cbmArrTemp = [];
      // Ignores system orgs for usage calculation
      if ( (tempOrgObj[k].name.indexOf('p-') !== -1) ||
      (tempOrgObj[k].name.indexOf('system') !== -1)) {
      // do nothing to remove system orgs
      } else { 
      // Loop through qtrArr to make separate API calls to get usage data for each quarter
        for (let i = 0; i < qtrArr.length; i++) {

            // API call to pull appUsage and svcUsage for each quarter for each org GUID...await = wait for each reply 
            // before executing code below
            const orgAIUsageTemp: any = await this.orgService.TESTOrgAppUsage(fName, tempOrgObj[k].guid, qtrArr[i]).toPromise();
            const orgSIUsageTemp: any = await this.orgService.TESTOrgSvcUsage(fName, tempOrgObj[k].guid, qtrArr[i]).toPromise();

            // console.log(fName, ' : orgAIUsageTemp: ', orgAIUsageTemp.aiDurationInSecs);

            // If the GUID from the first looping object matches the newly fetched GUID, continue
            // if (orgAIUsageTemp.orgGuid === tempOrgObj[k].guid) {
            if ((orgAIUsageTemp.orgGuid === tempOrgObj[k].guid) &&
                (orgSIUsageTemp.orgGuid === tempOrgObj[k].guid)) {

              // combine AI and SI arrays into one
              await this.combineArrays(orgAIUsageTemp, orgSIUsageTemp, fName, tempOrgObj[k].name, qtrArr[i]);
               // console.log('End of Combined Array Function (this.cbmArrTemp): ', this.cbmArrTemp);

            }  else {
                // ignore element if org guids do not match
                console.log ('Org GUIDS do not Match!!');
            }

             await this.calculateAppUserPerOrg(fName, tempOrgObj[k].name, this.cbmArrTemp);
            // await this.calculateAppUserPerOrg(fName, tempOrgObj[k].name, orgAIUsageTemp);
        } // end for loop for each qtr
      } // end of ELSE

      
    } // end initial for loop through tempOrgObj

      // call de-dup function to trim arrays down to group of unique orgNames per quarter and per foundtion 
      await this.deDuplicateUsageArray(this.appUsageArrByOrg);
      
      // reset object after each foundation
      this.appUsageArrByOrg = [];

  }  // end of getAppUsage function

  // Calculates org app/svc usage per quarter
  async calculateAppUserPerOrg(fName: string, orgName: string, usageArr: any = []) {

    const usageCalcPerOrgArr: any = usageArr;
    // console.log('calculateAppUserPerOrg: Imported cbmArr Object ', usageArr);
    let daysInQtr = 0;
    // constant assigned for seconds in a day to be used to calculate Avg AI usage below
    const secondsInADay = 86400;

    // Set the number of days in each quarter and calculate AI usage by quarter per foundation
    switch (usageCalcPerOrgArr[0].quarter) {
      case '1':
        daysInQtr = 90;
         this.aiCalcQ1 = usageCalcPerOrgArr[0].ai_duration / (secondsInADay * daysInQtr);
         this.siCalcQ1 = usageCalcPerOrgArr[0].si_duration / (secondsInADay * daysInQtr);
        break;
      case '2':
        daysInQtr = 91;
          this.aiCalcQ2 = usageCalcPerOrgArr[0].ai_duration / (secondsInADay * daysInQtr);
          this.siCalcQ2 = usageCalcPerOrgArr[0].si_duration / (secondsInADay * daysInQtr);
        break;
      case '3':
        daysInQtr = 92;
          this.aiCalcQ3 = usageCalcPerOrgArr[0].ai_duration / (secondsInADay * daysInQtr);
          this.siCalcQ3 = usageCalcPerOrgArr[0].si_duration / (secondsInADay * daysInQtr);
        break;
      case '4':
        daysInQtr = 92;
          this.aiCalcQ4 = usageCalcPerOrgArr[0].ai_duration / (secondsInADay * daysInQtr);
          this.siCalcQ4 = usageCalcPerOrgArr[0].si_duration / (secondsInADay * daysInQtr);
        break;
    } // end of switch
   
    // console.log('aCalcQ1: ', this.aiCalcQ1);
    // console.log('siCalcQ1 ', sCalcQ1);
    this.appUsageArrByOrg.push(
      {
        foundationName: fName,
        orgName: orgName,
        q1AIUsage: this.aiCalcQ1,
        q2AIUsage: this.aiCalcQ2,
        q3AIUsage: this.aiCalcQ3,
        q4AIUsage: this.aiCalcQ4,
        q1SIUsage: this.siCalcQ1,
        q2SIUsage: this.siCalcQ2,
        q3SIUsage: this.siCalcQ3,
        q4SIUsage: this.siCalcQ4
      }); // End of appUsageOrgTempArr Push

    // console.log('Final AI Usage by Org Array: ', this.appUsageArrByOrg);
  
  } // end of calculateAppUserPerOrg method

  // de-duplicates 'this.appUsageArrByOrg' Usage Array
  async deDuplicateUsageArray (usageArr: any = []) {
    // console.log('DeDuplicate function: this.appUsageArrByOrg: ', usageArr);

    // create "maps" for each foundation for de-duplication
    const p1 = new Map();
    const p2 = new Map();
    const s = new Map();
    const d = new Map();

    // loop through usage array, de-dup the org names and create a final array with quarterly usage
    for (const usage of usageArr) {

      if (usage.foundationName === 'PDC') {
        if (!p1.has(usage.orgName)) {
           p1.set(usage.orgName, true);    
           this.prod1Arr.push({
              foundationName: usage.foundationName,
              orgName: usage.orgName,
              q1AIUsage: usage.q1AIUsage,
              q2AIUsage: usage.q2AIUsage,
              q3AIUsage: usage.q3AIUsage,
              q4AIUsage: usage.q4AIUsage,
              q1SIUsage: usage.q1SIUsage,
              q2SIUsage: usage.q2SIUsage,
              q3SIUsage: usage.q3SIUsage,
              q4SIUsage: usage.q4SIUsage
           });
        }
      } else if (usage.foundationName === 'CDC') {
        if (!p2.has(usage.orgName)) {
           p2.set(usage.orgName, true);    
           this.prod2Arr.push({
              foundationName: usage.foundationName,
              orgName: usage.orgName,
              q1AIUsage: usage.q1AIUsage,
              q2AIUsage: usage.q2AIUsage,
              q3AIUsage: usage.q3AIUsage,
              q4AIUsage: usage.q4AIUsage,
              q1SIUsage: usage.q1SIUsage,
              q2SIUsage: usage.q2SIUsage,
              q3SIUsage: usage.q3SIUsage,
              q4SIUsage: usage.q4SIUsage
           });
        }
      } else if (usage.foundationName === 'Stage') {
        console.log('Foundation = Stage', usage.orgName);
        if (!s.has(usage.orgName)) {
           s.set(usage.orgName, true);
           this.stageArr.push({
              foundationName: usage.foundationName,
              orgName: usage.orgName,
              q1AIUsage: usage.q1AIUsage,
              q2AIUsage: usage.q2AIUsage,
              q3AIUsage: usage.q3AIUsage,
              q4AIUsage: usage.q4AIUsage,
              q1SIUsage: usage.q1SIUsage,
              q2SIUsage: usage.q2SIUsage,
              q3SIUsage: usage.q3SIUsage,
              q4SIUsage: usage.q4SIUsage
           });
        }
      } else if (usage.foundationName === 'Dev'){
        if (!d.has(usage.orgName)) {
           d.set(usage.orgName, true);    
           this.devArr.push({
              foundationName: usage.foundationName,
              orgName: usage.orgName,
              q1AIUsage: usage.q1AIUsage,
              q2AIUsage: usage.q2AIUsage,
              q3AIUsage: usage.q3AIUsage,
              q4AIUsage: usage.q4AIUsage,
              q1SIUsage: usage.q1SIUsage,
              q2SIUsage: usage.q2SIUsage,
              q3SIUsage: usage.q3SIUsage,
              q4SIUsage: usage.q4SIUsage
           });
        }
      }// end of outer IF
    } // end of FOR loop
    
    /*console.log ('TEST prod1Arr: ', this.prod1Arr);
    console.log ('TEST prod2Arr: ', this.prod2Arr);
    console.log ('TEST stageArr: ', this.stageArr);
    console.log ('TEST devArr: ', this.devArr);*/

  } // end of de-duplicateUsageArray method */

  ///////////////////////////////////////////////////////////
  //                 ngOnInit                              //
  ///////////////////////////////////////////////////////////

  async ngOnInit() {
    /*this.orgService.getOrgs().subscribe(
        orgs => {
            this.orgs = orgs;
            this.filteredOrgs = this.orgs;
        },
        error => this.errorMessage = <any>error
    );*/

    // retrieve org info from all getFoundations

    // pull back list of foundations
    this.platformService.getFoundations().subscribe(
        foundations => {
            this.foundations = foundations;
            // this.filteredFoundations = this.foundations;
            // this.foundationCount = this.foundations.length;
            // console.log('Foundation Array: ', this.foundations);
        },
        error => this.errorMessage = <any>error
    ),

    /*this.orgService.getToken().subscribe(
      token => {
        console.log("Token: ", token);
      }
    )*/
    
    // TEST CODE...DElete when Done //
    
    await this.orgService.getOrgDetails('PDC').toPromise().then(
      orgDetail => {
        console.log('PDC: HTTP Response: ', orgDetail);
        this.prod1Orgtemp = orgDetail;
      }

    )

    // call function to fetch AI and SI usage for each org
    await this.getAppUsage('PDC', this.prod1Orgtemp);

    await this.orgService.getOrgDetails('CDC').toPromise().then(
      orgDetail => {
        console.log('CDC: HTTP Response: ', orgDetail);
        this.prod2Orgtemp = orgDetail;
      }

    )

    // call function to fetch AI and SI usage for each org
    await this.getAppUsage('CDC', this.prod2Orgtemp);
    
    // END of TEST code...delete when done* //

    // App Usage API call for prod1 foundation to pull app usage data
  /*  await this.orgService.getOrgDetails('PDC').toPromise().then(
      orgDetail => {
        const foundationName = 'PDC';
          // console.log('HTTP Response: ', pdcOrgDetail);
          let oTemp: any = orgDetail.body;
          // console.log('Org Body Array: ', oTemp);
          let orgTemp: any = [];
          // orgTemp = oTemp['resources'];
          this.prod1Orgtemp = oTemp['resources'];
          console.log("OTemp Array Length: ", this.prod1Orgtemp);
          // Reduce HTTP response into smaller array
      }
    )

    // call function to reduce retrived object for usage calculations
    const prod1TestTemp: any = await this.prepareUsageObject(this.prod1Foundation, this.prod1Orgtemp);
    // console.log('FName: ', this.prod1Foundation, ' Test Temp', prod1TestTemp);
    // call function to fetch AI and SI usage for each org
    await this.getAppUsage(prod1TestTemp);

    this.orgService.getOrgDetails('PDC').subscribe(
      pdcOrgDetail => {
        const foundationName = 'PDC';
        // console.log('HTTP Response: ', pdcOrgDetail);
        let oTemp: any = pdcOrgDetail.body;
        // console.log('Org Body Array: ', oTemp);
        let orgTemp: any = [];
        orgTemp = oTemp['resources'];
        // console.log("OTemp Array Length: ", orgTemp);
        // Reduce HTTP response into smaller array

        // call function to reduce retrived object for usage calculations
        this.prepareUsageObject(foundationName, orgTemp);
        // call function to fetch AI and SI usage for each org
        this.getAppUsage(this.initialUsageArr);
      }
    )

   await this.orgService.getOrgDetails('CDC').toPromise().then(
     orgDetail => {
      const foundationName = 'CDC';
      // console.log('HTTP Response: ', pdcOrgDetail);
      const oTemp: any = orgDetail.body;
      // console.log('Org Body Array: ', oTemp);
      let orgTemp: any = [];
      this.prod2Orgtemp = oTemp['resources'];
      // console.log("OTemp Array Length: ", orgTemp);
      // Reduce HTTP response into smaller array

      // call function to reduce retrived object for usage calculations
  
    }
  )

  // call function to reduce retrived object for usage calculations
  const prod2TestTemp: any = await this.prepareUsageObject(this.prod2Foundation, this.prod2Orgtemp);
  console.log('FName: ', this.prod2Foundation, ' Test Temp', prod2TestTemp);
  // call function to fetch AI and SI usage for each org
  await this.getAppUsage(prod2TestTemp);
   
   // App Usage API call for prod2 foundation to pull app usage data
   this.orgService.getOrgDetails('CDC').subscribe(
      pdcOrgDetail => {
        const foundationName = 'CDC';
        // console.log('HTTP Response: ', pdcOrgDetail);
        let oTemp: any = pdcOrgDetail.body;
        // console.log('Org Body Array: ', oTemp);
        let orgTemp: any = [];
        orgTemp = oTemp['resources'];
        // console.log("OTemp Array Length: ", orgTemp);
        // Reduce HTTP response into smaller array

        // call function to reduce retrived object for usage calculations
        this.prepareUsageObject(foundationName, orgTemp);
        // call function to fetch AI and SI usage for each org
        this.getAppUsage(this.initialUsageArr);
      }
    ) 

    // App Usage API call for stage foundation to pull app usage data
    await this.orgService.getOrgDetails('Stage').toPromise().then(
      orgDetail => {
        const foundationName = 'Stage';
        // console.log('HTTP Response: ', pdcOrgDetail);
        const oTemp: any = orgDetail.body;
        // console.log('Org Body Array: ', oTemp);
        let orgTemp: any = [];
        this.stageOrgTemp = oTemp['resources'];
        // console.log("OTemp Array Length: ", orgTemp);
        // Reduce HTTP response into smaller array
      }
    )

    // call function to reduce retrived object for usage calculations
    console.log('StageOrgTemp: ', this.stageOrgTemp);
    const stageTestTemp: any = await this.prepareUsageObject(this.stageFoundation, this.stageOrgTemp);
    console.log('FName: ', this.stageFoundation, ' Test Temp', stageTestTemp);
    // call function to fetch AI and SI usage for each org
    await this.getAppUsage(stageTestTemp);

    // App Usage API call for dev foundation to pull app usage data
    await this.orgService.getOrgDetails('Dev').toPromise().then(
      orgDetail => {
        const foundationName = 'Dev';
        // console.log('HTTP Response: ', pdcOrgDetail);
        let oTemp: any = orgDetail.body;
        // console.log('Org Body Array: ', oTemp);
        let orgTemp: any = [];
        this.devOrgTemp = oTemp['resources'];
        // console.log("OTemp Array Length: ", orgTemp);
        // Reduce HTTP response into smaller array
      }
    ) 

    // call function to reduce retrived object for usage calculations
    console.log('devOrgTemp: ', this.devOrgTemp);
    const devTestTemp: any = await this.prepareUsageObject(this.devFoundation, this.devOrgTemp);
    console.log('FName: ', this.devFoundation, ' Test Temp', devTestTemp);
    // call function to fetch AI and SI usage for each org
    await this.getAppUsage(devTestTemp);
*/
    // TODO: Clean up to make one backend call, passing all foundationNames

    // retrieve org info from each foundations to merge and display unique org info across the entire environment
  /*  this.orgService.getAllOrgs().subscribe(
      allOrgs => {
        // this.orgsDetail = allOrgs
        // this.filteredOrgs = this.orgs;
        let foundationArray : any = [];
        let orgs : any = [];

        // assigns the merged array of multiple foundations to a local array variable
        // this.usersTemp = user;
        let oTemp : any = [];
        oTemp = allOrgs;

        // place each foundation name into an array to be used later to build broader JSON array of org info
        for (let o = 0; o<this.foundations.length;o++) {
          foundationArray.push(this.foundations[o].name);
        }
        // console.log("Foundation Array: ", foundationArray);

        // loop through the larger object of combined Org data from all foundations to filter out just the "resources" part
        for (let i=0;i<oTemp.length;i++) {
          const count : number = oTemp[i].resources.length;
          // loop through inner "resources" part of the object to merge all "entity" objects into a single array
          for (let k=0;k<count;k++) {
            if (oTemp[i].resources[k].entity.name !== undefined){
              if ( (oTemp[i].resources[k].entity.name.indexOf('p-') !== -1) || 
                (oTemp[i].resources[k].entity.name.indexOf('system') !== -1)) {
                // do nothing to remove system orgs
              } else {
                // for all other orgs, create a new object
                orgs.push(
                  {
                    foundationName: foundationArray[i],

                    orgInfo: {
                      name: oTemp[i].resources[k].entity.name,
                      guid: oTemp[i].resources[k].metadata.guid,
                      status: oTemp[i].resources[k].entity.status
                    }
                  });
                // orgs.push(oTemp[i].resources[k].metadata,oTemp[i].resources[k].entity.name);
              }

            }
          }
        }
        // assign result of above to a global variable
        this.orgsDetail = orgs;
        // console.log("Orgs Push: ", orgs);
        // de-duplicate new orgs array to count unique orgs across multiple foundations
        let o = {};
        orgs.forEach( function( org ) {
          // let uname = user.username;

          // remove system orgs from org object
          if ( (org.orgInfo.name.indexOf('p-') !== -1) || (org.orgInfo.name.indexOf('system') !== -1)) {
            // do nothing to ignore system orgs
          } else {
            let orgTemp = o[org.orgInfo.name] = o[org.orgInfo.name] || {};
            orgTemp[org.orgInfo.name] = false;
          }
        });
        // console.log("De-Dup Org Array: ", o);
        // create array of unique org names to be used to merge with AI and SI usage data from all foundations
        this.orgNamesList = o;
        // this.orgCount = Object.keys(o).length;
        // console.log("Org Summary De-Dup 1: " , o);
        error => this.errorMessage = <any>error
      },
      error => this.errorMessage = <any>error
    ), */

    // call "org" service and parse JSON object into a readable array
    /*this.orgService.getOneOrg("PDC").subscribe(orgs => {
        // console.log("Orgs Array Before: ", orgs);
        this.orgTemp = orgs["resources"];
        this.orgs = this.orgTemp;
        this.filteredOrgs = this.orgs;
        console.log("Orgs Array: ", this.orgs);

        }),*/
        // Use org array to then loop through usage data request

    error => this.errorMessage = <any>error
  }

  /*onRatingClicked(message: string): void {
    this.pageTitle = 'Product List: ' + message;
  }*/
}
