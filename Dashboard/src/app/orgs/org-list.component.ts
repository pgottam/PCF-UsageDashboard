import { Component, OnInit } from '@angular/core';
import { IOrgs } from './orgs';
import { OrgService } from './org.service';
import { IOrgUsage } from './orgUsage';
import { PlatformService } from '../platform-summary/platform-summary.service';
import { IFoundations } from '../platform-summary/foundations';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
// import { OrgAppUsageService } from './org-app-usage.service'

@Component ({
  // selector: 'cb-orgs',
  templateUrl: './org-list.component.html',
  styleUrls: ['./org-list.component.css']
})

export class OrgListComponent implements OnInit {
  pageTitle: string = 'Organization Overview';
  // imageWidth: number = 50;
  // imageMargin: number = 2
  // showImage: boolean = false;

  _listFilter: string;
  errorMessage: any;

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value:string) {
    this._listFilter = value
    this.filteredOrgs=this.listFilter ? this.performFilter(this.listFilter) : this.orgs;
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

  pdcOrgs: any = [];
  orgUsageTemp: any = [];
  orgUsage: IOrgUsage[] = [];
  pdcOrgDetail: IOrgUsage[] = [];

  appUsageTempArr: any = [];
  appUsageArrByOrg: any = [];
  //used to display values in HTML
  finalAppUsageArrByOrg: any = [];

  orgCount: number = 0;

  name: string;
  // [key:string]: string;

  constructor(private orgService: OrgService, private platformService: PlatformService) {}

  performFilter(filterBy: string) {
    filterBy = filterBy.toLocaleLowerCase();
    return this.orgs.filter((org: any) =>
        org.entity.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }
  // generic method to pull back app usage info for each org
  async getAppUsage(orgObjArr: any = []) {

    let fName: string;
    let guid: string;
    let qtr: string;
    const qtrArr: any = ['Q1', 'Q2', 'Q3', 'Q4'];
    const appUsageOrgTempArr: any = [];

    const tempOrgObj: any = orgObjArr;

    console.log('orgObj: ', tempOrgObj);
    console.log('orgObj Length: ', tempOrgObj.length);

    // console.log("Qtr Array length: ", qtr.length);

    // Loop through the org array passed in (orgObj:tempOrgObj)
    for (let k=0;k<tempOrgObj.length;k++) {

      // Loop through qtrArr to make separate API calls to get usage data for each quarter
      for (let i=0;i<qtrArr.length;i++) {
          fName = orgObjArr[k].foundationName;
          guid = orgObjArr[k].orgInfo.guid;
          qtr = qtrArr[i];

          // API call to pull appUsage for each quarter for each org GUID...await = wait for each reply 
          // before executing code below
          let orgAIUsageTemp : any = await this.orgService.getOrgAppUsage(fName, guid, qtr).toPromise();
          // console.log("Test Array: ", orgAIUsageTemp);

          // Assign an array to just the "body" portion of the passed in object`
          orgAIUsageTemp = orgAIUsageTemp.body;
          // console.log("OrgUsageTemp: ", orgAIUsageTemp);
          // console.log("Array (App Usages) output: ", orgAIUsageTemp.app_usages);

          // If the GUID from the first looping object matches the newly fetched GUID, check length of array
          if (orgAIUsageTemp.organization_guid === tempOrgObj[k].orgInfo.guid) {

            // console.log("App Usages Array Length: ", orgAIUsageTemp.app_usages.length);

            // If the app_usage length of the object is greater than 0 and has data, loop through each app_usage array
            if ((orgAIUsageTemp.app_usages.length > 0) && (orgAIUsageTemp.app_usages !== undefined)) {

              // console.log("App Usages Array Length: ", orgAIUsageTemp.app_usages.length);

              // Loop through "app_usages" portion of array and insert into a new array object
              for (let y=0;y<orgAIUsageTemp.app_usages.length;y++) {
              // console.log("Org GUIDs: ", orgAIUsageTemp.organization_guid, tempOrgObj[k].orgInfo.guid);

                // Create global appUsageTempArr that can looped through to aggregate average usage per quarter, per org, per foundation
                appUsageOrgTempArr.push(
                  {
                        foundationName: tempOrgObj[k].foundationName,
                        // qtrName: qtrArr[i],
                        orgName: tempOrgObj[k].orgInfo.name,
                        quarter: qtrArr[i],
                        orgGuid: tempOrgObj[k].orgInfo.guid,
                        spaceGuid: orgAIUsageTemp.app_usages[y].space_guid,
                        space_name: orgAIUsageTemp.app_usages[y].space_name,
                        app_guid: orgAIUsageTemp.app_usages[y].app_guid,
                        app_name: orgAIUsageTemp.app_usages[y].app_name,
                        duration_in_seconds: orgAIUsageTemp.app_usages[y].duration_in_seconds,
                        // avgAIUsage: 0

                  }); // End of appUsageOrgTempArr Push

                  // console.log("AppUsageArray Details: ", appUsageOrgTempArr);
                  // console.log("AppUsageArray Length: ", appUsageOrgTempArr.length);

                } // end app_usage for loop

            } else {

              // TODO: add entry to global array with usage = 0;
              // console.log("App Usage Array Length for ", qtrArr[i], " is 0...no Data for those quarters");
            }

          }  else {

              console.log ('Org GUIDS do not Match!!');

          }
      } // end for loop for each qtr

    } // end initial for loop through tempOrgObj

      // TODO return appUsageOrgTempArr back to original calling function and then call "calculateAppUserPerOrg" from there

      // Aggregate AppUsage and create final array for HTML display
      this.calculateAppUserPerOrg(appUsageOrgTempArr);
      // console.log("AppUsageArray Details: ", this.appUsageTempArr);

  }

  // Takes "appUsageTempArr" and calculates org app usage per quarter
  calculateAppUserPerOrg(appUsageArr: any = []) {
    // console.log('calc orig Array: ', appUsageArr);
    let appUsageCalcPerOrgArr: any = appUsageArr;
    let calcQtrlyAppUsage: number;
    let daysInQtr = 0;
    // constant assigned for seconds in a day to be used to calculate Avg AI usage below
    const secondsInADay = 86400;

    // console.log("Calculate App Usage Method: ", appUsageCalcPerOrgArr);
    // console.log("appUsageCalcPerOrg Length: ", appUsageCalcPerOrgArr.length);
    // Loop through new usage array that was passed in
    for (let i = 0; i < appUsageCalcPerOrgArr.length; i++) {
      // console.log("Outer Array Length: ", appUsageCalcPerOrgArr[i].quarter);

      // reset calcQtrlyAppUsage to 0;
      calcQtrlyAppUsage = 0;
      for (let x = 0; x < appUsageCalcPerOrgArr.length; x++) {
        // console.log("App Name: ", appUsageCalcPerOrgArr[x].app_name);

        // If the app_usage length is greater than 0 and not undefined
        if ((appUsageCalcPerOrgArr.length > 0) && (appUsageCalcPerOrgArr !== undefined)) {
          // console.log("App Usage Data Present");

          // If orgNames match, aggregate appUsage
          if (appUsageCalcPerOrgArr[x].orgName === appUsageCalcPerOrgArr[i].orgName) {

              // aggregate appUsage for the multiple org instances listed in the passed in array
              calcQtrlyAppUsage += appUsageCalcPerOrgArr[x].duration_in_seconds;
              // console.log("Name and Duration: ", appUsageCalcPerOrgArr[x].app_name, appUsageCalcPerOrgArr[x].duration_in_seconds);

          } else {
            // do nothing to move on to next record
            // console.log("App Name: ", appUsageCalcPerOrgArr[x].app_name, " does not match ", appUsageCalcPerOrgArr[i].app_name);
          }
        } else {
          // do nothing to skip records
          console.log('AppUsage Record is empty');
        }

    } // end of inner for loop

    // console.log("Name and Duration: ", appUsageCalcPerOrgArr[i].app_name, calcQtrlyAppUsage);
    // console.log("AppUsage Quarter Name: ", appUsageCalcPerOrgArr[i].quarter);

    // Set the number of days in each quarter
    switch(appUsageCalcPerOrgArr[i].quarter) {
      case 'Q1':
        daysInQtr = 90;
        calcQtrlyAppUsage = calcQtrlyAppUsage / (secondsInADay * daysInQtr);
        let result: any = this.deDuplicateUsageArray(appUsageCalcPerOrgArr[i])
        this.appUsageArrByOrg.push(
          {
            Q1: {
              foundationName: appUsageCalcPerOrgArr[i].foundationName,
              // qtrName: qtrArr[i],
              orgName: appUsageCalcPerOrgArr[i].orgName,
              quarter: appUsageCalcPerOrgArr[i].quarter,
              orgGuid: appUsageCalcPerOrgArr[i].orgGuid,
              app_name: appUsageCalcPerOrgArr[i].app_name,
              //duration_in_seconds: orgAIUsageTemp.app_usages[y].duration_in_seconds,
              avgAIUsage: calcQtrlyAppUsage
            }
          }); // End of appUsageOrgTempArr Push
          this.deduplicate
        break;
      case 'Q2':
        daysInQtr = 91;
        break;
      case 'Q3':
        daysInQtr = 92;
        break;
      case 'Q4':
        daysInQtr = 92;
        break;
    } // end of switch

      console.log('Test Array: ', this.appUsageArrByOrg);
      // calculate actual avg AI usage per org
      //calcQtrlyAppUsage = calcQtrlyAppUsage / (secondsInADay * daysInQtr);
      // console.log("Average AI (seconds / total seconds in quarter): ", appUsageCalcPerOrgArr[i].app_name, calcQtrlyAppUsage);

      // Create final array object for apps and avg AI consumption, and de-duplicate to a single record for each for HTML display
      //this.avgAiConsumptionByOrg(calcQtrlyAppUsage, appUsageCalcPerOrgArr);

      /*this.appUsageArrByOrg.push(
        {
          foundationName: appUsageCalcPerOrgArr[i].foundationName,
          // qtrName: qtrArr[i],
          orgName: appUsageCalcPerOrgArr[i].orgName,
          quarter: appUsageCalcPerOrgArr[i].quarter,
          orgGuid: appUsageCalcPerOrgArr[i].orgGuid,
          app_name: appUsageCalcPerOrgArr[i].app_name,
          //duration_in_seconds: orgAIUsageTemp.app_usages[y].duration_in_seconds,
          avgAIUsage: calcQtrlyAppUsage

        }); // End of appUsageOrgTempArr Push*/
        

       

      // calculate unique app count across per org
      // appUsageCalcPerOrgArr = Object.keys(u).length;

    } // end of outer for loop
      // console.log('Final AI Usage by Org Array: ', this.appUsageArrByOrg);

     // de-duplicate app names into a single instance with total avg AI consumption
     const q1 = [];
     const q2 = [];
     let usageTempQ1: any = [];
     let usageTempQ2: any = [];
     let appUsageArrByOrg: any = this.appUsageArrByOrg;

     /*appUsageArrByOrg.forEach( function( usage ) {
       // let uname = user.username;

       // **TODO: remove system orgs from user object
        // console.log('usage Array: ', appUsageArrByOrg);
       if (usage.Q1.quarter.indexOf('Q1') !== -1) {
         usageTempQ1 = q1[usage.orgName] = q1[usage.orgName] || {};
         // usageTempQ1[usage.app_name] = usage.app_name;
         usageTempQ1.quarter = usage.quarter;
         // usageTempQ1.app_name = usage.app_name;
         usageTempQ1.foundationName = usage.foundationName;
         // usageTempQ1.app_guid = usage.app_guid;
         usageTempQ1.orgName = usage.orgName;
         usageTempQ1.avgAIUsage = usage.avgAIUsage;
       } else if (usage.quarter.indexOf('Q2') !== -1) {
           usageTempQ2 = q2[usage.orgName] = q2[usage.orgName] || {};
           usageTempQ2.quarter = usage.quarter;
           // usageTempQ2.app_name = usage.app_name;
           usageTempQ2.foundationName = usage.foundationName;
           // usageTempQ2.app_guid = usage.app_guid;
           usageTempQ2.org_name = usage.name;
           usageTempQ2.avgAIUsage = usage.avgAICalc;
         }
     });

     console.log('De-Dup Q1 Array: ', q1);
     console.log('De-Dup Q2 Array: ', q2);

     this.finalAppUsageArrByOrg.push( q1 , q2 );
     console.log('Final App Usage By Org Values: ', this.finalAppUsageArrByOrg);*/
     // console.log('Cats and Dogs Array: ', this.finalAppUsageArrByOrg[0]['cats-and-dogs'].orgName);

  // console.log("Array Count: ", arrCount);

  } // end of calculateAppUserPerOrg method

  // de-duplicates App Usage Array
  deDuplicateUsageArray (usageArr: any = []) {
    console.log('avgAICalc Array: ', usageArr);

    const u = [];
    let usageTempQ1: any = [];
    let usageTempQ2: any = [];
    let appUsageArrByOrg: any = usageArr;
  
    usageArr.forEach( function( usage ) {
      // let uname = user.username;

      // **TODO: remove system orgs from user object
       console.log('usage Array: ', appUsageArrByOrg);
      if (usage.quarter.indexOf('Q1') !== -1) {
        //usageTempQ1 = u[usage.app_name] = u[usage.app_name] || {};
        usageTempQ1[usage.app_name] = usage.app_name;
        usageTempQ1.quarter = usage.quarter;
        usageTempQ1.app_name = usage.app_name;
        usageTempQ1.foundationName = usage.foundationName;
        //usageTempQ1.app_guid = usage.app_guid;
        usageTempQ1.orgName = usage.orgName;
        usageTempQ1.avgAIUsage = usage.avgAIUsage;
      } else if (usage.quarter.indexOf('Q2') !== -1) {
          //let usageTemp = u[usage.app_name] = u[usage.app_name] || {};
          usageTempQ2 = u[usage.app_name] = u[usage.app_name] || {};
          usageTempQ2.quarter = usage.quarter;
          usageTempQ2.app_name = usage.app_name;
          usageTempQ2.foundationName = usage.foundationName;
          //usageTempQ2.app_guid = usage.app_guid;
          usageTempQ2.org_name = usage.name;
          usageTempQ2.avgAIUsage = usage.avgAICalc;
        }
    });

    console.log('De-Dup Q1 Array: ', u);

    return u;
        
  } // end of de-duplicateUsageArray method */

  ngOnInit() {
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

    // Request that pulls in a single foundation's orgs and retrieves app usage information
    this.orgService.getOneOrg('PDC').subscribe(
      pdcOrgDetail => {
        // console.log('HTTP Response: ', pdcOrgDetail);
        let oTemp = pdcOrgDetail.body;
        // console.log('Org Body Array: ', oTemp);
        let orgTemp : any = [];
        orgTemp = oTemp['resources'];
        // console.log("OTemp Array Length: ", orgTemp);
        // Reduce HTTP response into smaller array


        // loop through the larger object of combined Org data from all foundations to filter out just the "resources" part
        for (let i=0;i<orgTemp.length;i++) {

          // let count : number = orgTemp[i].resources.length;
          // console.log("PDC Array Element: ", orgTemp[i].entity);
          // loop through inner "resources" part of the object to merge all "entity" objects into a single array
          // for (let k=0;k<count;k++) {
            if (orgTemp[i].entity.name !== undefined){
              //Filter out system orgs
              if ( (orgTemp[i].entity.name.indexOf('p-') !== -1) || (orgTemp[i].entity.name.indexOf('system') !== -1)) {
                // do nothing to remove system orgs
              } else {
                // for all other orgs, create a new object
                this.pdcOrgs.push(
                  {
                    foundationName: "PDC",

                    orgInfo: {
                      name: orgTemp[i].entity.name,
                      guid: orgTemp[i].metadata.guid,
                      status: orgTemp[i].entity.status
                    }
                  });
                // orgs.push(oTemp[i].resources[k].metadata,oTemp[i].resources[k].entity.name);
              }

            }
          //}
        }
        // this.pdcOrgDetail = orgTemp;
        // this.filteredOrgs = this.orgs;
        console.log("PDC Orgs Array: ", this.pdcOrgs);

        // get usage for prod 1 foundation, passing in the org array to loop through each org GUID
        this.getAppUsage(this.pdcOrgs);

        //de-duplicates App Usage 
        //console.log('De-Dup Array Param: ', this.appUsageArrByOrg);
        //this.deDuplicateUsageArray(this.appUsageArrByOrg);
        console.log('Final App Usage By Org Values: ', this.finalAppUsageArrByOrg);
        console.log('Cats and Dogs Array: ', this.finalAppUsageArrByOrg);
        // this.calculateAppUserPerOrg(this.appUsageTempArr);


        // TODO new method to loop through and calculate quarterly usage per orgGuid
        // this.calculateAppUserPerOrg(this.appUsageArr);

        // TODO: Call another method to aggregate all "usage seconds" to determine avg AI/SI consumption
      }
    )
    // retrieve org info from each foundations to merge and display unique org info across the entire environment
    this.orgService.getAllOrgs().subscribe(
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
          let count : number = oTemp[i].resources.length;
          //loop through inner "resources" part of the object to merge all "entity" objects into a single array
          for (let k=0;k<count;k++) {
            if (oTemp[i].resources[k].entity.name !== undefined){
              if ( (oTemp[i].resources[k].entity.name.indexOf('p-') !== -1) || (oTemp[i].resources[k].entity.name.indexOf('system') !== -1)) {
                //do nothing to remove system orgs
              } else {
                //for all other orgs, create a new object
                orgs.push(
                  {
                    foundationName: foundationArray[i],

                    orgInfo: {
                      name: oTemp[i].resources[k].entity.name,
                      guid: oTemp[i].resources[k].metadata.guid,
                      status: oTemp[i].resources[k].entity.status
                    }
                  });
                //orgs.push(oTemp[i].resources[k].metadata,oTemp[i].resources[k].entity.name);
              }

            }
          }
        }
        //assign result of above to a global variable
        this.orgsDetail = orgs;
        //console.log("Orgs Push: ", orgs);
        //de-duplicate new orgs array to count unique orgs across multiple foundations
        let o = {};
        orgs.forEach( function( org ) {
          //let uname = user.username;

          //remove system orgs from org object
          if ( (org.orgInfo.name.indexOf('p-') !== -1) || (org.orgInfo.name.indexOf('system') !== -1)) {
            //do nothing to ignore system orgs
          } else {
            let orgTemp = o[org.orgInfo.name] = o[org.orgInfo.name] || {};
            orgTemp[org.orgInfo.name] = false;
          }
        });
        //console.log("De-Dup Org Array: ", o);
        //create array of unique org names to be used to merge with AI and SI usage data from all foundations
        this.orgNamesList = o;
        //this.orgCount = Object.keys(o).length;
        console.log("Org Summary De-Dup 1: " , o);
        error => this.errorMessage = <any>error
      },
      error => this.errorMessage = <any>error
    ),

    //call "org" service and parse JSON object into a readable array
    this.orgService.getOneOrg("PDC").subscribe(orgs => {
        //console.log("Orgs Array Before: ", orgs);
        this.orgTemp = orgs["resources"];
        this.orgs = this.orgTemp;
        this.filteredOrgs = this.orgs;
        console.log("Orgs Array: ", this.orgs);
        /*Object.keys(data).map(key => {
          if (key === 'resources') {
            data[key].map(obj => {
              this.orgTemp.push(obj);
            });
            this.orgs = this.orgTemp;
            this.filteredOrgs = this.orgs;
          }*/
          //console.log('data: ', data);
        }),
        //Use org array to then loop through usage data request

    error => this.errorMessage = <any>error
  }

  /*onRatingClicked(message: string): void {
    this.pageTitle = 'Product List: ' + message;
  }*/
}
