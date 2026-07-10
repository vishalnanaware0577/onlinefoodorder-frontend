import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

function TrackOrder() {

const { state } = useLocation();

const order = state?.order;

const steps = [
"placed",
"accepted",
"preparing",
"ready",
"picked_up",
"delivered"
];

const current = steps.indexOf(order?.order_status);

return (

<>

<Navbar/>

<section className="track-page">

<h1>Track Order</h1>

<div className="timeline">

{steps.map((step,index)=>(

<div
key={step}
className={
index<=current
?
"timeline-step active"
:
"timeline-step"
}
>

<div className="circle"/>

<div className="line"/>

<h3>{step.replace("_"," ")}</h3>

</div>

))}

</div>

</section>

</>

);

}

export default TrackOrder;