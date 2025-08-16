// routes.js
import React from "react";
import { sections, footerData } from "../data";
const SignupForm = React.lazy(()=>import("../components/WithEmail")) 
const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const LoginForm = React.lazy(() => import("../pages/LoginPage"));
const Dashboard = React.lazy(() => import("../pages/DashboardPage"));
const Verify = React.lazy(() => import("../pages/verify"));
const ResetPasswordForm  = React.lazy(() => import("../pages/resetpassword"));
const DocumentationComponent  = React.lazy(() => import("../pages/DocumentationComponent"));
const contactpage  = React.lazy(() => import("../pages/contactpage"));
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
    {
        path: "/documentation",
        component: DocumentationComponent,
        props:{sections,footerData},
        isvalid: true,
        direct:"/" 
    },
    {
        path: "/contact",
        component: contactpage,
        isvalid: true,
        direct:"/" 
    },
    
];

return routes;

}
export default setRoutes;
