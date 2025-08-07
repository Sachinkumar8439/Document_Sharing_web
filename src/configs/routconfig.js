// routes.js
import React from "react";
const SignupForm = React.lazy(()=>import("../components/WithEmail")) 
const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const LoginForm = React.lazy(() => import("../pages/LoginPage"));
const Dashboard = React.lazy(() => import("../pages/DashboardPage"));
const Verify = React.lazy(() => import("../pages/verify"));
const ResetPasswordForm  = React.lazy(() => import("../pages/resetpassword"));
const setRoutes = async (user)=>{
    const routes = [
  {
    path: "/",
    component: LandingPage,
    isvalid: user ? false :true ,
    direct:`/user/${user?.$id}` 
},
{
    path: "/signupWithEmail",
    component: SignupForm,
    isvalid: user ? false :true,
    direct:"/",  
},
  {
      path: "/signin",
      component: LoginForm,
      isvalid: user ? false :true,
      direct:"/",  
    },
    {
        path: "/user/:id",
        component: Dashboard,
        isvalid: user ? true:false,
        direct:"/" 
    },
    {
        path: "/verify",
        component: Verify,
        isvalid: true,
        direct:"/" 
    },
    {
        path: "/reset-password",
        component: ResetPasswordForm,
        isvalid: true,
        direct:"/" 
    },
    
];

return routes;

}
export default setRoutes;
