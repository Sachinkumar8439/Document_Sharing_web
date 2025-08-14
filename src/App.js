// import "./App.css";
import { BrowserRouter,} from "react-router-dom";
import { useAuthState } from "./Context/Authcontext";
import { useAppState } from "./Context/AppStateContext";
import RouteHandler from "./components/Routhandler";
import Progressbar from "./components/progress";


function App() {
  const {line,font} = useAppState()
  const {routes,} = useAuthState()
  
  return (
    <BrowserRouter>
        <div style={{ fontFamily:font}} className="App">
          <Progressbar line={line}/>  
         <RouteHandler routes={routes}/>
           
        </div>
    </BrowserRouter>
  );
}

export default App;
