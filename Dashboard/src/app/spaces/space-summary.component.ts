import { Component, OnInit } from '@angular/core';
import { ISpaces } from './spaces';
import { SpaceService } from './space.service';
//import { IOrgUsage } from './orgUsage';
//import { OrgAppUsageService } from './org-app-usage.service'

@Component ({
  //selector: 'cb-orgSummary',
  templateUrl: './space-summary.component.html',
  styleUrls: ['./space-summary.component.css']
})

export class SpaceSummaryComponent implements OnInit {
  pageTitle: string = '[space name] Summary';
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
    this.filteredSpaces=this.listFilter ? this.performFilter(this.listFilter) : this.spaces;
  }

  filteredSpaces: ISpaces[] = [];
  spaces : ISpaces[] = [];
  spaceTemp : any = [];

  spaceUsageTemp : any = [];
  spaceUsage : ISpaces[] = [];


  constructor(private spaceService: SpaceService) {}

  performFilter(filterBy: string): ISpaces[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.spaces.filter((org: any) =>
          org.entity.name.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }

  ngOnInit() {
    /*this.orgService.getOrgs().subscribe(
        orgs => {
            this.orgs = orgs;
            this.filteredSpaces = this.orgs;
        },
        error => this.errorMessage = <any>error
    );*/

    //call "org" service and parse JSON object into a readable array

    this.spaceService.getSpaces().subscribe(spaces => {
        this.spaceTemp = spaces["resources"];
        this.spaces = this.spaceTemp;
        this.filteredSpaces = this.spaces;
        console.log("Spaces Array: ", this.spaces);

        /*Object.keys(data).map(key => {
          if (key === 'resources') {
            data[key].map(obj => {
              this.spaceTemp.push(obj);
            });
            this.spaces = this.spaceTemp;
            this.filteredSpaces = this.spaces;
          }
          //console.log('data: ', data);
        });*/

        //Use org array to then loop through usage data request

        /*for (let org of this.spaces) {
          this.spaceService.getSpaceUsage().subscribe(
            usage => {
              //console.log("Usage Data: ", usage);
              this.spaceUsageTemp = usage[1];
              this.spaceUsageTemp = this.spaceUsageTemp["app_usages"];
              this.spaceUsage = this.spaceUsageTemp;
              //this.spaces.push(this.spaceUsage);
              //console.log("New Orgs Array: ", this.spaces)
              //console.log("Usage[0] ", usage[0]);
              console.log("Usage[1] ", usage[1]);
              console.log("App Usage: ", this.spaceUsage);
          });
          //console.log('Org GUID:', org.metadata.guid);

        }*/

    });
    error => this.errorMessage = <any>error
  }

  onRatingClicked(message: string): void {
    this.pageTitle = 'Product List: ' + message;
  }
}
