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

> [!NOTE]  
> To manage users, add and edit projects, you must log in with an admin account.  
> Contact [michael.roland.pini@outlook.com](mailto:michael.roland.pini@outlook.com) to apply for a test account.

### Permissions:

| Login | Home page | User data  | Project data | Photos            |
|-------|-----------|------------|--------------|-------------------|
| n/a   | view      | --         | --           | --                |
| User  | view      | edit own   | view own     | download          |
| Admin | view      | add / edit | add / edit   | upload / download |

 

## Dependencies
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.0.5.  
This Angular application uses ***signals*** with `provideExperimentalZonelessChangeDetection`  
Additional dependencies:  
- [NgRx/Signals](https://ngrx.io/guide/signals) store version 19.0.0
- [Bootstrap](https://getbootstrap.com/) version 5.3.3
- [NG Bootstrap](https://ng-bootstrap.github.io/) component library version 18.0.0
- [RxJS](https://rxjs.dev/guide/overview) version 7.8.0
- [Firebase SDK](https://github.com/firebase/firebase-js-sdk) 11.1.0

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

