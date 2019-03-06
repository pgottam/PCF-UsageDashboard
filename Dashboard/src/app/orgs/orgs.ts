export interface IOrgs {
  
  resources: string;
  entity: {
    name: string;
    status: string;
  }
  metadata: {
    guid: string;
    created_at: string;
    updated_at: string;
  }

  app_usages: string;
  organization_guid: string;
  //duration_in_seconds: number;
  app_name: string;
  space_name: string;
}
