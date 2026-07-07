import React from "react";
import {
  FaTint,
  FaWater,
  FaThermometerHalf,
  FaFlask,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";


function WaterData({
  data,
  anomalies,
  darkMode
}) {


  // =========================
  // SENSOR STATUS CHECK
  // =========================

  const checkStatus = (type, value) => {

    if(type === "ph"){
      return value >= 6.5 && value <= 8.5;
    }

    if(type === "turbidity"){
      return value <= 5;
    }

    if(type === "temperature"){
      return value >= 20 && value <= 30;
    }

    if(type === "tds"){
      return value >= 300 && value <= 600;
    }

    return false;
  };


  const sensors = [

    {
      name:"pH Level",
      key:"ph",
      value:data.ph,
      unit:"",
      range:"6.5 - 8.5",
      icon:<FaTint/>
    },

    {
      name:"Turbidity",
      key:"turbidity",
      value:data.turbidity,
      unit:" NTU",
      range:"0 - 5 NTU",
      icon:<FaWater/>
    },


    {
      name:"Temperature",
      key:"temperature",
      value:data.temperature,
      unit:" °C",
      range:"20 - 30 °C",
      icon:<FaThermometerHalf/>
    },


    {
      name:"TDS",
      key:"tds",
      value:data.tds,
      unit:" ppm",
      range:"300 - 600 ppm",
      icon:<FaFlask/>
    }

  ];



  // =========================
  // OVERALL HEALTH
  // =========================

  const goodSensors = sensors.filter(
    sensor =>
    checkStatus(sensor.key, sensor.value)
  );


  const overallGood =
    goodSensors.length === 4;



  return (

<div
style={{

padding:"20px",

background:
darkMode
?
"#0f172a"
:
"#f8fafc",

minHeight:"100vh"

}}
>


{/* TITLE */}

<h1
style={{
color:darkMode
?
"#38bdf8"
:
"#0284c7"
}}
>
💧 Water Quality Analysis
</h1>



{/* OVERALL CARD */}

<div
style={{
marginTop:"20px",

padding:"25px",

borderRadius:"20px",

background:
darkMode
?
"#111827"
:
"white",

boxShadow:"0 10px 30px rgba(0,0,0,.15)"

}}
>


<h2>
Overall Water Condition
</h2>


<h1
style={{
color:
overallGood
?
"#22c55e"
:
"#f59e0b"
}}
>

{
overallGood
?
"🟢 SAFE WATER"
:
"🟡 WARNING"
}

</h1>


<p
style={{
color:darkMode
?
"#cbd5e1"
:
"#475569",

fontSize:"16px"
}}
>

{
overallGood
?
"All water parameters are within safe limits. Water quality is good for usage."
:
"Some parameters are outside recommended range. Check abnormal data."
}

</p>


</div>





{/* SENSOR CARDS */}


<div
style={{
display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(230px,1fr))",

gap:"20px",

marginTop:"25px"

}}
>


{
sensors.map((sensor)=>(


<div
key={sensor.key}

style={{

background:
darkMode
?
"#111827"
:
"white",

padding:"25px",

borderRadius:"20px",

border:
"1px solid rgba(56,189,248,.2)",

boxShadow:
"0 8px 20px rgba(0,0,0,.1)"

}}

>


<div
style={{
fontSize:"35px",
color:"#38bdf8"
}}
>

{sensor.icon}

</div>


<h2
style={{
color:darkMode
?
"white"
:
"#0f172a"
}}
>

{sensor.name}

</h2>



<h1>

{sensor.value}
{sensor.unit}

</h1>



<p>

Safe Range:
<br/>

{sensor.range}

</p>



<p
style={{
color:
checkStatus(sensor.key,sensor.value)
?
"#22c55e"
:
"#ef4444",

fontWeight:"bold"

}}
>

{
checkStatus(sensor.key,sensor.value)
?
"✓ GOOD"
:
"⚠ ABNORMAL"
}

</p>


</div>


))

}


</div>





{/* ABNORMAL DATA */}


<div
style={{
marginTop:"30px",

background:
darkMode
?
"#111827"
:
"white",

padding:"25px",

borderRadius:"20px"

}}
>


<h2
style={{
color:"#f59e0b"
}}
>

⚠ Abnormal Data Detection

</h2>



{

anomalies.length === 0 ?

(

<p
style={{
color:"#22c55e",
fontWeight:"bold"
}}
>

<FaCheckCircle/>
{" "}
No abnormal readings detected.

</p>

)

:

(

anomalies.map((a,index)=>(

<div
key={index}

style={{

padding:"15px",

marginTop:"10px",

borderRadius:"12px",

background:"rgba(239,68,68,.1)"

}}
>

<h3>

<FaExclamationTriangle/>
{" "}
{a.sensor.toUpperCase()}

</h3>


<p>
Value : {a.value}
</p>


<p>
Severity : {a.severity}
</p>


</div>


))

)

}


</div>


</div>


  );

}


export default WaterData;