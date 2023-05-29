import { useSelector } from "react-redux"
import { ProtectedRoutes, NonProtectedRoutes } from "./utils/routes"
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "./components/Loader/Loader";
import useAuth from "./hooks/UseAuth";
import useSocket from "./hooks/UseSocket";
import { useEffect } from "react";

function App() {
  const { login, loading } = useSelector(state => state.generalReducer)  
  useAuth(); 
  const {initialise} = useSocket();

  useEffect(()=>{
    if(login){
      initialise();
    }
  },[login])

  return (
    <>
      {loading && <Loader />}
      {
        login ? (
          <>
            <ProtectedRoutes />
          </>
        ) : (
          <>
            <NonProtectedRoutes />
          </>
        )
      }
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
