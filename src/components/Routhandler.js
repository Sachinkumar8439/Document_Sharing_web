// RouteHandler.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import routes from "../configs/routconfig";
import Loading from "../components/Loading";

const RouteHandler = ({routes}) => {
  return (
    <React.Suspense fallback={<Loading/>}>
      <Routes>
        {routes.map(({ path, component: Component, isvalid,direct,props }) => (
          <Route
            key={path}
            path={path}
            element={isvalid ? <Component props={props} /> : <Navigate to={direct} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </React.Suspense>
  );
};

export default RouteHandler;
