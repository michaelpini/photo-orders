import { CanActivateFn } from '@angular/router';
import {PhotoOrdersStore} from "../../store/photoOrdersStore";
import {inject} from "@angular/core";

export const allowIfAdminGuard: CanActivateFn = async (route, state) => {
  const store = inject(PhotoOrdersStore);
  const auth = await store.getAuth();
  return auth === 'admin';
};
