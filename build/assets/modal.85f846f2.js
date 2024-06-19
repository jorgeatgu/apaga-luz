const h=[{day:"19/06/2024",hour:0,price:.141,zone:"valle"},{day:"19/06/2024",hour:1,price:.136,zone:"valle"},{day:"19/06/2024",hour:2,price:.131,zone:"valle"},{day:"19/06/2024",hour:3,price:.125,zone:"valle"},{day:"19/06/2024",hour:4,price:.125,zone:"valle"},{day:"19/06/2024",hour:5,price:.129,zone:"valle"},{day:"19/06/2024",hour:6,price:.134,zone:"valle"},{day:"19/06/2024",hour:7,price:.179,zone:"valle"},{day:"19/06/2024",hour:8,price:.184,zone:"llano"},{day:"19/06/2024",hour:9,price:.166,zone:"llano"},{day:"19/06/2024",hour:10,price:.183,zone:"punta"},{day:"19/06/2024",hour:11,price:.149,zone:"punta"},{day:"19/06/2024",hour:12,price:.144,zone:"punta"},{day:"19/06/2024",hour:13,price:.136,zone:"punta"},{day:"19/06/2024",hour:14,price:.087,zone:"llano"},{day:"19/06/2024",hour:15,price:.085,zone:"llano"},{day:"19/06/2024",hour:16,price:.085,zone:"llano"},{day:"19/06/2024",hour:17,price:.093,zone:"llano"},{day:"19/06/2024",hour:18,price:.165,zone:"punta"},{day:"19/06/2024",hour:19,price:.225,zone:"punta"},{day:"19/06/2024",hour:20,price:.22,zone:"punta"},{day:"19/06/2024",hour:21,price:.217,zone:"punta"},{day:"19/06/2024",hour:22,price:.166,zone:"llano"},{day:"19/06/2024",hour:23,price:.144,zone:"llano"}];function m(){setTimeout(()=>{const o=JSON.parse(localStorage.getItem("modalState"));if(!o||o.closed&&Date.now()>o.expiration){let e=new Date().getHours(),a=new Date().getMinutes();const r=790;e=e<10?`0${e}`:e,a=a<10?`0${a}`:a;const l=e*60+ +a>=r&&e<24?`
      <div class="modal-container">
      <div class="modal-background"></div>
        <div id="modal" class="modal-adsense">
          <center>
            <h1>Precio de la luz ma\xF1ana</h1>
            <p><a href="https://www.apaga-luz.com/precio-luz-manana/" class="button">VER</a></p>
            <p><a href="?=" class="reload-button">CERRAR</a></p>
          </center>
        </div>
      `:`
      <div class="modal-container">
      <div class="modal-background"></div>
        <div id="modal" class="modal-adsense">
          <center>
            <h1>Datos del precio de la luz</h1>
            <p><a href="https://www.apaga-luz.com/graficas/" class="button">VER</a></p>
            <p><a href="?=" class="reload-button">CERRAR</a></p>
          </center>
        </div>
      `,t=document.createElement("div");t.innerHTML=l,document.body.appendChild(t),document.querySelectorAll(".reload-button, .button").forEach(c=>{c.addEventListener("click",()=>{const d=new Date,i={closed:!0,expiration:new Date(d.getTime()+18e5).getTime()};localStorage.setItem("modalState",JSON.stringify(i));const n=document.getElementById("modal");n&&(n.style.display="none")})})}},4250)}export{h as d,m as s};
