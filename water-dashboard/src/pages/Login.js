import { useState } from "react";
import { auth } from "../firebase";

import {
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 sendPasswordResetEmail
} from "firebase/auth";


function Login(){

 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");

 const [signup,setSignup]=useState(false);



 const handleAuth = async()=>{

 try{


 if(signup){

   await createUserWithEmailAndPassword(
    auth,
    email,
    password
   );


   alert("Account Created Successfully");


 }
 else{


   await signInWithEmailAndPassword(
    auth,
    email,
    password
   );


 }



 }
 catch(error){

   alert(error.message);

 }


 };



 const resetPassword = async()=>{

 try{

 await sendPasswordResetEmail(
    auth,
    email
 );

 alert("Password reset email sent");


 }
 catch(error){

 alert(error.message);

 }

};



return(

<div style={styles.container}>


<div style={styles.card}>


<h1>
💧 AQUALYTICS
</h1>


<p>
Smart Water Monitoring System
</p>



<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={styles.input}
/>



<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={styles.input}
/>




<button
onClick={handleAuth}
style={styles.button}
>

{
signup
?
"Create Account"
:
"Login"
}

</button>



<p
onClick={()=>setSignup(!signup)}
style={styles.link}
>

{
signup
?
"Already have account? Login"
:
"Create new account"
}

</p>



<p
onClick={resetPassword}
style={styles.forgot}
>
Forgot Password?
</p>



</div>


</div>


);


}



const styles={


container:{

height:"100vh",
display:"flex",
justifyContent:"center",
alignItems:"center",

background:
"linear-gradient(135deg,#020617,#0f172a)"

},


card:{

width:"350px",
padding:"35px",

borderRadius:"25px",

background:
"rgba(255,255,255,0.08)",

backdropFilter:"blur(20px)",

textAlign:"center",

color:"white"

},


input:{

width:"100%",
padding:"12px",
margin:"10px 0",

borderRadius:"10px",

border:"none"

},


button:{

width:"100%",
padding:"12px",

borderRadius:"12px",

border:"none",

background:"#38bdf8",

fontWeight:"bold",

cursor:"pointer"

},


link:{

cursor:"pointer",
marginTop:"20px"

},


forgot:{

cursor:"pointer",
color:"#38bdf8"

}


}


export default Login;