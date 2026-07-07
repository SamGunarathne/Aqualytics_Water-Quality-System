import React from "react";
import {
  FaTint,
  FaWater,
  FaThermometerHalf,
  FaFlask
} from "react-icons/fa";


function InfoCard({
  title,
  value,
  icon,
  darkMode
}) {

return (

<div
style={{
background: darkMode ? "#0f172a":"#ffffff",
padding:"20px",
borderRadius:"18px",
border:"1px solid rgba(56,189,248,.2)",
textAlign:"center"
}}
>

<h2>{icon}</h2>

<p
style={{
color:"#94a3b8"
}}
>
{title}
</p>

<h2
style={{
color:darkMode?"white":"#0f172a"
}}
>
{value}
</h2>


</div>

)

}



function SensorDetails({

selectedSensor,
data,
prediction,
anomalies,
history,
darkMode,
setPage,
setSelectedSensor

}) {


const sensors = {


ph:{
title:"pH Level",
unit:"",
icon:<FaFlask/>,
safe:"6.5 - 8.5",
description:
"pH indicates how acidic or alkaline the water is. Balanced pH is important for safe drinking water."
},


turbidity:{
title:"Turbidity",
unit:"NTU",
icon:<FaWater/>,
safe:"0 - 5 NTU",
description:
"Turbidity measures water clarity and suspended particles."
},


temperature:{
title:"Temperature",
unit:"°C",
icon:<FaThermometerHalf/>,
safe:"20 - 30 °C",
description:
"Temperature affects water quality and bacterial growth."
},


tds:{
title:"TDS",
unit:"ppm",
icon:<FaTint/>,
safe:"300 - 600 ppm",
description:
"TDS measures dissolved minerals and substances in water."
}


};



const info = sensors[selectedSensor];


if(!info){

return(

<div>

<h2>No Sensor Selected</h2>

<button
onClick={()=>setPage("dashboard")}
>
Back
</button>

</div>

)

}



const value =
data[selectedSensor] || 0;


const predict =
prediction[selectedSensor] || 0;


const anomaly =
anomalies.find(
(a)=>a.sensor===selectedSensor
);



let status="GOOD";


if(selectedSensor==="ph" &&
(value<6.5 || value>8.5))
status="WARNING";


if(selectedSensor==="turbidity" &&
value>5)
status="WARNING";


if(selectedSensor==="tds" &&
value>600)
status="WARNING";


if(selectedSensor==="temperature" &&
(value<20 || value>30))
status="WARNING";





return (

<div
style={{
background:darkMode
?"linear-gradient(135deg,#0f172a,#1e293b)"
:"#ffffff",

padding:"30px",

borderRadius:"25px"
}}
>








{/* HEADER */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"30px"
}}
>


<div>

<h1
style={{
color:darkMode?"white":"#0f172a"
}}
>

{info.icon} {info.title}

</h1>


<p
style={{
color:"#94a3b8"
}}
>
AI Smart Water Monitoring
</p>


</div>



<div
style={{

background:
status==="GOOD"
?
"#22c55e"
:
"#f59e0b",

padding:"12px 25px",

borderRadius:"30px",

color:"white",

fontWeight:"bold"

}}
>

{status}

</div>


</div>





{/* SUMMARY */}


<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",

gap:"20px"

}}

>


<InfoCard

title="Current Value"

value={`${value} ${info.unit}`}

icon="📊"

darkMode={darkMode}

/>



<InfoCard

title="Prediction"

value={`${Number(predict).toFixed(2)} ${info.unit}`}

icon="🤖"

darkMode={darkMode}

/>




<InfoCard

title="Safe Range"

value={info.safe}

icon="🛡️"

darkMode={darkMode}

/>



<InfoCard

title="Health Score"

value={status==="GOOD"?"95%":"45%"}

icon="💧"

darkMode={darkMode}

/>


</div>






{/* HEALTH */}


<div

style={{

marginTop:"30px",

background:darkMode?"#111827":"#f8fafc",

padding:"25px",

borderRadius:"20px"

}}

>


<h2
style={{
color:"#38bdf8"
}}
>

💧 Water Health

</h2>



<h1
style={{
color:
status==="GOOD"
?
"#22c55e"
:
"#f59e0b"
}}
>

{
status==="GOOD"
?
"Healthy Water"
:
"Check Required"
}

</h1>



<p
style={{
color:darkMode?"#cbd5e1":"#334155"
}}
>

AI system continuously monitors this sensor value and evaluates water quality.

</p>


</div>





{/* ABOUT */}


<div

style={{

marginTop:"25px",

background:darkMode?"#111827":"#ffffff",

padding:"25px",

borderRadius:"20px"

}}

>


<h2
style={{
color:"#38bdf8"
}}
>

📖 About Sensor

</h2>


<p
style={{
color:darkMode?"#cbd5e1":"#334155",
lineHeight:"30px"
}}
>

{info.description}

</p>


</div>









</div>


)

}



export default SensorDetails;