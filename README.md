# Photo Orders
<img alt="PiniStudios Logo" src="public/pinistudios_200.png" width="150">

This application is intended for freelance photographers to manage photo-shooting 
projects.  
Customers can be signed up to view their projects and download their photos.  

### Main features are:
- user management
- project management: 
  - details
  - quotation
  - invoice
  - photo gallery (upload / download photos)
- dashboard (project status / financials)

> [!NOTE]  
> To manage users, add and edit projects, you must log in with an admin account.  
> Contact [michael.roland.pini@outlook.com](mailto:michael.roland.pini@outlook.com) to apply for a test account.

### Permissions:

| Login | Home page | User data  | Project data | Photos            | Dashboard |
|-------|-----------|------------|--------------|-------------------|-----------|
| n/a   | view      | --         | --           | --                | --        |
| User  | view      | edit own   | view own     | download          | view      |
| Admin | view      | add / edit | add / edit   | upload / download | view      |

 

## Dependencies
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.0.5.  
This Angular application uses ***signals*** with `provideExperimentalZonelessChangeDetection`  
Additional dependencies:  
- [NgRx/Signals](https://ngrx.io/guide/signals) v19.0.0 (data store)
- [Bootstrap](https://getbootstrap.com/) v5.3.3 (CSS framework)
- [NG Bootstrap](https://ng-bootstrap.github.io/) v18.0.0 (component library)
- [RxJS](https://rxjs.dev/guide/overview) v7.8.0
- [Firebase SDK](https://github.com/firebase/firebase-js-sdk) v11.1.0 (Google Firebase Database)
- [Docxtemplater](https://docxtemplater.com/) v3.55.8 (Word export library)
- [ngx-charts](https://www.npmjs.com/package/@swimlane/ngx-charts?activeTab=readme) v21.1.2 (Charting library)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

