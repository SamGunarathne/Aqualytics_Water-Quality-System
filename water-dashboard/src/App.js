import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";


function App(){

  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    const unsubscribe = onAuthStateChanged(auth,(currentUser)=>{

      setUser(currentUser);
      setLoading(false);

    });


    return ()=>unsubscribe();

  },[]);



  if(loading){
    return <h2>Loading...</h2>;
  }



  return (

    <>
    
    {
      user ?

      (
        <>
        
              {user ? (
        <Dashboard />
      ) : (
        <Login setUser={setUser} />
      )}


        <Dashboard/>

        </>
      )

      :

      (
        <Login/>
      )

    }


    </>

  );

}


export default App;