import { Component, OnInit } from '@angular/core';
import { IFoundations } from './foundations';
import { PlatformService } from './platform-summary.service';
import { OrgService } from '../orgs/org.service';
import { SpaceService } from '../spaces/space.service';
import { DatePipe } from '@angular/common';
//import { IOrgUsage } from '../orgs/orgUsage';
//import { OrgAppUsageService } from './org-app-usage.service'

@Component ({
  //selector: 'cb-orgs',
  templateUrl: './platform-summary.component.html',
  styleUrls: ['./platform-summary.component.css'],
  providers: [DatePipe]
})

export class PlatformSummaryComponent implements OnInit {
  pageTitle = 'Platform Summary';
  //imageWidth: number = 50;
  //imageMargin: number = 2
  //showImage: boolean = false;

  _listFilter: string;
  errorMessage: any;

  get listFilter(): string {
    return this._listFilter;
  }

  set listFilter(value:string) {
    this._listFilter = value
    this.filteredFoundations=this.listFilter ? this.performFilter(this.listFilter) : this.foundations;
  }

  // assign Date object
  d = new Date;
  // find current year for HTML display of columns
  currentYear = this.d.getFullYear();

  filteredFoundations: IFoundations[] = [];
  foundations : IFoundations[] = [];
  // private foundationCount : number;
  // prod AI variables
  private prodAIs : any = [];
  private prodAIAvg = 0;
  private prodAIsTemp : any = [];
  // AI variables for all foundations
  private allAIs : any = [];
  private allAIAvg = 0;
  private allAIsTemp : any = [];
  // prod SI variables
  private prodSIs : any [];
  private prodSIAvg = 0;
  private prodSIsTemp : any = [];
  // SI variables for all foundations
  private allSIs : any = [];
  private allSIAvg = 0;
  private allSIsTemp : any = [];
  // Users variable for all foundations
  private users : any = [];
  private userCount = 0;
  private usersTemp : any = [];
  // Foundation wide usage variables
  allUsageQ1 : any = [];
  allUsageQ2 : any = [];
  allUsageQ3 : any = [];
  allUsageQ4 : any = [];
  allUsage : any = [];
  allAIUsageQ1 : any = [];
  allAIUsageQ2 : any = [];
  allAIUsageQ3 : any = [];
  allAIUsageQ4 : any = [];
  allSIUsageQ1 : any = [];
  allSIUsageQ2 : any = [];
  allSIUsageQ3 : any = [];
  allSIUsageQ4 : any = [];
  //allUsageTemp : any = [];
  //currentYear : number;


  private orgCount = 0;
  private spaceCount =0;

  constructor(private platformService: PlatformService, private orgService: OrgService, private spaceService: SpaceService) {}

  performFilter(filterBy: string): IFoundations[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.foundations.filter((foundation: IFoundations) =>
          foundation.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  // loop through each foundation and calculate quarterly AI and SI consumption values
  calculateQuarterlyAIUsage(usageAIObj:Object) {
    let uAiTemp : any = usageAIObj;
    // console.log(" Usage AI Object ", usageAIObj);
    let q1AICount = 0;
    let q2AICount = 0;
    let q3AICount = 0;
    let q4AICount = 0;

    // this.currentYear = this.d.getFullYear();
    // console.log("Usage AI Object: ", uAiTemp);
    for (let i=0;i<uAiTemp.length;i++) {
      // console.log("AI Usage Array: ", uAiTemp.length);
      // calculate Q1 usage
      if ((uAiTemp[i].month >= 1) && (uAiTemp[i].month <= 3)) {
        //console.log("Q1 Month: ", uAiTemp[i].average_app_instances);
        if (uAiTemp[i].month < 3) {
          q1AICount = uAiTemp[i].average_app_instances;
          // console.log("PDC Q1 Usage <3: ", this.pdcUsageCountQ1);
          // console.log("PDC Q1 Usage: ", q1AICount);
        } else if (uAiTemp[i].month === 3) {
            q1AICount = uAiTemp[2].average_app_instances;
            // console.log("Q1 Usage: ", q1AICount);
          }
      } else if ((uAiTemp[i].month >= 3) && (uAiTemp[i].month <= 6)) {  // Calculate Q2 Usage
        // console.log("Q1 Month: ", this.pdcUsageQ1Temp[i].month);
        if (uAiTemp[i].month < 6) {
          q2AICount = uAiTemp[i].average_app_instances;
          // console.log("PDC Q2 Usage <6: ", this.pdcUsageCountQ2);
        } else if (uAiTemp[i].month === 6) {
            q2AICount = uAiTemp[5].average_app_instances;
            // console.log("PDC Q2 Usage =6: ", this.pdcUsageCountQ2);
          }
      } else if ((uAiTemp[i].month >= 7) && (uAiTemp[i].month <= 9)) { // Calculate Q3 Usage
        // console.log("Q1 Month: ", this.pdcUsageQ1Temp[i].month);
        if (uAiTemp[i].month < 9) {
          q3AICount = uAiTemp[i].average_app_instances;
          // console.log("PDC Q3 Usage <6: ", this.pdcUsageCountQ3);
        } else if (uAiTemp[i].month === 9) {
            q3AICount = uAiTemp[8].average_app_instances;
            // console.log("PDC Q3 Usage =6: ", this.pdcUsageCountQ3);
          }
      } else if ((uAiTemp[i].month >= 10) && (uAiTemp[i].month <= 12)) { // calculate Q4 usage
        // console.log("Q1 Month: ", this.pdcUsageQ1Temp[i].month);
        if (uAiTemp[i].month < 12) {
          q4AICount = uAiTemp[i].average_app_instances;
          // console.log("PDC Q4 Usage <6: ", this.pdcUsageCountQ4);
        } else if (uAiTemp[i].month === 12) {
            q4AICount = uAiTemp[11].average_app_instances;
            // console.log("PDC Q4 Usage =12: ", this.pdcUsageCountQ4);
          }
      } else {
        console.log("No AI Usage Array");
      }
    }
    // append each foundation's AI numbers into a single array
    this.allAIUsageQ1.push(q1AICount);
    this.allAIUsageQ2.push(q2AICount);
    this.allAIUsageQ3.push(q3AICount);
    this.allAIUsageQ4.push(q4AICount);

    console.log("Q1 AI Usage: ", q1AICount);
    // console.log("AI Usage Array Q1: ", this.allAIUsageQ1);

  }

  // loop through each foundation and calculate quarterly AI and SI consumption values
  calculateQuarterlySIUsage(usageSIObj:Object) {
    const uSiTemp: any = usageSIObj;
    let q1SICount = 0;
    let q2SICount = 0;
    let q3SICount = 0;
    let q4SICount = 0;
    let q1Total = 0;
    let q2Total = 0;
    let q3Total = 0;
    let q4Total = 0;

    const q1TotalTemp : any = [];

    // this.currentYear = this.d.getFullYear();
    // console.log("Usage SI Object: ", uSiTemp);
    for (let i=0;i<uSiTemp.length;i++) {
      // only count SIs for Redis, MySQL and RabbitMQ
      if ( (uSiTemp[i].service_name.indexOf('redis') >= 0) ||
            (uSiTemp[i].service_name.indexOf('rabbitmq') >= 0) ||
            (uSiTemp[i].service_name.indexOf('mysql') >= 0)) {
        // loop through usages part of each services array to aggregate monthly usage per service
        for (let x=0;x<uSiTemp[i].usages.length;x++) {
          // console.log("SI Month Array: ", uSiTemp);
          // calculate Q1 usage
          if ((uSiTemp[i].usages[x].month >= 1) && (uSiTemp[i].usages[x].month <= 3)) {
            // console.log("Q1 Months: ", uSiTemp[i].usages[x].month);
            if (uSiTemp[i].usages[x].month < 3) {
              q1SICount = uSiTemp[i].usages[x].average_instances;
              // console.log("PDC Q1 SI Usage: ", q1SICount);
            } else if (uSiTemp[i].usages[x].month === 3) {
                q1SICount = uSiTemp[i].usages[x].average_instances;
                // console.log("Q1 Month 3 Usage: ", q1SICount);
              }
            // console.log("SI Q1 Count: ", q1SICount);
          }
          // calculate Q2 usage
          if ((uSiTemp[i].usages[x].month >= 3) && (uSiTemp[i].usages[x].month <= 6)) {
            // console.log("Q1 Month: ", this.pdcUsageQ1Temp[i].month);
            if (uSiTemp[i].usages[x].month < 6) {
              q2SICount = uSiTemp[i].usages[x].average_instances;
              // console.log("PDC Q2 Usage <6: ", this.pdcUsageCountQ2);
            } else if (uSiTemp[i].usages[x].month === 6) {
                q2SICount = uSiTemp[i].usages[x].average_instances;
                // console.log("PDC Q2 Usage =6: ", this.pdcUsageCountQ2);
              }

          } else if ((uSiTemp[i].usages[x].month >= 7) && (uSiTemp[i].usages[x].month <= 9)) {
            // console.log("Q1 Month: ", this.pdcUsageQ1Temp[i].month);
            if (uSiTemp[i].usages[x].month < 9) {
              q3SICount = uSiTemp[i].usages[x].average_instances;
              // console.log("PDC Q3 SI Usage <6: ", q3SICount);
            } else if (uSiTemp[i].usages[x].month === 9) {
                q3SICount = uSiTemp[i].usages[x].average_instances;
                // console.log("PDC Q3 Usage =6: ", this.pdcUsageCountQ3);
              }
          }
          // calculate Q4 usage
          else if ((uSiTemp[i].usages[x].month >= 10) && (uSiTemp[i].usages[x].month <= 12)) {
            // console.log("Q1 Month: ", this.pdcUsageQ1Temp[i].month);
            if (uSiTemp[i].month < 12) {
              q4SICount = uSiTemp[i].usages[x].average_instances;
              // console.log("PDC Q4 Usage <6: ", this.pdcUsageCountQ4);
            } else if (uSiTemp[i].usages[x].month === 12) {
                q4SICount = uSiTemp[11].usages[x].average_instances;
                // console.log("PDC Q4 Usage =12: ", this.pdcUsageCountQ4);
              }
          }
        }
      }
      // aggregate SI counts per foundation per quarter`
      q1Total += q1SICount;
      q2Total += q2SICount;
      q3Total += q3SICount;
      q4Total += q4SICount;

      //console.log("Q1 SI Count Total: ", q1Total);
      //console.log("Q2 SI Count Total: ", q2Total);
      //console.log("Q3 SI Count Total: ", q3Total);
      //console.log("Q4 SI Count Total: ", q4Total);
    }

    // **TODO: aggregate SI counts

    // append each foundation's AI numbers into a single array
    this.allSIUsageQ1.push(q1Total);
    this.allSIUsageQ2.push(q2Total);
    this.allSIUsageQ3.push(q3Total);
    this.allSIUsageQ4.push(q4Total);

    // append each foundation's SI numbers into a single array
  }
  // TODO: change code to accept foundation name parameter and build a specific array for each foundation
  // merge all usage data back into an object paired with each foundation name
  mergeAllFoundationUsage() {
    let usageTemp : any = [];
    // loop through foundations object
    console.log('Q1 AI Usage Array Length: ', this.allAIUsageQ1.length);
    // console.log("Foundations Array: ", this.foundations);
    for (let k = 0; k<this.foundations.length;k++) {
      // usageTemp.push({name: this.foundations[k].name, Q1: this.allUsageQ1[k], 
            // Q2: this.allUsageQ2[k], Q3: this.allUsageQ3[k], Q4: this.allUsageQ4[k]});
      // console.log("Merge Usage Array: ", this.allAIUsageQ1[k]);
      usageTemp.push(
        {
          name: this.foundations[k].name,
          Q1: {
            AIs: this.allAIUsageQ1[k],
            SIs: this.allSIUsageQ1[k],
          },
          Q2: {
            AIs: this.allAIUsageQ2[k],
            SIs: this.allSIUsageQ2[k],
          },
          Q3: {
            AIs: this.allAIUsageQ3[k],
            SIs: this.allSIUsageQ3[k],
          },
          Q4: {
            AIs: this.allAIUsageQ4[k],
            SIs: this.allSIUsageQ4[k],
          }
        });
        // console.log("Usage Array Loop: ", usageTemp)
    }
    this.allUsage = usageTemp;
    console.log('All Usage Object: ', usageTemp);
  }

  ngOnInit() {
      // pull back list of foundations for table listing
      this.platformService.getFoundations().subscribe(
          foundations => {
              this.foundations = foundations;
              this.filteredFoundations = this.foundations;
              // this.foundationCount = this.foundations.length;
              // console.log('Foundation Array: ', this.foundations);
          },
          error => this.errorMessage = <any>error
      ),

      // retrieve org info from all foundations to display total orgs created across all foundations
      this.orgService.getAllOrgs().subscribe(
        allOrgs => {

          let orgs: any = [];
          console.log('Orgs: ', allOrgs);
          // assigns the merged array of multiple foundations to a local array variable
          // this.usersTemp = user;
          let oTemp: any = [];
          oTemp = allOrgs;
          // loop through the larger object of foundations to filter out just the "resources" part
          for (let i=0;i<oTemp.length;i++) {
            const count: number = oTemp[i].resources.length;
            // loop through inner "resources" part of the object to merge all "entity" objects into a single array
            for (let k=0;k<count;k++) {
              if (oTemp[i].resources[k].entity.name !== undefined){
                orgs.push(oTemp[i].resources[k].entity);
                // console.log("Orgs: ", oTemp[i].resources[k].entity.name);
              }
            }
          }
          // de-duplicate new orgs array to count unique orgs across multiple foundations
          let o = {};
          orgs.forEach( function( org ) {
            // let uname = user.username;
            // console.log('orgs array: ', orgs);
            // **TODO: remove system orgs from user object

            if ( (org.name.indexOf('p-') !== -1) || (org.name.indexOf('system') !== -1)) {
              // do nothing to ignore system orgs
            } else {
              let orgTemp = o[org.name] = o[org.name] || {};
              orgTemp[org.name] = true;
            }
          });
          console.log('De-Dup Org Array: ', o);
          // calculate unique org count across all foundations
          this.orgCount = Object.keys(o).length;
          // console.log("Org Count 1: " , this.userCount);
          error => this.errorMessage = <any>error
        },
        error => this.errorMessage = <any>error
      ),

    // retrieve space information from all foundations to display total spaces created across all foundations
    this.spaceService.getAllSpaces().subscribe(
      allSpaces => {
        let spaces : any = [];
        // console.log("Spaces: ", allSpaces);
        // assigns the merged array of multiple foundations to a local array variable
        // this.usersTemp = user;
        let sTemp : any = [];
        sTemp = allSpaces;
        // loop through the larger object of foundations to filter out just the "resources" part
        for (let i=0;i<sTemp.length;i++) {
          const count : number = sTemp[i].resources.length;
          // loop through inner "resources" part of the object to merge all "entity" objects into a single array
          for (let k=0;k<count;k++) {
            if (sTemp[i].resources[k].entity.name !== undefined) {
              spaces.push(sTemp[i].resources[k].entity);
              // console.log("Spaces: ", sTemp[i].resources[k].entity.name);
            }
          }
        }
        // de-duplicate new orgs array to count unique orgs across multiple foundations
        let s = {};
        spaces.forEach( function( spaces ) {
          // let uname = user.username;

          if ( (spaces.name.indexOf('p-') !== -1) ||
               (spaces.name.indexOf('autoscaling') !== -1) || (spaces.name.indexOf('scs-') !== -1) ||
               (spaces.name.indexOf('system') !== -1) || (spaces.name.indexOf('pivotal-services') !== -1) ||
               (spaces.name.indexOf('instances') !== -1)) {
            // do nothing to ignore system spaces
          } else {
            const spaceTemp = s[spaces.name] = s[spaces.name] || {};
            spaceTemp[spaces.name] = true;
          }
        });
        console.log('De-Dup Spaces Array: ', s);
        // calculate unique user count across all foundations
        this.spaceCount = Object.keys(s).length;
        // console.log("User Count 1: " , this.spaceCount);
        error => this.errorMessage = <any>error
      },
      error => this.errorMessage = <any>error
    ),

    // get prod 1 usage information to display total prod AI count
    this.platformService.getPdcUsage('PDC').subscribe(
      usage => {

        let pdcUsageTemp: any = usage;
        let usageTemp: any = [];
        let pdcSIUsage: any = [];
        let pdcAIUsage: any = [];
        // console.log("Usage Array: PDCUSageTemp", pdcUsageTemp);
        // Reduce HTTP response into smaller array
        for (let x=0;x<pdcUsageTemp.length;x++) {
          usageTemp.push(pdcUsageTemp[x].body);
        }
        console.log('Usage Array: pdcUsage: ', usageTemp);
        // separate the AI and SI objects into separate arrays for their specific usage calculations
        for (let i=0;i<usageTemp.length;i++) {
          if (usageTemp[i].monthly_reports !== undefined) {
            for (let k=0;k<usageTemp[i].monthly_reports.length;k++) {
              pdcAIUsage.push(usageTemp[i].monthly_reports[k]);
              // console.log("AI Array Output: ", usageTemp[i].monthly_reports[k]);
            }
          } else if (usageTemp[i].monthly_service_reports !== undefined) {
            for (let k=0;k<usageTemp[i].monthly_service_reports.length;k++) {
              pdcSIUsage.push(usageTemp[i].monthly_service_reports[k]);
              // console.log("SI Array Output: ", usageTemp[i].monthly_service_reports[k]);
            }
          } else {
            console.log ('No Results Found!');
          }

        }
        // console.log("AI/SI Array: ", pdcAIUsage, pdcSIUsage);
        this.calculateQuarterlyAIUsage(pdcAIUsage);
        this.calculateQuarterlySIUsage(pdcSIUsage);
        // this.mergeAllFoundationUsage();
        // console.log("PDC Q1 Usage: ", this.allAIUsageQ1);
        // this.mergeAllFoundationUsage();
        console.log('Inside PDC Method: Q1 AI Usage Array Length: ', this.allAIUsageQ1.length);
      },
        error => this.errorMessage = <any>error
    ),
    // get prod 2 foundation usage information to display total prod AI count
    this.platformService.getCdcUsage('CDC').subscribe(
      usage => {

        let cdcUsageTemp: any = usage
        let cdcSIUsage: any = [];
        let cdcAIUsage: any = [];
        let usageTemp: any = [];
        // Reduce HTTP response into smaller array
        for (let x=0;x<cdcUsageTemp.length;x++) {
          usageTemp.push(cdcUsageTemp[x].body);
        }
        // separate the AI and SI objects into separate arrays for their specific usage calculations
        for (let i=0;i<usageTemp.length;i++) {
          if (usageTemp[i].monthly_reports !== undefined) {
            for (let k=0;k<usageTemp[i].monthly_reports.length;k++) {
              cdcAIUsage.push(usageTemp[i].monthly_reports[k]);
            }
          } else if (usageTemp[i].monthly_service_reports !== undefined) {
              for (let k=0;k<usageTemp[i].monthly_service_reports.length;k++) {
                cdcSIUsage.push(usageTemp[i].monthly_service_reports[k]);
              }
            }
        }
        // console.log("CDC SI Array: ", cdcSIUsage);
        this.calculateQuarterlyAIUsage(cdcAIUsage);
        this.calculateQuarterlySIUsage(cdcSIUsage);
        // this.mergeAllFoundationUsage();
        // console.log("CDC Q1 Usage: ", this.allAIUsageQ1);
      },
      error => this.errorMessage = <any>error
    ),

    // get non prod 1 foundation usage information to display total non-prod AI count
    this.platformService.getStageUsage("Stage").subscribe(
      usage => {

        let stageUsageTemp: any = usage
        let stageSIUsage: any = [];
        let stageAIUsage: any = [];
        let usageTemp: any = [];
        // Reduce HTTP response into smaller array
        for (let x=0;x<stageUsageTemp.length;x++) {
          usageTemp.push(stageUsageTemp[x].body);
        }
        // separate the AI and SI objects into separate arrays for their specific usage calculations
        for (let i=0;i<usageTemp.length;i++) {
          if (usageTemp[i].monthly_reports !== undefined) {
            for (let k=0;k<usageTemp[i].monthly_reports.length;k++) {
              stageAIUsage.push(usageTemp[i].monthly_reports[k]);
            }
          } else if (usageTemp[i].monthly_service_reports !== undefined) {
              for (let k=0;k<usageTemp[i].monthly_service_reports.length;k++) {
                stageSIUsage.push(usageTemp[i].monthly_service_reports[k]);
              }
            }
        }
        this.calculateQuarterlyAIUsage(stageAIUsage);
        this.calculateQuarterlySIUsage(stageSIUsage);
        // this.mergeAllFoundationUsage();
        // this.mergeAllFoundationUsage();
      },
      error => this.errorMessage = <any>error
    ),

    // get non prod 2 foundation usage
    this.platformService.getDevUsage("Dev").subscribe(
      usage => {

        let devUsageTemp: any = usage
        let devSIUsage: any = [];
        let devAIUsage: any = [];
        let usageTemp: any = [];
        // Reduce HTTP response into smaller array
        for (let x=0;x<devUsageTemp.length;x++) {
          usageTemp.push(devUsageTemp[x].body);
        }
        // console.log("Dev Usage Raw Array: ", usageTemp);
        // separate the AI and SI objects into separate arrays for their specific usage calculations
        for (let i=0;i<usageTemp.length;i++) {
          if (usageTemp[i].monthly_reports !== undefined) {
            for (let k=0;k<usageTemp[i].monthly_reports.length;k++) {
              devAIUsage.push(usageTemp[i].monthly_reports[k]);
            }
          } else if (usageTemp[i].monthly_service_reports !== undefined) {
              for (let k=0;k<usageTemp[i].monthly_service_reports.length;k++) {
                devSIUsage.push(usageTemp[i].monthly_service_reports[k]);
              }
            }
        }
        this.calculateQuarterlyAIUsage(devAIUsage);
        this.calculateQuarterlySIUsage(devSIUsage);
        // merge all captured foundation usage array values into a single nested object for HTML display
        // the below function relies on chronological insertion, based on the order of execution of the functions above
        // i.e. PDC records get inserted first, then CDC, etc.

        this.mergeAllFoundationUsage();
      },
      error => this.errorMessage = <any>error
    ),

    // UPDATE CODE: adjust calculation to pull lastest month of usage
    // pull back average AI counts for PROD only foundations
    this.platformService.getProdAIs('PDC','CDC').subscribe(
        prodAIs => {
          console.log('Prod AIs: ', prodAIs);
          // assigns the merged array of multiple foundations to a local array variable
          this.prodAIsTemp = prodAIs;
          // console.log("AI Array 1: ", this.allAIsTemp[0].yearly_reports);
          let usageTemp : any = [];
          // Reduce HTTP response into smaller array
          for (let x=0;x<prodAIs.length;x++) {
            usageTemp.push(prodAIs[x].body);
          }
          // loop through the larger array of foundations
          for (let i=0;i<usageTemp.length;i++) {
            this.prodAIs = usageTemp[i].yearly_reports
            console.log('Prod AI Yearly Report: ', this.prodAIs);
            // loop through inner array of of yearly app usage reports witihin each foundation
            for (let n=0;n<this.prodAIs.length;n++) {
              // console.log("Service Name: ", this.allSIsTemp[i].service_name);
              this.prodAIAvg += this.prodAIs[n].average_app_instances;
              // console.log("All SIs Temp Array: ", this.allSIs[i]);
            }

          }
          console.log('Prod AI Avg: ', this.prodAIAvg);
        },
        error => this.errorMessage = <any>error
    ),

    // pull back average SI counts for PROD only foundations
    this.platformService.getProdSIs('PDC','CDC').subscribe(
        prodSIs => {

          // assigns the merged array of multiple foundations to a local array variable
          this.prodSIsTemp = prodSIs;
          // console.log("SI Array 1: ", this.prodSIsTemp[0].yearly_service_report);

          let usageTemp : any = [];
          // Reduce HTTP response into smaller array
          for (let x=0;x<prodSIs.length;x++) {
            usageTemp.push(prodSIs[x].body);
          }
          // loop through the larger array of foundations
          for (let i=0;i<usageTemp.length;i++) {
            this.prodSIs = usageTemp[i].yearly_service_report;
            // loop through inner array of of yearly service reports witihin each foundation to capture details of each service instance
            for (let n=0;n<this.prodSIs.length;n++) {
              // console.log("Service Name: ", this.allSIsTemp[i].service_name);
              if ( (this.prodSIs[n].service_name.indexOf('redis') >= 0) ||
                  (this.prodSIs[n].service_name.indexOf('rabbitmq') >= 0) || (this.prodSIs[n].service_name.indexOf('mysql') >= 0)) {
                  this.prodSIAvg += this.prodSIs[n].average_instances;
              }
              // console.log("All SIs Temp Array: ", this.prodSIs[n]);
            }

          }

          console.log('Prod SI Avg: ', this.prodSIAvg);
        },
        error => this.errorMessage = <any>error
    );

    // pull back average AI counts for all foundations
    this.platformService.getAllAIs("PDC","CDC","Stage","Dev").subscribe(
        allAIs => {
          // assigns the merged array of multiple foundations to a private array variable
          this.allAIsTemp = allAIs;
          // console.log("AI Array 1: ", this.allAIsTemp[0].yearly_reports);

          let usageTemp : any = [];
          // Reduce HTTP response into smaller array
          for (let x=0;x<allAIs.length;x++) {
            usageTemp.push(allAIs[x].body);
          }
          // loop through the larger array of foundations
          for (let i=0;i<usageTemp.length;i++) {
            this.allAIs = usageTemp[i].yearly_reports;
            // loop through inner array of of yearly usage reports witihin each foundation
            for (let n=0;n<this.allAIs.length;n++) {
              // console.log("Service Name: ", this.allSIsTemp[i].service_name);
              this.allAIAvg += this.allAIs[n].average_app_instances;
              // console.log("All SIs Temp Array: ", this.allSIs[n]);
            }

          }
          console.log('All Avg AIs: ', this.allAIAvg);
        },

        error => this.errorMessage = <any>error
    ),

    // pull back average SI counts for all foundations
    this.platformService.getAllSIs('PDC','CDC','Stage','Dev').subscribe(
        allSIs => {
          // assigns the merged array of multiple foundations to a local array variable
          this.allSIsTemp = allSIs;
          // console.log("SI Array 1: ", this.allSIsTemp[0].yearly_service_report);

          let usageTemp : any = [];
          // Reduce HTTP response into smaller array
          for (let x=0;x<allSIs.length;x++) {
            usageTemp.push(allSIs[x].body);
          }
          // loop through the larger array of foundations
          for (let i=0;i<usageTemp.length;i++) {
            this.allSIs = usageTemp[i].yearly_service_report;
            // loop through inner array of of yearly service reports witihin each foundation to capture details of each service instance
            for (let n=0;n<this.allSIs.length;n++) {
              // console.log("Service Name: ", this.allSIsTemp[i].service_name);
              if ( (this.allSIs[n].service_name.indexOf('redis') >= 0) ||
                  (this.allSIs[n].service_name.indexOf('rabbitmq') >= 0) ||
                  (this.allSIs[n].service_name.indexOf('mysql') >= 0)) {
                  this.allSIAvg += this.allSIs[n].average_instances;
              }
              // console.log("All SIs Temp Array: ", this.allSIs[n]);
            }

          }
          console.log('All Avg SIs: ', this.allSIAvg);
        },

        error => this.errorMessage = <any>error
    ),

    // pull back average SI counts for all foundations
    this.platformService.getUsers('PDC','CDC','Stage','Dev').subscribe(user => {
          console.log("Users: ", user);
          // assigns the merged array of multiple foundations to a local array variable
          // this.usersTemp = user;
          let uTemp : any = [];
          uTemp = user;
          let usageTemp : any = [];
          // Reduce HTTP response into smaller array
          for (let x=0;x<user.length;x++) {
            usageTemp.push(user[x].body);
          }
          // loop through the larger object of foundations to filter out just the "resources" part
          for (let i=0;i<usageTemp.length;i++) {
            const count : number = usageTemp[i].resources.length;

            // loop through inner "resources" part to merge all "entity" objects into a single array
            for (let k=0;k<count;k++) {
              if (usageTemp[i].resources[k].entity.username !== undefined){
                this.users.push(usageTemp[i].resources[k].entity);
                // console.log("Username: ", uTemp[i].resources[k].entity.username);
              }
            }
          }
          // console.log("User Temp Array: ", this.users);
          // de-duplicate new users array to count unique users across multiple foundations
          let u = {};
          this.users.forEach( function( user ) {
            // let uname = user.username;
            // remove system users from user object
            if ( (user.username.indexOf('smoke_tests') !== -1) ||
                  (user.username.indexOf('push_apps_manager') !== -1) ||
                  (user.username.indexOf('system_services') !== -1)) {
              // do nothing to ignore system users
            } else {
              let userTemp = u[user.username] = u[user.username] || {};
              userTemp[user.username] = true;
            }
          });
          console.log('De-Dup Users Array: ', u);
          // calculate unique user count across all foundations
          this.userCount = Object.keys(u).length;
          // console.log("User Count 1: " , this.userCount);
          error => this.errorMessage = <any>error
    }),

    error => this.errorMessage = <any>error
  }

  onRatingClicked(message: string): void {
    this.pageTitle = 'Product List: ' + message;
  }
}
