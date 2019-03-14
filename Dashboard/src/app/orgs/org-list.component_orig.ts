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

  private initialUsageArr: any = [];
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

  // TEST LOGIC...DELETE WHEN DONE //
  TESTgetAppUsage(orgObjArr: any = []) {

    let fName: string;
    let guid: string;
    let qtr: string;
    const qtrArr: any = ['Q1', 'Q2', 'Q3', 'Q4'];
    const appUsageOrgTempArr: any = [];

    const tempOrgObj: any = orgObjArr;
    
    // console.log('orgObj: ', tempOrgObj);
    // console.log('orgObj Length: ', tempOrgObj.length);

    // console.log("Qtr Array length: ", qtr.length);

    let orgAIUsageTemp: any = [];

    for(let u=0;u<tempOrgObj.length;u++) {
      
      for(let q=0; q<tempOrgObj[u].app_usages.length;q++) {

        orgAIUsageTemp.push(
          {
            foundationName: 'PDC',
            quarter: qtrArr[u],
            orgName: 'cats-and-dogs',
            app_name: tempOrgObj[u].app_usages[q].app_name,
            duration_in_seconds: tempOrgObj[u].app_usages[q].duration_in_seconds
          });
      }
    }
    // console.log('orgAIUsageTemp: ', orgAIUsageTemp);
    // TODO return appUsageOrgTempArr back to original calling function and then call "calculateAppUserPerOrg" from there
    // Aggregate AppUsage and create final array for HTML display
    this.calculateAppUserPerOrg(orgAIUsageTemp);
    // console.log("AppUsageArray Details: ", this.appUsageTempArr);

  } // end of TEST LOGIC...DELETE entire function when done //

  // Receives initial object from API call, cleans it up to begin calculating quarterly usage //

  prepareUsageObject(fName: string, usageArr: any = []) {
    let fArr: any = [];
    console.log('usageArr Test: ', usageArr);
    // loop through the larger object of combined Org data
    for (let i = 0; i < usageArr.length; i++) {

      // let count : number = orgTemp[i].resources.length;
      // console.log("PDC Array Element: ", orgTemp[i].entity);
      // filter out system orgs
      if (usageArr[i].entity.name !== undefined){
        // Filter out system orgs
        if ( (usageArr[i].entity.name.indexOf('p-') !== -1) ||
            (usageArr[i].entity.name.indexOf('system') !== -1)) {
          // do nothing to remove system orgs
        } else {
          // for all other orgs, create a new object
          fArr.push(
          //this.initialUsageArr.push(
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

  async combineArrays(aiArr: any = [], siArr: any = [], fName: string, orgName: string, qtr: string) {
    const usageOrgTempArr: any = [];
    // const cbmArrTemp: any = [];
    const guid: number = aiArr.organization_guid;
    const aiArrTemp: any = [];
    const siArrTemp: any = [];

    // aiArrTemp = aiArr.app_usages;
    // Loop through passed in AI object to reduce elements and change 'duration_in_seconds' to 'ai_duration'
    for (let y = 0; y < aiArr.app_usages.length; y++) {
      // only move forward if app_usages has elements
      if (aiArr.app_usages[y] !== undefined) {
        // console.log('aiArr: ', aiArr.app_usages[y].app_name);
        aiArrTemp.push(
          {
            foundationName: fName,
            orgName: orgName,
            qtr: qtr,
            org_guid: guid,
            app_name: aiArr.app_usages[y].app_name,
            ai_duration: aiArr.app_usages[y].duration_in_seconds
          }
        );
      } else {
        // do nothing and skip element
        console.log('No AI Array elements!', aiArr.app_usages[y].qtr);
      }
    }
    // Loop through passed in SI object to reduce elements and change 'duration_in_seconds' to 'si_duration'
    for (let x = 0; x < siArr.service_usages.length; x++) {
      // only move forward if services_usages has elements
      if (siArr.service_usages[x] !== undefined) {
        siArrTemp.push(
          {
            foundationName: fName,
            orgName: orgName,
            qtr: qtr,
            org_guid: guid,
            service_name: siArr.service_usages[x].service_name,
            si_duration: siArr.service_usages[x].duration_in_seconds
          }
        );
      } else {
        // do nothing and skip element
      }
    }
     // console.log('aiArrTemp: ', aiArrTemp);
    // console.log('siArrTemp: ', siArrTemp);

    // combine AI and SI HTTP response objects into a single object...changed duration name elements
    // will allow object to be consumed and manipulated together instead of separately
    usageOrgTempArr.push(aiArrTemp, siArrTemp);

    for (let u = 0; u < usageOrgTempArr.length; u++) {
      // usageOrgTempArr = uTemp;
      // console.log('Length: ', usageOrgTempArr.length);
      for(let x = 0 ; x < usageOrgTempArr[u].length; x++){
        // console.log('App NAme: ', usageOrgTempArr[u][x].app_name);
        //cbmArrTemp.push(
        this.cbmArrTemp.push(
          {
            foundationName: usageOrgTempArr[u][x].foundationName,
            orgName: usageOrgTempArr[u][x].orgName,
            qtr: usageOrgTempArr[u][x].qtr,
            org_guid: usageOrgTempArr[u][x].org_guid,
            app_name: usageOrgTempArr[u][x].app_name,
            ai_duration: usageOrgTempArr[u][x].ai_duration,
            svc_name: usageOrgTempArr[u][x].service_name,
            si_duration: usageOrgTempArr[u][x].si_duration
          }
        )
      } // end of inner for loop
    } // end of outer for loop
    // return cbmArrTemp;
  } // end of combineArrays function

  // function to pull back app usage info for each org
  async getAppUsage(orgObjArr: any = []) {

    let fName: string;
    let guid: string;
    let qtr: string;
    let orgName: string;


    const qtrArr: any = ['Q1', 'Q2', 'Q3', 'Q4'];
    const appUsageOrgTempArr: any = [];
    const svcUsageOrgTempArr: any = [];
    
    //this.cbmArrTemp = [];
    // await console.log('Empty cbmArrTemp: ', this.cbmArrTemp);
    const tempOrgObj: any = orgObjArr;

    console.log('getAppUsage: imported testTemp Object: ', tempOrgObj);
    // console.log('orgObj Length: ', tempOrgObj.length);

    // console.log("Qtr Array length: ", qtr.length);

    // Loop through the org array passed in (orgObj:tempOrgObj)...contains only org names, guids and foundation names
    for (let k = 0; k < tempOrgObj.length; k++) {
        // reset global usage array
        this.cbmArrTemp = [];
        
      // Loop through qtrArr to make separate API calls to get usage data for each quarter
      for (let i = 0; i < qtrArr.length; i++) {

          fName = tempOrgObj[k].foundationName;
          guid = tempOrgObj[k].orgInfo.guid;
          qtr = qtrArr[i];
          orgName = tempOrgObj[k].orgInfo.name;

          // API call to pull appUsage and svcUsage for each quarter for each org GUID...await = wait for each reply 
          // before executing code below
          let orgAIUsageTemp: any = await this.orgService.getOrgAppUsage(fName, guid, qtr).toPromise();
          let orgSIUsageTemp: any = await this.orgService.getOrgSvcUsage(fName, guid, qtr).toPromise();

          // console.log('Test Array: ', orgAIUsageTemp);

          // Assign an array to just the "body" portion of the HTTP response
          orgAIUsageTemp = orgAIUsageTemp.body;
          // console.log('orgAIUsageTemp Body: ', orgAIUsageTemp);
          orgSIUsageTemp = orgSIUsageTemp.body;


          // this.combineArrays(orgAIUsageTemp,orgSIUsageTemp);
          // console.log('orgSIUsageTemp Body: ', orgSIUsageTemp.service_usages.length);

          // If the GUID from the first looping object matches the newly fetched GUID, check length of array
          if ((orgAIUsageTemp.organization_guid === tempOrgObj[k].orgInfo.guid) &&
              (orgSIUsageTemp.organization_guid === tempOrgObj[k].orgInfo.guid)) {

            // combine AI and SI arrays into one
            await this.combineArrays(orgAIUsageTemp, orgSIUsageTemp, fName, orgName, qtr);
            // console.log('End of Combined Array Function (this.cbmArrTemp): ', this.cbmArrTemp);

            // console.log("App Usages Array Length: ", orgAIUsageTemp.app_usages.length);

            // If the app_usage length of the object is greater than 0 and has data, loop through each app_usage array
          /*  if ((orgAIUsageTemp.app_usages.length > 0) && (orgAIUsageTemp.app_usages !== undefined)) {
              // console.log('AI Calc');
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
                        // spaceGuid: orgAIUsageTemp.app_usages[y].space_guid,
                        // space_name: orgAIUsageTemp.app_usages[y].space_name,
                        // app_guid: orgAIUsageTemp.app_usages[y].app_guid,
                        app_name: orgAIUsageTemp.app_usages[y].app_name,
                        duration_in_seconds: orgAIUsageTemp.app_usages[y].duration_in_seconds,
                        // avgAIUsage: 0

                  }); // End of appUsageOrgTempArr Push

                  // console.log("AppUsageArray Details: ", appUsageOrgTempArr);
                  // console.log("AppUsageArray Length: ", appUsageOrgTempArr.length);

                } // end app_usage for loop

            //} else {

              // ignore record and move on
              // console.log("App Usage Array Length for ", qtrArr[i], " is 0...no Data for those quarters");
            }
            // If the service_usage length of the object is greater than 0 and has data, loop through each service_usage array
            if ((orgSIUsageTemp.service_usages.length > 0) && (orgSIUsageTemp.service_usages !== undefined)) {
              console.log('SI Calc');
              console.log('Svc Instances Length: ', orgSIUsageTemp.service_usages.length);
              // Loop through "service_usages" portion of object and insert into a new object
              for (let y=0;y<orgSIUsageTemp.service_usages.length;y++) {
                // console.log("Org GUIDs: ", orgAIUsageTemp.organization_guid, tempOrgObj[k].orgInfo.guid);
                // console.log('SVC Element length: ', orgSIUsageTemp.service_usages[y].service_name);
                // if (orgSIUsageTemp.service_usages[y].length > 0) {
                  // Create global appUsageTempArr that can looped through to aggregate average usage per quarter, per org, per foundation
                  svcUsageOrgTempArr.push(
                    {
                          foundationName: tempOrgObj[k].foundationName,
                          // qtrName: qtrArr[i],
                          orgName: tempOrgObj[k].orgInfo.name,
                          quarter: qtrArr[i],
                          orgGuid: tempOrgObj[k].orgInfo.guid,
                          // spaceGuid: orgAIUsageTemp.app_usages[y].space_guid,
                          // space_name: orgAIUsageTemp.app_usages[y].space_name,
                          // app_guid: orgAIUsageTemp.app_usages[y].app_guid,
                          service_name: orgSIUsageTemp.service_usages[y].service_name,
                          duration_in_seconds: orgAIUsageTemp.app_usages[y].duration_in_seconds,
                          // avgAIUsage: 0
  
                    }); // End of appUsageOrgTempArr Push
  
                    // console.log("AppUsageArray Details: ", appUsageOrgTempArr);
                    // console.log("AppUsageArray Length: ", appUsageOrgTempArr.length);
  
                  //} // end of IF
                } // end of svc_usage for loop
            } else {
              // ignore record and move on
            }*/

          }  else {
              console.log ('Org GUIDS do not Match!!');
          }
          await this.calculateAppUserPerOrg(this.cbmArrTemp);
      } // end for loop for each qtr
      // console.log('FoundationName: ', fName, 'cbmArrTemp ', this.cbmArrTemp);
      // Aggregate AppUsage/SvcUsage and create final array for HTML display
      //await this.calculateAppUserPerOrg(this.cbmArrTemp);
    } // end initial for loop through tempOrgObj

      // TODO return appUsageOrgTempArr back to original calling function and then call "calculateAppUserPerOrg" from there

      //this.calculateAppUserPerOrg(this.uTemp);
      //this.calculateAppUserPerOrg(appUsageOrgTempArr);
      //this.calculateAppUserPerOrg(svcUsageOrgTempArr);

      // call de-dup function to trim arrays down to group of unique orgNames per quarter and per foundtion 
      await this.deDuplicateUsageArray(this.appUsageArrByOrg);
      
      // reset object after each foundation
      this.appUsageArrByOrg = [];
      // console.log("AppUsageArray Details: ", this.appUsageTempArr);

  }  // end of getAppUsage function

  // Takes "ths.uTemp" object and calculates org app usage per quarter
  async calculateAppUserPerOrg(usageArr: any = []) {

    const usageCalcPerOrgArr: any = usageArr;

    // console.log('calculateAppUserPerOrg: Imported cbmArr Object ', usageCalcPerOrgArr);

    let aCalcQ1: number; 
    let aCalcQ2: number;
    let aCalcQ3: number;
    let aCalcQ4: number;
    let sCalcQ1: number;
    let sCalcQ2: number;
    let sCalcQ3: number;
    let sCalcQ4: number;
    let daysInQtr = 0;
    // constant assigned for seconds in a day to be used to calculate Avg AI usage below
    const secondsInADay = 86400;
    const testArr: any = [];
    let fName: string;
    let oName: string;

    // console.log("Calculate App Usage Method: ", appUsageCalcPerOrgArr);

    // Loop through new usage array that was passed in
   // for (let i = 0; i < usageCalcPerOrgArr.length; i++) {
      // console.log("Outer Array Length: ", usageCalcPerOrgArr.length);

      // reset calc variables to 0 for new quarterly calculation per orgName;
      aCalcQ1 = 0;
      aCalcQ2 = 0;
      aCalcQ3 = 0;
      aCalcQ4 = 0;
      sCalcQ1 = 0;
      sCalcQ2 = 0;
      sCalcQ3 = 0;
      sCalcQ4 = 0;

      //console.log('Foundation Name: ', usageCalcPerOrgArr[i].foundationName , ' orgName: ', usageCalcPerOrgArr[i].orgName ,
      //    ', calculateUsagePerOrg function: object length: ', usageCalcPerOrgArr.length);
      for (let x = 0; x < usageCalcPerOrgArr.length; x++) {
        fName = usageCalcPerOrgArr[x].foundationName;
        oName = usageCalcPerOrgArr[x].orgName;

        //console.log('Foundation Name: ', usageCalcPerOrgArr[x].foundationName , ' orgName: ', usageCalcPerOrgArr[x].orgName ,
        //    ', calculateUsagePerOrg function: object length: ', usageCalcPerOrgArr.length);
        
        // console.log("App Name: ", usageCalcPerOrgArr[x].app_name);

        // If the app_usage length is greater than 0 and not undefined
       /* if ((usageCalcPerOrgArr.length > 0) && (usageCalcPerOrgArr !== undefined)) {
          // console.log("App Usage Data Present");

          // If orgNames match, aggregate appUsage for all apps associated with each org
          if (usageCalcPerOrgArr[x].orgName === usageCalcPerOrgArr[i].orgName) {*/

              // aggregate appUsage per quarter
              switch (usageCalcPerOrgArr[x].qtr) {
                case 'Q1':
                  // console.log('SI Duration: ', usageCalcPerOrgArr[x].si_duration);
                  if (usageCalcPerOrgArr[x].ai_duration !== undefined) {
                    aCalcQ1 += usageCalcPerOrgArr[x].ai_duration;
                  } else {
                    // console.log('NAN');
                    aCalcQ1 += 0;
                  }
                  if (usageCalcPerOrgArr[x].si_duration !== undefined) {
                    sCalcQ1 += usageCalcPerOrgArr[x].si_duration;
                  } else {
                    sCalcQ1 += 0;
                  }
                  // console.log('aCalcQ1: ', aCalcQ1);
                  // console.log('sCalcQ1: ', sCalcQ1);
                  break;
                case 'Q2':
                  if (usageCalcPerOrgArr[x].ai_duration !== undefined) {
                    aCalcQ2 += usageCalcPerOrgArr[x].ai_duration;
                  } else {
                    aCalcQ2 += 0;
                  }
                  if (usageCalcPerOrgArr[x].si_duration !== undefined) {
                    sCalcQ2 += usageCalcPerOrgArr[x].si_duration;
                  } else {
                    sCalcQ2 += 0;
                  }
                  break;
                case 'Q3':
                  if (usageCalcPerOrgArr[x].ai_duration !== undefined) {
                    aCalcQ3 += usageCalcPerOrgArr[x].ai_duration;
                  } else {
                    aCalcQ3 += 0;
                  }
                  if (usageCalcPerOrgArr[x].si_duration !== undefined) {
                    sCalcQ3 += usageCalcPerOrgArr[x].si_duration;
                  } else {
                    sCalcQ3 += 0;
                  }
                  break;
                case 'Q4':
                  if (usageCalcPerOrgArr[x].ai_duration !== undefined) {
                    aCalcQ4 += usageCalcPerOrgArr[x].ai_duration;
                  } else {
                    aCalcQ4 += 0;
                  }
                  if (usageCalcPerOrgArr[x].si_duration !== undefined) {
                    sCalcQ4 += usageCalcPerOrgArr[x].si_duration;
                  } else {
                    sCalcQ4 += 0;
                  }
                  break;
              } // end of switch statement

         /* } else { // else for if statement that checks that org names match for usage calculation
            // do nothing to move on to next record
            // console.log('App Name: ', appUsageCalcPerOrgArr[x].app_name, ' does not match ', appUsageCalcPerOrgArr[i].app_name);
          }
        } else {
          // do nothing to skip records
          console.log('AppUsage Record is empty');
        } */

    //} // end of inner for loop

    // Set the number of days in each quarter and calculate AI usage by quarter per foundation
    // console.log(usageCalcPerOrgArr[i].orgName, ' Calc Usages: ', aCalcQ1, aCalcQ2, aCalcQ3);
    switch (usageCalcPerOrgArr[x].qtr) {
      case 'Q1':
        daysInQtr = 90;
          
          this.aiCalcQ1 = aCalcQ1 / (secondsInADay * daysInQtr);
          
          this.siCalcQ1 = sCalcQ1 / (secondsInADay * daysInQtr)
        // let result: any = this.deDuplicateUsageArray(appUsageCalcPerOrgArr[i])
        /*this.appUsageArrByOrg.push(
          {
            foundationName: appUsageCalcPerOrgArr[i].foundationName,
            orgName: appUsageCalcPerOrgArr[i].orgName,
            quarter: appUsageCalcPerOrgArr[i].quarter,
            orgGuid: appUsageCalcPerOrgArr[i].orgGuid,
            app_name: appUsageCalcPerOrgArr[i].app_name,
            avgAIUsage: this.calcQ1
          }); // End of appUsageOrgTempArr Push*/
        break;
      case 'Q2':
        daysInQtr = 91;
        
          this.aiCalcQ2 = aCalcQ2 / (secondsInADay * daysInQtr);
        
          this.siCalcQ2 = aCalcQ2 / (secondsInADay * daysInQtr)
        
        /*this.appUsageArrByOrg.push(
          {
            foundationName: appUsageCalcPerOrgArr[i].foundationName,
            orgName: appUsageCalcPerOrgArr[i].orgName,
            quarter: appUsageCalcPerOrgArr[i].quarter,
            orgGuid: appUsageCalcPerOrgArr[i].orgGuid,
            app_name: appUsageCalcPerOrgArr[i].app_name,
            avgAIUsage: this.calcQ2
          }); // End of appUsageOrgTempArr Push*/
        break;
      case 'Q3':
        daysInQtr = 92;
        // calcQtrlyAppUsage = calcQtrlyAppUsage / (secondsInADay * daysInQtr);
        
          this.aiCalcQ3 = aCalcQ3 / (secondsInADay * daysInQtr);
        
          this.siCalcQ3 = aCalcQ3 / (secondsInADay * daysInQtr)
        
        /*this.appUsageArrByOrg.push(
          {
            foundationName: appUsageCalcPerOrgArr[i].foundationName,
            orgName: appUsageCalcPerOrgArr[i].orgName,
            quarter: appUsageCalcPerOrgArr[i].quarter,
            orgGuid: appUsageCalcPerOrgArr[i].orgGuid,
            app_name: appUsageCalcPerOrgArr[i].app_name,
            avgAIUsage: this.calcQ3
          }); // End of appUsageOrgTempArr Push*/
        break;
      case 'Q4':
        daysInQtr = 92;
          // calcQtrlyAppUsage = calcQtrlyAppUsage / (secondsInADay * daysInQtr);

          this.aiCalcQ4 = aCalcQ4 / (secondsInADay * daysInQtr);
          this.siCalcQ4 = aCalcQ4 / (secondsInADay * daysInQtr)

        /*this.appUsageArrByOrg.push(
          {
            foundationName: appUsageCalcPerOrgArr[i].foundationName,
            orgName: appUsageCalcPerOrgArr[i].orgName,
            quarter: appUsageCalcPerOrgArr[i].quarter,
            orgGuid: appUsageCalcPerOrgArr[i].orgGuid,
            app_name: appUsageCalcPerOrgArr[i].app_name,
            avgAIUsage: this.calcQ4
          }); // End of appUsageOrgTempArr Push*/
        break;
    } // end of switch
    // create object that contains org names and quarterly usage...de-dup is next
   /* this.appUsageArrByOrg.push(
      {
        foundationName: usageCalcPerOrgArr[x].foundationName,
        orgName: usageCalcPerOrgArr[x].orgName,
        q1AIUsage: this.aiCalcQ1,
        q2AIUsage: this.aiCalcQ2,
        q3AIUsage: this.aiCalcQ3,
        q4AIUsage: this.aiCalcQ4,
        q1SIUsage: this.siCalcQ1,
        q2SIUsage: this.siCalcQ2,
        q3SIUsage: this.siCalcQ3,
        q4SIUsage: this.siCalcQ4
      }); // End of appUsageOrgTempArr Push*/

  } // end of outer for loop

    // console.log('aCalcQ1: ', aCalcQ1);
    // console.log('siCalcQ1 ', sCalcQ1);
    this.appUsageArrByOrg.push(
      {
        foundationName: fName,
        orgName: oName,
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
    console.log('DeDuplicate function: this.appUsageArrByOrg: ', usageArr);

    // create "maps" for each foundation for de-duplication
    const p1 = new Map();
    const p2 = new Map();
    const s = new Map();
    const d = new Map();

    const map = new Map();

    // let testArr: any = [];
    // loop through usage array, de-dup the org names and create a final array with quarterly usage
    for (const usage of usageArr) {
      
      // console.log('q1SICalc Before De Dup, ', usage.siCalcQ1);
      // build a single array of org names that can be used for filtering across foundations
      /*if (!map.has(usage.orgName)) {
        map.set(usage.orgName, true);    // set any value to Map
        testArr.push({
           orgName: usage.orgName
        });
      }*/
      // console.log('De-Dup Foundation Name: ', usage.foundationName);
      if (usage.foundationName === 'PDC') {
        if (!p1.has(usage.orgName)) {
           p1.set(usage.orgName, true);    // set any value to Map
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
           p2.set(usage.orgName, true);    // set any value to Map
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
           s.set(usage.orgName, true);    // set any value to Map
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
           d.set(usage.orgName, true);    // set any value to Map
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
    console.log ('TEST prod1Arr: ', this.prod1Arr);
    console.log ('TEST prod2Arr: ', this.prod2Arr);
    console.log ('TEST stageArr: ', this.stageArr);
    console.log ('TEST devArr: ', this.devArr);
    
    // console.log ('TEST testArr: ', testArr);

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
    /*this.orgService.TESTOrgUsage().subscribe(
      usage => {
        console.log('Usage', usage);

        this.TESTgetAppUsage(usage);
      }
    ) // END of TEST code...delete when done*/

    // App Usage API call for prod1 foundation to pull app usage data
    await this.orgService.getOrgDetails('PDC').toPromise().then(
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

          // call function to reduce retrived object for usage calculations
       /*   const testTemp: any = this.prepareUsageObject(foundationName, orgTemp);
          console.log('FName: ', foundationName, ' Test Temp', testTemp);
          // call function to fetch AI and SI usage for each org
          this.getAppUsage(testTemp);*/
      }
    )

    // call function to reduce retrived object for usage calculations
    const prod1TestTemp: any = await this.prepareUsageObject(this.prod1Foundation, this.prod1Orgtemp);
    // console.log('FName: ', this.prod1Foundation, ' Test Temp', prod1TestTemp);
    // call function to fetch AI and SI usage for each org
    await this.getAppUsage(prod1TestTemp);

    /*this.orgService.getOrgDetails('PDC').subscribe(
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
    )*/

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
   /*this.orgService.getOrgDetails('CDC').subscribe(
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
    ) */

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

      /* // call function to reduce retrived object for usage calculations
        this.prepareUsageObject(foundationName, orgTemp);
        // call function to fetch AI and SI usage for each org
        this.getAppUsage(this.initialUsageArr);*/
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

     /*   // call function to reduce retrived object for usage calculations
        this.prepareUsageObject(foundationName, orgTemp);
        // call function to fetch AI and SI usage for each org
        this.getAppUsage(this.initialUsageArr);*/
      }
    ) 

    // call function to reduce retrived object for usage calculations
    console.log('devOrgTemp: ', this.devOrgTemp);
    const devTestTemp: any = await this.prepareUsageObject(this.devFoundation, this.devOrgTemp);
    console.log('FName: ', this.devFoundation, ' Test Temp', devTestTemp);
    // call function to fetch AI and SI usage for each org
    await this.getAppUsage(devTestTemp);

    // TODO: Clean up to make one backend call, passing all foundationNames

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
    ),

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
