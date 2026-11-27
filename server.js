
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, "..", "data", "donors.json");
app.use(express.json({limit:"100kb"}));
app.use(express.static(path.join(__dirname,"..")));

const sampleDonors = [
 {id:1,name:"Ravi",blood:"O+",location:"Vijayawada",phone:"9876543210",lat:16.5062,lng:80.6480},
 {id:2,name:"Priya",blood:"A+",location:"Vijayawada",phone:"8765432109",lat:16.5151,lng:80.6326},
 {id:3,name:"Suresh",blood:"B+",location:"Guntur",phone:"7654321098",lat:16.3067,lng:80.4365},
 {id:4,name:"Anitha",blood:"AB+",location:"Vijayawada",phone:"9123456780",lat:16.5200,lng:80.6200},
 {id:5,name:"Kiran",blood:"O-",location:"Tadepalli",phone:"9234567810",lat:16.4820,lng:80.6000},
 {id:6,name:"Deepika",blood:"B-",location:"Poranki",phone:"9345678120",lat:16.4700,lng:80.7150}
];
const hospitals = [
 {id:1,name:"Government General Hospital (GGH)",area:"Vijayawada",phone:"Verify with hospital",lat:16.5193,lng:80.6360},
 {id:2,name:"Andhra Hospitals",area:"Vijayawada",phone:"Verify with hospital",lat:16.5100,lng:80.6400},
 {id:3,name:"Ramesh Hospitals",area:"Vijayawada",phone:"Verify with hospital",lat:16.5068,lng:80.6350},
 {id:4,name:"Sentini Hospitals",area:"Poranki area",phone:"Verify with hospital",lat:16.4700,lng:80.7150},
 {id:5,name:"Manipal Hospitals",area:"Tadepalli area",phone:"Verify with hospital",lat:16.4850,lng:80.6000}
];
function init(){fs.mkdirSync(path.dirname(DATA),{recursive:true});if(!fs.existsSync(DATA))fs.writeFileSync(DATA,JSON.stringify(sampleDonors,null,2));}
function read(){init();return JSON.parse(fs.readFileSync(DATA,"utf8"));}
function write(rows){fs.writeFileSync(DATA,JSON.stringify(rows,null,2));}
function valid(lat,lng){return Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180;}
function km(a,b){const r=Math.PI/180,d1=(b.lat-a.lat)*r,d2=(b.lng-a.lng)*r,x=Math.sin(d1/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(d2/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

app.get("/api/health",(_q,s)=>s.json({status:"ok"}));
app.get("/api/donors",(_q,s)=>s.json(read()));
app.get("/api/hospitals",(_q,s)=>s.json(hospitals));
app.post("/api/donors",(req,res)=>{
 const {name,blood,location,phone,lat,lng}=req.body||{};
 const groups=["A+","A-","B+","B-","O+","O-","AB+","AB-"];
 if(![name,blood,location,phone].every(x=>typeof x==="string"&&x.trim()))return res.status(400).json({error:"Name, blood group, location and phone are required."});
 if(!groups.includes(blood))return res.status(400).json({error:"Invalid blood group."});
 if(!/^[0-9+\-\s]{7,15}$/.test(phone.trim()))return res.status(400).json({error:"Enter a valid phone number."});
 const hasLat=lat!==null&&lat!==undefined&&lat!=="",hasLng=lng!==null&&lng!==undefined&&lng!=="";
 if(hasLat!==hasLng)return res.status(400).json({error:"Provide both GPS coordinates or neither."});
 const la=hasLat?Number(lat):null,lo=hasLng?Number(lng):null;
 if(hasLat&&!valid(la,lo))return res.status(400).json({error:"Invalid GPS coordinates."});
 const rows=read(),donor={id:Date.now(),name:name.trim(),blood,location:location.trim(),phone:phone.trim(),lat:la,lng:lo};
 rows.push(donor);write(rows);res.status(201).json(donor);
});
app.delete("/api/donors/:id",(req,res)=>{
 const rows=read(),next=rows.filter(d=>d.id!==Number(req.params.id));
 if(next.length===rows.length)return res.status(404).json({error:"Donor not found."});
 write(next);res.json({message:"Donor deleted."});
});
app.get("/api/nearest-donor",(req,res)=>{
 const blood=String(req.query.blood||""),lat=Number(req.query.lat),lng=Number(req.query.lng);
 if(!["A+","A-","B+","B-","O+","O-","AB+","AB-"].includes(blood))return res.status(400).json({error:"Select a valid blood group."});
 if(!valid(lat,lng))return res.status(400).json({error:"Valid patient GPS coordinates are required."});
 const patient={lat,lng};
 const matches=read().filter(d=>d.blood===blood&&valid(Number(d.lat),Number(d.lng))).map(d=>({...d,distanceKm:km(patient,{lat:Number(d.lat),lng:Number(d.lng)})})).sort((a,b)=>a.distanceKm-b.distanceKm);
 if(!matches.length)return res.status(404).json({error:`No ${blood} donors with GPS coordinates found.`});
 const donor=matches[0],nearestHospital=hospitals.map(h=>({...h,distanceKm:km({lat:donor.lat,lng:donor.lng},h)})).sort((a,b)=>a.distanceKm-b.distanceKm)[0];
 res.json({donor,nearestHospital,patient,matchCount:matches.length});
});
app.get("*",(_q,res)=>res.sendFile(path.join(__dirname,"..","index.html")));
init();
app.listen(PORT,()=>console.log(`Server running: http://localhost:${PORT}`));
