import { Component, OnInit } from '@angular/core';
import { IOrgs } from './orgs';
import { OrgService } from './org.service';
import { IOrgUsage } from './orgUsage';
//import { OrgAppUsageService } from './org-app-usage.service'

@Component ({
  //selector: 'cb-orgSummary',
  templateUrl: './org-summary.component.html',
  styleUrls: ['./org-summary.component.css']
})

export class OrgSummaryComponent implements OnInit {
  pageTitle: string = '[org name] Summary';
  /*imageWidth: number = 50;
  imageMargin: number = 2
  showImage: boolean = false;*/

  _listFilter: string;
  errorMessage: any;

  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value:string) {
    this._listFilter = value
    this.filteredOrgs=this.listFilter ? this.performFilter(this.listFilter) : this.orgs;
  }

  filteredOrgs: IOrgs[] = [];
  orgs : IOrgs[] = [];
  orgTemp : any = [];

  orgUsageTemp : any = [];
  orgUsage : IOrgUsage[] = [];


  constructor(private orgService: OrgService) {}

  performFilter(filterBy: string): IOrgs[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.orgs.filter((org: any) =>
          org.entity.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  ngOnInit() {
    /*this.orgService.getOrgs().subscribe(
        orgs => {
            this.orgs = orgs;
            this.filteredOrgs = this.orgs;
        },
        error => this.errorMessage = <any>error
    );*/

    //call "org" service and parse JSON object into a readable array

  /*  this.orgService.getOrgs().subscribe(orgs => {
        this.orgTemp = orgs["resources"];
        this.orgs = this.orgTemp;
        this.filteredOrgs = this.orgs;
        console.log("Orgs Array: ", this.orgs);*/


        /*Object.keys(data).map(key => {
          if (key === 'resources') {
            data[key].map(obj => {
              this.orgTemp.push(obj);
            });
            this.orgs = this.orgTemp;
            this.filteredOrgs = this.orgs;
          }
          //console.log('data: ', data);
        });*/

        //console.log('Orgs Array: ', this.orgs)

        //Use org array to then loop through usage data request

        /*for (let org of this.orgs) {
          this.orgService.getOrgUsage().subscribe(
            usage => {
              //console.log("Usage Data: ", usage);
              this.orgUsageTemp = usage[1];
              this.orgUsageTemp = this.orgUsageTemp["app_usages"];
              this.orgUsage = this.orgUsageTemp;
              //this.orgs.push(this.orgUsage);
              //console.log("New Orgs Array: ", this.orgs)
              //console.log("Usage[0] ", usage[0]);
              console.log("Usage[1] ", usage[1]);
              console.log("App Usage: ", this.orgUsage);
          });
          //console.log('Org GUID:', org.metadata.guid);

        }*/

  /*  });
    error => this.errorMessage = <any>error*/
  }

  onRatingClicked(message: string): void {
    this.pageTitle = 'Product List: ' + message;
  }
}
