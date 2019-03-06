import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { OrgListComponent } from './orgs/org-list.component';
import { FormsModule } from '@angular/forms';
import { ConvertToSpacesPipe } from './shared/convert-to-spaces.pipe';
import { StarComponent } from './shared/star.component';
import { WelcomeComponent } from './home/welcome.component'

import { RouterModule } from '@angular/router';
import { OrgSummaryComponent } from './orgs/org-summary.component';
import { SpaceSummaryComponent } from './spaces/space-summary.component';
import { PlatformSummaryComponent } from './platform-summary/platform-summary.component';

@NgModule({
  declarations: [ AppComponent, PlatformSummaryComponent, OrgListComponent, OrgSummaryComponent, SpaceSummaryComponent, ConvertToSpacesPipe, StarComponent, WelcomeComponent ],
  imports: [ BrowserModule, FormsModule, HttpClientModule, CommonModule,
    RouterModule.forRoot([
      { path: 'orgs', component: OrgListComponent },
      { path: 'orgSummary', component: OrgSummaryComponent},
      { path: 'spaceSummary', component: SpaceSummaryComponent},
      //{ path: 'orgDetails/:guid', component: OrgDetailComponent},
      { path: 'summary', component: PlatformSummaryComponent },
      //{ path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: '**', redirectTo: 'summary', pathMatch: 'full' }
    ])
  ],

  bootstrap: [ AppComponent ]
})
export class AppModule { }
