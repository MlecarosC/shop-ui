import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';


export const woocommerceInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/wc/v3/')) {
    const modifiedReq = req.clone({
      setParams: {
        consumer_key: environment.woocommerce.consumerKey,
        consumer_secret: environment.woocommerce.consumerSecret
      }
    });
    return next(modifiedReq);
  }
  
  return next(req);
};
