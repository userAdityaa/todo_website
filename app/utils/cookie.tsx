import {cookies} from 'next/headers';


export const getCookie = async () => { 

        const cookieStore = await cookies();
        const userInfo = cookieStore.get('userInfo');
        if (userInfo?.value) {
            const userObj = JSON.parse(userInfo.value);
            return userObj;
          }
      };
    
getCookie();